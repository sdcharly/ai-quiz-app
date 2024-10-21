import { Provider } from 'react-redux';
import { store } from '../store';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </Provider>
  );
}

export default MyApp;
