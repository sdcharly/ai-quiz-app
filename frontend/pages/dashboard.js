import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectCurrentToken } from '../store/authSlice';
import Layout from '../components/Layout';
import Link from 'next/link';
import axios from 'axios';
import config from '../utils/config';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [error, setError] = useState('');
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'admin') {
          const response = await axios.get(`${config.API_URL}/projects`, {
            headers: { 'x-auth-token': token }
          });
          setProjects(response.data);
        } else {
          const response = await axios.get(`${config.API_URL}/projects/available`, {
            headers: { 'x-auth-token': token }
          });
          setAvailableQuizzes(response.data);
        }
      } catch (err) {
        setError(err.response?.data?.msg || 'An error occurred');
      }
    };

    if (user && token) {
      fetchData();
    }
  }, [user, token]);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {user && user.role === 'admin' ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Your Projects</h2>
            <Link href="/create-project">
              <span className="bg-green-500 text-white px-4 py-2 rounded">Create New Project</span>
            </Link>
          </div>
          {projects.length > 0 ? (
            <ul>
              {projects.map(project => (
                <li key={project._id} className="mb-2">
                  {project.name} - Questions: {project.questionCount}, Duration: {project.quizDuration} minutes
                </li>
              ))}
            </ul>
          ) : (
            <p>No projects found. Create a new project to get started.</p>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Quizzes</h2>
          {availableQuizzes.length > 0 ? (
            <ul>
              {availableQuizzes.map(quiz => (
                <li key={quiz._id} className="mb-2">
                  <Link href={`/quiz/${quiz._id}`}>
                    <span className="text-blue-500 hover:underline">{quiz.name} - Duration: {quiz.quizDuration} minutes</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No quizzes available at the moment.</p>
          )}
        </div>
      )}
    </Layout>
  );
}
