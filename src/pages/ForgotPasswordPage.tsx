import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { useNavigate } from 'react-router-dom';

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <ForgotPasswordForm onBack={() => navigate('/login')} />
      </div>
    </div>
  );
}



