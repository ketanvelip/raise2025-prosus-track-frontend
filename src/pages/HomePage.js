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
  const [isChatView, setIsChatView] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { user } = useContext(UserContext);
  const { options, loading, error, fetchOptions } = useOptions();
  const navigate = useNavigate();
  const submittedRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  const handleSubmit = useCallback((query) => {
    if (query.trim() && user?.email && !submittedRef.current) {
      submittedRef.current = true;
      setChatHistory(prev => [...prev, { sender: 'user', text: query }]);
      setIsChatView(true);
      fetchOptions(user.email, query);
      setSearchTerm('');
    }
  }, [user, fetchOptions, setChatHistory]);

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
    if (audioChunksRef.current.length === 0) return;
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
        setSearchTerm(transcript);
        handleSubmit(transcript);
      }
    } catch (e) {
      console.error('Error transcribing audio:', e);
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
      requestAnimationFrame(checkForSilence);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  }, [checkForSilence, handleTranscription]);

  useEffect(() => {
    if (options) {
      setChatHistory(prev => [...prev, { sender: 'ai', text: `Sure, I can help with ${options.category}. Let me show you some options.` }]);
      setTimeout(() => navigate(`/${options.category}`), 2000);
    }
  }, [options, navigate, setChatHistory]);

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      submittedRef.current = false;
      startRecording();
    }
  };

  const handleTextSubmit = (event) => {
    if (event.key === 'Enter') {
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
                sx={{ maxWidth: 700, bgcolor: 'background.paper', borderRadius: 1 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleMicClick} edge="end" color={isRecording ? 'primary' : 'default'}>
                        <MicIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%' }}
          >
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
              {chatHistory.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
              {loading && <ChatMessage message={{ sender: 'ai', text: 'Thinking...' }} />}
              {error && <ChatMessage message={{ sender: 'ai', text: `Sorry, something went wrong: ${error}` }} />}
            </Box>
            <Paper elevation={3} sx={{ p: 2, mt: 'auto' }}>
              <TextField 
                fullWidth
                variant="outlined"
                placeholder="I'm looking for..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleTextSubmit}
                sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleMicClick} edge="end" color={isRecording ? 'primary' : 'default'}>
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
