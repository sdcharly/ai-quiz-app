import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectCurrentToken } from '../store/authSlice';
import Layout from '../components/Layout';
import axios from 'axios';
import config from '../utils/config';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/projects`, {
          headers: { 'x-auth-token': token }
        });
        setProjects(response.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'An error occurred');
      }
    };

    if (user && user.role === 'admin') {
      fetchProjects();
    }
  }, [user, token]);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {user && user.role === 'admin' ? (
        <div>
          <h2 className="text-2xl font-bold mb-2">Your Projects</h2>
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
        <p>Welcome to your dashboard. Your quizzes will appear here.</p>
      )}
    </Layout>
  );
}
