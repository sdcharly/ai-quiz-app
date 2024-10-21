import Head from 'next/head';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';
import Link from 'next/link';

const Layout = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <>
      <Head>
        <title>AI Quiz App</title>
        <meta name="description" content="AI-powered quizzing application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <span className="text-xl font-bold">AI Quiz App</span>
          </Link>
          <div>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <span className="mr-4">Dashboard</span>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <span className="mr-4">Login</span>
                </Link>
                <Link href="/register">
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto mt-4">{children}</main>
    </>
  );
};

export default Layout;
