import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../../store/authSlice';
import Layout from '../../components/Layout';
import axios from 'axios';
import config from '../../utils/config';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const token = useSelector(selectCurrentToken);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/admin/analytics`, {
          headers: { 'x-auth-token': token }
        });
        setAnalytics(response.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'An error occurred');
      }
    };

    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  if (!analytics) return <Layout><p>Loading analytics...</p></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Admin Analytics Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Total Users</h2>
          <p className="text-3xl">{analytics.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Total Projects</h2>
          <p className="text-3xl">{analytics.totalProjects}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Total Quizzes Taken</h2>
          <p className="text-3xl">{analytics.totalQuizzesTaken}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Average Quiz Score</h2>
          <p className="text-3xl">{analytics.averageQuizScore.toFixed(2)}%</p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Top Performing Projects</h2>
        <ul>
          {analytics.topProjects.map((project, index) => (
            <li key={index} className="mb-2">
              {project.name} - Average Score: {project.averageScore.toFixed(2)}%
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
