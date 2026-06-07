import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const analyzeImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_URL}/analyze`, formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      'ngrok-skip-browser-warning': 'true'
    },
  });

  return response.data;
};
