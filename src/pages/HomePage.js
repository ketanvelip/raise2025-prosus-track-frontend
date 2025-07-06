import React, { useContext, useEffect, useRef } from 'react';
import { Container, Typography, Box, IconButton, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useOptions } from '../context/OptionsContext';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { user } = useContext(UserContext);
  const { options, loading, error, fetchOptions, clearOptions } = useOptions();
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const submittedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (options) {
      const path = `/${options.category}`;
      navigate(path);
    }
  }, [options, navigate]);

  

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      submittedRef.current = false; // Reset the flag when starting a new recognition
      resetTranscript();
      clearOptions();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  useEffect(() => {
    if (!listening && transcript && !submittedRef.current) {
      submittedRef.current = true;
      if (user?.email) {
        fetchOptions(user.email, transcript);
      } else {
        console.error('Could not submit voice command: user email not found.');
      }
    }
  }, [listening, transcript, user, fetchOptions]);

  if (!browserSupportsSpeechRecognition) {
    return <Container><Alert severity="error">Your browser does not support speech recognition.</Alert></Container>;
  }

  const renderContent = () => {
    if (listening) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <MicIcon sx={{ fontSize: 150, color: 'primary.main' }} />
          </motion.div>
          <Typography variant="h5" sx={{ mt: 2 }}>Listening...</Typography>
          <Typography variant="body1" sx={{ mt: 2, minHeight: '24px' }}>{transcript}</Typography>
          <IconButton onClick={handleMicClick} sx={{ mt: 4 }}>
            <CloseIcon sx={{ fontSize: 40 }}/>
          </IconButton>
        </Box>
      );
    }

    if (loading) {
      return <CircularProgress sx={{ mt: 4 }} />;
    }
    if (error) {
      return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
    }
    return (
      <>
                <Typography variant="h2" component="h1" gutterBottom>
          How can I help you?
        </Typography>
                <Box sx={{ my: 4 }}>
          <IconButton
            color="primary"
            aria-label={'start listening'}
            onClick={handleMicClick}
            sx={{
              width: 100,
              height: 100,
              border: '2px solid',
              borderColor: 'grey.500',
            }}
          >
            <MicIcon sx={{ fontSize: 60 }} />
          </IconButton>
        </Box>
                <Typography variant="h5" color="text.secondary">
          {'Click the mic to speak'}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, minHeight: '24px' }}>
          {transcript}
        </Typography>
      </>
    );
  };

  return (
    <Container sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4,
      minHeight: 'calc(100vh - 128px)',
      textAlign: 'center'
    }}>
      {renderContent()}
    </Container>
  );
};

export default HomePage;
