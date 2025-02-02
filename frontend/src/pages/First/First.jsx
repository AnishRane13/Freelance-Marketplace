import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User } from 'lucide-react';

const First = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">Welcome to Our Platform</h1>
        <div className="space-y-6">
          <h2 className="text-lg text-center text-gray-600">Choose your registration type</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/signUp', { state: { type: 'user' } })}
              className="flex flex-col items-center justify-center p-6 bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors group"
            >
              <User className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-blue-600 font-medium">User</span>
            </button>
            
            <button
              onClick={() => navigate('/signUp', { state: { type: 'company' } })}
              className="flex flex-col items-center justify-center p-6 bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors group"
            >
              <Building2 className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-blue-600 font-medium">Company</span>
            </button>
          </div>
          
          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default First;