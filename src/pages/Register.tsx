import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Lock, User as UserIcon, Phone, Send } from 'lucide-react';
import { motion } from 'motion/react';
import Notification from '../components/Notification';

import { api } from '../services/api';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [examInterest, setExamInterest] = useState('SSC');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'info'
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    const result = await api.sendOtp(phone);

    if (result.ok) {
      setOtpSent(true);
      setNotification({
        show: true,
        message: `Simulated OTP: ${result.otp || '123456'}`,
        type: 'success'
      });
    } else {
      setError('Failed to send OTP');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      handleSendOtp();
      return;
    }
    setError('');
    const result = await api.register({ name, phone, exam_interest: examInterest, otp });
    
    if (result.ok) {
      login(result.user);
      navigate('/');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-slate-500">Join thousands of successful students</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                disabled={otpSent}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="tel" 
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="9876543210"
                  disabled={otpSent}
                />
              </div>
              {!otpSent && (
                <button 
                  type="button"
                  onClick={handleSendOtp}
                  className="px-4 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-all border border-indigo-100 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              )}
            </div>
          </div>
          
          {otpSent && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1"
            >
              <label className="text-xs font-bold text-slate-500 uppercase">Enter OTP</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                />
              </div>
              <button 
                type="button" 
                onClick={() => setOtpSent(false)}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Change Phone Number
              </button>
            </motion.div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Exam Interest</label>
            <select 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={examInterest}
              onChange={e => setExamInterest(e.target.value)}
              disabled={otpSent}
            >
              <option value="SSC">SSC</option>
              <option value="Banking">Banking</option>
              <option value="Railway">Railway</option>
              <option value="Defence">Defence</option>
              <option value="State Exams">State Exams</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            {otpSent ? 'Verify & Register' : 'Send OTP'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm">
          Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign In</Link>
        </p>
      </motion.div>

      <Notification 
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}
