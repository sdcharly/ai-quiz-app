import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../store/authSlice';
import Layout from '../components/Layout';
import axios from 'axios';
import config from '../utils/config';

export default function CreateProject() {
  const [name, setName] = useState('');
  const [quizDuration, setQuizDuration] = useState('');
  const [questionCount, setQuestionCount] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const token = useSelector(selectCurrentToken);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${config.API_URL}/projects`, 
        { name, quizDuration: parseInt(quizDuration), questionCount: parseInt(questionCount) },
        { headers: { 'x-auth-token': token } }
      );
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred');
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Create New Project</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2">Project Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="quizDuration" className="block mb-2">Quiz Duration (minutes)</label>
          <input
            type="number"
            id="quizDuration"
            value={quizDuration}
            onChange={(e) => setQuizDuration(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="questionCount" className="block mb-2">Number of Questions</label>
          <input
            type="number"
            id="questionCount"
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Project
        </button>
      </form>
    </Layout>
  );
}
