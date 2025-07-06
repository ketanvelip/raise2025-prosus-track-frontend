import React, { useEffect } from 'react';
import { Container, Typography, Box, IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const HomePage = () => {
  const navigate = useNavigate();

  const navigateTo = (page) => {
    const routes = {
      'food': '/food',
      'market': '/market',
      'marketplace': '/market',
      'profile': '/profile',
      'cart': '/cart',
      'orders': '/profile/orders',
      'home': '/',
    };
    const path = routes[page.toLowerCase().trim()];
    if (path) {
      navigate(path);
    }
  };

  const commands = [
    {
      command: ['Go to *', 'Open *'],
      callback: (page) => navigateTo(page),
    },
  ];

  const { transcript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands });

  useEffect(() => {
    SpeechRecognition.startListening({ continuous: true });
    return () => {
      SpeechRecognition.stopListening();
    };
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return <Container><Typography>Your browser does not support speech recognition.</Typography></Container>;
  }

  return (
    <Container sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 'calc(100vh - 128px)', // Adjust height to fill viewport minus header/footer
      textAlign: 'center'
    }}>
      <Typography variant="h2" component="h1" gutterBottom>
        How can I help you?
      </Typography>
      <Box sx={{ my: 4 }}>
        <IconButton
          color="primary"
          aria-label="toggle microphone"
          onClick={() => {
            if (listening) {
              SpeechRecognition.stopListening();
            } else {
              SpeechRecognition.startListening({ continuous: true });
            }
          }}
          sx={{
            width: 100,
            height: 100,
            border: '2px solid',
            borderColor: listening ? 'primary.main' : 'grey.500',
          }}
        >
          {listening ? <MicIcon sx={{ fontSize: 60 }} /> : <MicOffIcon sx={{ fontSize: 60 }} />}
        </IconButton>
      </Box>
      <Typography variant="h5" color="text.secondary">
        {listening ? "Listening..." : "Click the mic to start"}
      </Typography>
      <Typography variant="body1" sx={{ mt: 2, minHeight: '24px' }}>
        {transcript}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 4 }}>
        Try saying: "Go to Food", "Open Market", or "Show my Cart"
      </Typography>
    </Container>
  );
};

export default HomePage;
