import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export const generateOptions = async (email, inputText) => {
  try {
    const response = await api.post('/generate_options', {
      email,
      input_text: inputText,
    });
    return response.data;
  } catch (error) {
    console.error('Error generating options:', error);
    throw error;
  }
};

export default api;
