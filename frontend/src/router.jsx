import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import InstructionsPage from './pages/InstructionsPage.jsx';
import ExamPage from './pages/ExamPage.jsx';
import ResultPage from './pages/ResultPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// A data router is used so the exam page can block accidental back-navigation (useBlocker).
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/test/:testId', element: <InstructionsPage /> },
      { path: '/result/:attemptId', element: <ResultPage /> },
      { path: '/admin', element: <AdminPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '/exam', element: <ExamPage /> },
]);
