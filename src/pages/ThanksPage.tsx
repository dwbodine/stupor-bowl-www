import { useNavigate } from 'react-router-dom';
import { clearStoredUserId } from '../lib/utils';

export function ThanksPage() {
  const nav = useNavigate();

  return (
    <div className="stupor-bowl-card">
      <h1>Thanks for playing!</h1>
      <p>Good luck — results will be posted soon after Super Bowl LX is over.</p>

      <button
        onClick={() => {
          clearStoredUserId();
          nav('/register');
        }}
        style={{ padding: 12, cursor: 'pointer' }}
      >
        Play again
      </button>
    </div>
  );
}
