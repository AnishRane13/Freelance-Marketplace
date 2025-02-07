import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User } from 'lucide-react';

const First = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#13505b] p-4 overflow-hidden">
      <div className="fixed inset-0">
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-[#119da4]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-[#0c7489]/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute -bottom-48 left-1/2 w-96 h-96 bg-[#13505b]/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="relative backdrop-blur-xl bg-[#ffffff]/80 p-8 rounded-3xl border border-white/20 shadow-2xl shadow-black/5">
          <div className="space-y-2 mb-8">
            <h1 className="text-4xl font-bold text-[#040404] text-center">
              Welcome
            </h1>
            <p className="text-[#13505b] text-center">
              Choose your registration type
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-8">
            <button
              onClick={() => navigate('/login', { state: { type: 'user' } })}
              className="flex flex-col items-center justify-center p-8 bg-[#ffffff] border-2 border-[#119da4]/20 rounded-2xl hover:border-[#119da4] transition-all duration-300 group"
            >
              <User className="w-12 h-12 text-[#119da4] mb-4 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-[#13505b] font-medium text-lg">User</span>
            </button>
            
            <button
              onClick={() => navigate('/login', { state: { type: 'company' } })}
              className="flex flex-col items-center justify-center p-8 bg-[#ffffff] border-2 border-[#119da4]/20 rounded-2xl hover:border-[#119da4] transition-all duration-300 group"
            >
              <Building2 className="w-12 h-12 text-[#119da4] mb-4 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-[#13505b] font-medium text-lg">Company</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default First;