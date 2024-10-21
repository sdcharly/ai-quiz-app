import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../../store/authSlice';
import Layout from '../../components/Layout';
import axios from 'axios';
import config from '../../utils/config';

export default function QuizResults() {
  const [quizResult, setQuizResult] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = router.query;
  const token = useSelector(selectCurrentToken);

  useEffect(() => {
    const fetchQuizResult = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/quizzes/${id}/results`, {
          headers: { 'x-auth-token': token }
        });
        setQuizResult(response.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'An error occurred');
      }
    };

    if (id && token) {
      fetchQuizResult();
    }
  }, [id, token]);

  if (!quizResult) return <Layout><p>Loading results...</p></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Quiz Results: {quizResult.project.name}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <p className="text-xl mb-4">Score: {quizResult.score} / {quizResult.questions.length}</p>
      <div>
        {quizResult.questions.map((question, index) => (
          <div key={index} className="mb-6 p-4 border rounded">
            <h2 className="text-lg font-bold mb-2">Question {index + 1}</h2>
            <p className="mb-2">{question.question}</p>
            <div className="ml-4">
              {question.options.map((option, optionIndex) => (
                <p key={optionIndex} className={`mb-1 ${
                  optionIndex === question.correctAnswer ? 'text-green-600 font-bold' :
                  optionIndex === question.studentAnswer ? 'text-red-600' : ''
                }`}>
                  {option} {optionIndex === question.correctAnswer && '✓'}
                  {optionIndex === question.studentAnswer && optionIndex !== question.correctAnswer && '✗'}
                </p>
              ))}
            </div>
            {question.studentAnswer !== question.correctAnswer && (
              <p className="mt-2 text-gray-600">Explanation: {question.explanation}</p>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
}
