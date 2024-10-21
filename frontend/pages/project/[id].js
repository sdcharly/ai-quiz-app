import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../../store/authSlice';
import Layout from '../../components/Layout';
import axios from 'axios';
import config from '../../utils/config';

export default function ProjectManagement() {
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = router.query;
  const token = useSelector(selectCurrentToken);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectRes = await axios.get(`${config.API_URL}/projects/${id}`, {
          headers: { 'x-auth-token': token }
        });
        setProject(projectRes.data);

        const documentsRes = await axios.get(`${config.API_URL}/projects/${id}/documents`, {
          headers: { 'x-auth-token': token }
        });
        setDocuments(documentsRes.data);

        const studentsRes = await axios.get(`${config.API_URL}/projects/${id}/students`, {
          headers: { 'x-auth-token': token }
        });
        setStudents(studentsRes.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'An error occurred');
      }
    };

    if (id && token) {
      fetchProjectData();
    }
  }, [id, token]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);

    try {
      await axios.post(`${config.API_URL}/projects/${id}/upload`, formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });
      // Refresh documents list
      const documentsRes = await axios.get(`${config.API_URL}/projects/${id}/documents`, {
        headers: { 'x-auth-token': token }
      });
      setDocuments(documentsRes.data);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred while uploading');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${config.API_URL}/projects/${id}/students`, { email: newStudent }, {
        headers: { 'x-auth-token': token }
      });
      // Refresh students list
      const studentsRes = await axios.get(`${config.API_URL}/projects/${id}/students`, {
        headers: { 'x-auth-token': token }
      });
      setStudents(studentsRes.data);
      setNewStudent('');
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred while adding student');
    }
  };

  if (!project) return <Layout><p>Loading project...</p></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Project: {project.name}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Project Details</h2>
        <p>Quiz Duration: {project.quizDuration} minutes</p>
        <p>Number of Questions: {project.questionCount}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Documents</h2>
        <ul className="mb-4">
          {documents.map((doc, index) => (
            <li key={index}>{doc.name}</li>
          ))}
        </ul>
        <form onSubmit={handleFileUpload} className="mb-4">
          <input type="file" onChange={handleFileChange} className="mb-2" />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Upload Document</button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-2">Students</h2>
        <ul className="mb-4">
          {students.map((student, index) => (
            <li key={index}>{student.email}</li>
          ))}
        </ul>
        <form onSubmit={handleAddStudent} className="mb-4">
          <input
            type="email"
            value={newStudent}
            onChange={(e) => setNewStudent(e.target.value)}
            placeholder="Student Email"
            className="mr-2 px-2 py-1 border rounded"
          />
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Add Student</button>
        </form>
      </section>
    </Layout>
  );
}
