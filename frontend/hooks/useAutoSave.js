import { useEffect, useRef } from 'react';
import axios from 'axios';
import config from '../utils/config';

export const useAutoSave = (quizId, answers, token) => {
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    const saveProgress = async () => {
      try {
        await axios.post(`${config.API_URL}/quizzes/${quizId}/progress`, 
          { answers },
          { headers: { 'x-auth-token': token } }
        );
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    };

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(saveProgress, 5000); // Save every 5 seconds

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [quizId, answers, token]);
};
