import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Container, Typography, Box, TextField, InputAdornment, IconButton, Paper } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import { useNavigate } from 'react-router-dom';
import { useOptions } from '../context/OptionsContext';
import { UserContext } from '../context/UserContext';
import ChatMessage from '../components/ChatMessage';
import { motion, AnimatePresence } from 'framer-motion';
import Groq from 'groq-sdk';
import { runGroqConversation } from '../services/groqService';
import axios from 'axios';

const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const tools = [
  {
    type: 'function',
    function: {
      name: 'get_recommendations',
      description: "Get restaurant recommendations for a user based on their order history and an optional query.",
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Optional: A specific query for recommendations, e.g., "something spicy" or "a cheap lunch near me".',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_food_options',
      description: 'Generates a list of food options based on a user query.',
      parameters: {
        type: 'object',
        properties: {
          input_text: {
            type: 'string',
            description: 'The user\'s query, e.g., "what kind of pizza is there?" or "show me some salads".',
          },
        },
        required: ['input_text'],
      },
    },
  },
];

const HomePage = ({ chatHistory, setChatHistory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatView, setIsChatView] = useState(chatHistory.length > 0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useContext(UserContext);
  const { error } = useOptions();
  const navigate = useNavigate();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const chatEndRef = useRef(null);

  const handleSubmit = useCallback(async (query) => {
    if (!query.trim() || !user) return;

    const newMessages = [...chatHistory, { role: 'user', content: query }];
    setChatHistory(newMessages);
    setIsChatView(true);
    setSearchTerm('');
    setIsProcessing(true);

    try {
      const responseMessage = await runGroqConversation(newMessages, user);

      const historyWithTools = [...newMessages];
      if (responseMessage.tool_calls) {
        historyWithTools.push(responseMessage);
        const finalResponse = await runGroqConversation(historyWithTools, user);
        setChatHistory(prev => [...prev, finalResponse]);
      } else {
        setChatHistory(prev => [...prev, responseMessage]);
      }

    } catch (e) {
      console.error('Error getting completion:', e);
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setIsProcessing(false);
    }
  }, [user, chatHistory, setChatHistory]);

  const handleOrder = useCallback((itemName) => {
    const prompt = `Yes, please order the ${itemName}.`;
    handleSubmit(prompt);
  }, [handleSubmit]);

  const get_recommendations = useCallback(async ({ query }) => {
    if (!user || !user.user_id) return { error: 'User not logged in' };
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/recommendations`, {
        params: { user_id: user.user_id, query },
      });
      return response.data;
    } catch (err) {
      console.error('Error getting recommendations:', err);
      return { error: 'Failed to fetch recommendations.' };
    }
  }, [user]);

  const generate_food_options = useCallback(async ({ input_text }) => {
    if (!user || !user.email) return { error: 'User not logged in' };
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/generate_options`, {
        email: user.email,
        input_text,
      });
      return response.data;
    } catch (err) {
      console.error('Error generating food options:', err);
      return { error: 'Failed to generate food options.' };
    }
  }, [user]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }
    setIsRecording(false);
  }, []);

  const checkForSilence = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(dataArray);
    const isSilent = !dataArray.some(v => v > 128 + 5 || v < 128 - 5);

    if (isSilent) {
      if (!silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          stopRecording();
        }, 1500);
      }
    } else if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (mediaRecorderRef.current?.state === 'recording') {
      requestAnimationFrame(checkForSilence);
    }
  }, [stopRecording]);

  const handleTranscription = useCallback(async () => {
    if (audioChunksRef.current.length === 0) {
      return;
    }

    setIsProcessing(true); // Set processing for the entire voice-to-response flow

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];
    const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });

    try {
      const transcription = await groq.audio.transcriptions.create({
        file: file,
        model: 'whisper-large-v3',
      });
      setSearchTerm(transcription.text);
      await handleSubmit(transcription.text); // Await the full roundtrip
    } catch (e) {
      console.error('Error during voice processing:', e);
      setChatHistory(prev => [...prev, { sender: 'ai', text: 'Sorry, there was an error processing your voice message.' }]);
      setIsProcessing(false); // Ensure processing is turned off on error
    }
  }, [handleSubmit, setChatHistory]);

  const startRecording = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setIsChatView(true);
        setIsRecording(true);
        audioChunksRef.current = [];
        mediaRecorderRef.current = new MediaRecorder(stream);

        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
        source.connect(analyserRef.current);

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = handleTranscription;

        mediaRecorderRef.current.start();
        checkForSilence();
      })
      .catch(err => console.error('Error getting media device:', err));
  }, [checkForSilence, handleTranscription]);

  useEffect(() => {
    if (chatHistory.length > 0) {
      setIsChatView(true);
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleTextSubmit = (event) => {
    if (event.key === 'Enter' && !isProcessing) {
      handleSubmit(searchTerm);
    }
  };

  return (
    <Container sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence>
        {!isChatView ? (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
          >
            <Typography variant="h2" component="h1" align="center" gutterBottom>
              Discover Your Next Favorite Meal
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
              Search by text or use your voice
            </Typography>
            <Box sx={{ my: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <TextField 
                fullWidth
                variant="outlined"
                placeholder="I'm looking for..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleTextSubmit}
                disabled={isProcessing}
                sx={{ maxWidth: 700, bgcolor: 'background.paper', borderRadius: 1 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleMicClick} edge="end" color={isRecording ? 'primary' : 'default'} disabled={isProcessing}>
                        <MicIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              {isRecording && <Typography variant="body1" align="center" sx={{ mt: 2 }}>Listening...</Typography>}
              {isProcessing && !isRecording && <Typography variant="body1" align="center" sx={{ mt: 2 }}>Thinking...</Typography>}
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}
          >
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
              {chatHistory.map((msg, index) => (
                <ChatMessage key={index} message={msg} onOrder={handleOrder} />
              ))}
              {isRecording && <ChatMessage message={{ sender: 'ai', text: 'Listening...' }} />}
              {isProcessing && !isRecording && <ChatMessage message={{ sender: 'ai', text: 'Thinking...' }} />}
              {error && <ChatMessage message={{ sender: 'ai', text: `Sorry, something went wrong: ${error}` }} />}
              <div ref={chatEndRef} />
            </Box>
            <Paper elevation={3} sx={{ p: 2, mt: 'auto' }}>
              <TextField 
                fullWidth
                variant="outlined"
                placeholder="I'm looking for..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleTextSubmit}
                disabled={isProcessing}
                sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleMicClick} edge="end" color={isRecording ? 'primary' : 'default'} disabled={isProcessing}>
                        <MicIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default HomePage;
