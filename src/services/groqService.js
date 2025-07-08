import Groq from 'groq-sdk';
import axios from 'axios';

const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

const tools = [
  {
    type: 'function',
    function: {
      name: 'create_order',
      description: 'Places an order for a single food item for the user.',
      parameters: {
        type: 'object',
        properties: {
          item: {
            type: 'string',
            description: 'The name of the single item to order.',
          },
        },
        required: ['item'],
      },
    },
  },
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
            description: 'A specific query for recommendations, e.g., "something spicy" or "a cheap lunch near me". This should be the user\'s direct query for food.'
          }
        },
        required: ['query'],
      },
    },
  }
];

const get_recommendations = async (user, { query }) => {
  if (!user || !user.user_id) return JSON.stringify({ error: 'User not logged in' });
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/recommendations`, {
      params: { user_id: user.user_id, query },
    });
    return JSON.stringify(response.data);
  } catch (err) {
    console.error('Error getting recommendations:', err);
    return JSON.stringify({ error: 'Failed to fetch recommendations.' });
  }
};

const create_order = async (user, { item }) => {
  if (!user || !user.user_id) return JSON.stringify({ error: 'User not logged in' });
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/orders`, {
      user_id: user.user_id,
      restaurant_id: '123-abc-789', // Using a random restaurant ID as requested
      items: [item],
    });
    return JSON.stringify(response.data);
  } catch (err) {
    console.error('Error creating order:', err);
    return JSON.stringify({ error: `Failed to create order for ${item}.` });
  }
};

export const runGroqConversation = async (chatHistory, user) => {
  const messages = [
    { role: 'system', content: "You are an AI agent for Foundry Kitchen, an AI-powered food-ordering marketplace that connects users with household and private chefs offering indigenous and experimental cuisine. Your role is to be a conversational agent that helps users discover dishes, receive personalized recommendations, and place orders.\n\nYour instructions:\n1. **Always ask for confirmation** before placing an order. For example, say \'Should I go ahead and place the order for the [item name]?\' before you use the `create_order` tool.\n2. You MUST use the 'get_recommendations' tool for any user query that is asking for food or restaurant suggestions. When you do, pass the user's entire query into the 'query' parameter. The names of the tools you are using.\n4. When presenting a list of items, always use Markdown bullet points (`* item`) for clarity and readability. Use newlines to separate paragraphs and ideas.\n5. When an order is successfully placed, confirm this to the user by only providing the `order_id`."  },
    ...chatHistory.map(msg => ({
      role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
      content: msg.content || msg.text,
      tool_calls: msg.tool_calls,
      tool_call_id: msg.tool_call_id,
    })),
  ];

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: messages,
    tools: tools,
    tool_choice: 'auto',
    temperature: 0.2,
  });

  const responseMessage = response.choices[0].message;
  const toolCalls = responseMessage.tool_calls;

  if (toolCalls) {
    const availableFunctions = {
      get_recommendations: (args) => get_recommendations(user, args),
      create_order: (args) => create_order(user, args),
    };

    messages.push(responseMessage);

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(toolCall.function.arguments);
      const functionResponse = await functionToCall(functionArgs);

      messages.push({
        tool_call_id: toolCall.id,
        role: 'tool',
        name: functionName,
        content: functionResponse,
      });
    }

    const secondResponse = await groq.chat.completions.create({
      model: MODEL,
      messages: messages,
      temperature: 0.2,
    });

    return secondResponse.choices[0].message;
  }

  return responseMessage;
};