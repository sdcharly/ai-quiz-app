import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../../store/authSlice';
import Layout from '../../components/Layout';
import axios from 'axios';
import config from '../../utils/config';

export default function Quiz() {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const router = useRouter();
  const { id } = router.query;
  const token = useSelector(selectCurrentToken);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.post(`${config.API_URL}/quizzes/start`, { projectId: id }, {
          headers: { 'x-auth-token': token }
        });
        setQuiz(response.data);
        setTimeLeft(response.data.project.quizDuration * 60);
        setAnswers(new Array(response.data.questions.length).fill(null));
      } catch (err) {
        setError(err.response?.data?.msg || 'An error occurred');
      }
    };

    if (id && token) {
      fetchQuiz();
    }
  }, [id, token]);

  useEffect(() => {
    if (timeLeft === null) return;

    const timerId = setInterval(() => {
      setTimeLeft(time => {
        if (time === 0) {
          clearInterval(timerId);
          handleSubmit();
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleAnswer = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.put(`${config.API_URL}/quizzes/${quiz._id}/submit`, { answers }, {
        headers: { 'x-auth-token': token }
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred');
    }
  };

  if (!quiz) return <Layout><p>Loading quiz...</p></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Quiz: {quiz.project.name}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <p className="mb-4">Time left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Question {currentQuestion + 1}</h2>
        <p>{quiz.questions[currentQuestion].question}</p>
      </div>
      <div className="mb-4">
        {quiz.questions[currentQuestion].options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            className={`block w-full text-left p-2 mb-2 border rounded ${answers[currentQuestion] === index ? 'bg-blue-200' : ''}`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <button onClick={handlePrevious} disabled={currentQuestion === 0} className="bg-gray-300 px-4 py-2 rounded">Previous</button>
        {currentQuestion < quiz.questions.length - 1 ? (
          <button onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded">Next</button>
        ) : (
          <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded">Submit</button>
        )}
      </div>
    </Layout>
  );
}
