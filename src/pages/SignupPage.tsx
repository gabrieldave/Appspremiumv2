import React from 'react';
import { Link } from 'react-router-dom';
import { SignupForm } from '../components/auth/SignupForm';
import { useNavigate } from 'react-router-dom';

export function SignupPage() {
  const navigate = useNavigate();

  const handleSignupSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join us today</p>
        </div>

        <SignupForm onSuccess={handleSignupSuccess} />

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}