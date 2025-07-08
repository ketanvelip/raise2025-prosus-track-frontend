import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Container, Typography, Box, TextField, InputAdornment, IconButton, Paper } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import { useNavigate } from 'react-router-dom';
import { useOptions } from '../context/OptionsContext';
import { UserContext } from '../context/UserContext';
import ChatMessage from '../components/ChatMessage';
import { motion, AnimatePresence } from 'framer-motion';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

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

    const newChatHistory = [...chatHistory, { sender: 'user', text: query }];
    setChatHistory(newChatHistory);
    setIsChatView(true);
    setSearchTerm('');
    setIsProcessing(true);

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful assistant for a food ordering app called PalateIQ.' },
          ...newChatHistory.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text }))
        ],
        model: 'llama3-8b-8192',
      });

      const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I had trouble understanding that.';
      setChatHistory(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    } catch (e) {
      console.error('Error getting completion:', e);
      setChatHistory(prev => [...prev, { sender: 'ai', text: 'Sorry, something went wrong. Please try again.' }]);
    }

    setIsProcessing(false);
  }, [user, chatHistory, setChatHistory]);

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
    const isSilent = !dataArray.some(v => v > 128 + 2 || v < 128 - 2);

    if (isSilent) {
      if (!silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          stopRecording();
        }, 3000);
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
      setIsProcessing(false);
      return;
    }
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];
    const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });

    try {
      const transcription = await groq.audio.transcriptions.create({
        file: file,
        model: 'whisper-large-v3',
      });
      const transcript = transcription.text;
      if (transcript) {
        handleSubmit(transcript);
      } else {
        setIsProcessing(false);
      }
    } catch (e) {
      console.error('Error transcribing audio:', e);
      setIsProcessing(false);
    }
  }, [handleSubmit]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = handleTranscription;
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsProcessing(true);
      requestAnimationFrame(checkForSilence);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setIsProcessing(false);
    }
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
              {isProcessing && <Typography variant="body1" align="center" sx={{ mt: 2 }}>Thinking...</Typography>}
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
                <ChatMessage key={index} message={msg} />
              ))}
              {isProcessing && <ChatMessage message={{ sender: 'ai', text: 'Thinking...' }} />}
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
