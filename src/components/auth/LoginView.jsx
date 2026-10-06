import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Wrench, ShieldCheck, UserCheck, Lock, Mail, ArrowRight, Check } from 'lucide-react';

export default function LoginView() {
  const { login, settings } = useApp();
  const [selectedRole, setSelectedRole] = useState('admin'); // 'admin' or 'user'
  const [password, setPassword] = useState('admin123');

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setPassword(role === 'admin' ? 'admin123' : 'user123');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(selectedRole);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Banner */}
        <div className="bg-slate-950 p-6 sm:p-7 text-white text-center border-b border-slate-800">
          <div className="h-14 w-14 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center shadow-lg ring-4 ring-blue-500/20 mb-3">
            <Wrench className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white">
            {settings.businessName || 'Routh Automobile'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automobile Billing & Stock ERP
          </p>
        </div>

        {/* Login Body */}
        <div className="p-6 sm:p-8 space-y-5">
          
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              Select Account to Sign In:
            </label>
            
            {/* The 2 Accounts: 1 Admin and 1 User */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* 1. Admin */}
              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer relative ${
                  selectedRole === 'admin'
                    ? 'border-indigo-600 bg-indigo-50/90 shadow-sm'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {selectedRole === 'admin' && (
                  <span className="absolute top-2.5 right-2.5 h-4 w-4 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px]">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-1">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  <span>Admin</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium">Administrator</div>
                <div className="text-[10px] text-indigo-700 font-semibold mt-1">Full Access</div>
              </button>

              {/* 2. User */}
              <button
                type="button"
                onClick={() => handleSelectRole('user')}
                className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer relative ${
                  selectedRole === 'user'
                    ? 'border-emerald-600 bg-emerald-50/90 shadow-sm'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {selectedRole === 'user' && (
                  <span className="absolute top-2.5 right-2.5 h-4 w-4 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px]">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  <span>User</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium">Standard User</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1">Billing & Stock</div>
              </button>

            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  readOnly
                  value={selectedRole === 'admin' ? 'admin@routhautomobile.com' : 'user@routhautomobile.com'}
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 select-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 ${
                selectedRole === 'admin'
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <span>Sign In as {selectedRole === 'admin' ? 'Admin' : 'User'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
