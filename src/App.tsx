import { Navigate, Route, Routes } from 'react-router-dom';
import { RegisterPage } from './pages/RegisterPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { ThanksPage } from './pages/ThanksPage';
import { RegistrationClosedPage } from './pages/RegistrationClosedPage';
import { ResultsPage } from './pages/ResultsPage';
import { HowDidIDoPage } from './pages/HowDidIDoPage';

export default function App() {
  return (
    <div className='app-print' style={{ margin: '40px auto', padding: 16, fontFamily: 'system-ui' }}>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/registration-closed" element={<RegistrationClosedPage />} />
        <Route path="/play" element={<QuestionsPage />} />
        <Route path="/thanks" element={<ThanksPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="*" element={<Navigate to="/register" replace />} />
        <Route path="/how-did-i-do/:userId" element={<HowDidIDoPage />} />
      </Routes>
    </div>
  );
}
