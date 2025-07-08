import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemText, Typography, Box, Divider, Button } from '@mui/material';

const Sidebar = ({ open, onClose, conversations, onSelectConversation, onNewConversation, currentConversationId }) => {
  const handleNewChat = () => {
    onNewConversation();
    onClose();
  };

  const handleSelectChat = (id) => {
    onSelectConversation(id);
    onClose();
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 250, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Chat History
          </Typography>
          <Button variant="contained" fullWidth onClick={handleNewChat}>
            New Chat
          </Button>
        </Box>
        <Divider />
        <List sx={{ overflowY: 'auto', flexGrow: 1 }}>
          {Object.entries(conversations)
            .sort(([idA], [idB]) => idB.localeCompare(idA)) // Sort by newest first
            .map(([id, messages]) => (
            <ListItem key={id} disablePadding>
              <ListItemButton
                selected={id === currentConversationId}
                onClick={() => handleSelectChat(id)}
              >
                <ListItemText
                  primary={messages[0]?.text || 'New Conversation'}
                  primaryTypographyProps={{
                    noWrap: true,
                    sx: { fontWeight: id === currentConversationId ? 'bold' : 'normal' },
                  }}
                  secondary={messages.length > 0 ? `${messages.length} messages` : 'Empty'}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
