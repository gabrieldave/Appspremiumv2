import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido de Nuevo</h1>
          <p className="text-gray-600">Inicia sesión en tu cuenta</p>
        </div>

        <LoginForm onSuccess={handleLoginSuccess} />

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}