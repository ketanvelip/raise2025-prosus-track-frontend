import React from 'react';
import { Box, Paper, Typography, Card, CardContent, CardMedia, Grid, CardActions, Button } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const RecommendationCard = ({ rec, onOrder }) => (
  <Card sx={{ display: 'flex', mb: 1 }}>
    {rec.restaurant_img_url && <CardMedia component="img" sx={{ width: 151 }} image={rec.restaurant_img_url} alt={rec.restaurant_name} />}
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <CardContent>
        <Typography component="div" variant="h6">
          {rec.restaurant_name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" component="div">
          {rec.cuisine_type} - {rec.reason}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}><b>Recommended:</b></Typography>
        {rec.recommended_items.map(item => (
          <Box key={item} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 0.5 }}>
            <Typography variant="body2">- {item}</Typography>
            <Button size="small" variant="contained" onClick={() => onOrder(item)}>Order Now</Button>
          </Box>
        ))}
      </CardContent>
    </Box>
  </Card>
);

const OptionCard = ({ option, onOrder }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Card>
      {option.item_img_url && (
        <CardMedia
          component="img"
          height="140"
          image={option.item_img_url}
          alt={option.item_name}
        />
      )}
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {option.item_name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {option.item_cuisine}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" variant="contained" onClick={() => onOrder(option.item_name)}>Order Now</Button>
      </CardActions>
    </Card>
  </Grid>
);

const ChatMessage = ({ message, onOrder }) => {
  const { sender, text, role, content } = message;
  const isUser = sender === 'user' || role === 'user';

  let parsedContent = null;
  if ((sender === 'tool' || role === 'tool') && content) {
    try {
      parsedContent = JSON.parse(content);
    } catch (e) { 
      // Not valid JSON, treat as plain text
      parsedContent = null;
    }
  }

  if (parsedContent) {
    const recommendations = parsedContent.recommendations;
    const options = parsedContent.options;

    return (
      <Box sx={{ mb: 2 }}>
        {recommendations && recommendations.map((rec, i) => <RecommendationCard key={rec.restaurant_id || i} rec={rec} onOrder={onOrder} />)}
        {options && (
          <Grid container spacing={2}>
            {options.map((opt, i) => <OptionCard key={opt.item_name || i} option={opt} onOrder={onOrder} />)}
          </Grid>
        )}
      </Box>
    );
  }

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
          p: 2,
          bgcolor: isUser ? 'primary.main' : 'background.default',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          maxWidth: '80%',
          borderRadius: isUser ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
        }}
      >
        <Typography variant="body1" component="div">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {text || content}
          </ReactMarkdown>
        </Typography>
      </Paper>
    </Box>
  );
};

export default ChatMessage;
