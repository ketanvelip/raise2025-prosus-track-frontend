import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 1.5,
          backgroundColor: isUser ? 'primary.main' : 'grey.700',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          borderRadius: isUser ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
          maxWidth: '70%',
        }}
      >
        <Typography variant="body1">{message.text}</Typography>
      </Paper>
    </Box>
  );
};

export default ChatMessage;
