import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Mail, Save, Loader2 } from 'lucide-react';
import api from '../services/api';

const ProfilePage = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user.fullName || '',
      email: user.email || ''
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = { fullName: data.fullName };
      if (data.newPassword) {
        payload.password = data.newPassword;
      }

      const response = await api.put('/user/profile', payload);
      
      // Update local storage
      const updatedUser = { ...user, fullName: response.data.fullName };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      window.dispatchEvent(new Event('auth-change'));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Profile Settings</h1>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 sm:p-8">
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} border`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  {...register('fullName', { required: 'Name is required' })}
                  type="text"
                  className="w-full bg-black/50 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                />
              </div>
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            {/* Email (Read Only) */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
              <div className="relative opacity-50 cursor-not-allowed">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  {...register('email')}
                  type="email"
                  disabled
                  className="w-full bg-black/50 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-3"
                />
              </div>
              <p className="text-zinc-500 text-xs mt-1">Email cannot be changed.</p>
            </div>

            <div className="border-t border-zinc-800 my-6 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
              
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    {...register('newPassword', { minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                    type="password"
                    placeholder="Leave blank to keep current"
                    className="w-full bg-black/50 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-zinc-600"
                  />
                </div>
                {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /><span>Save Changes</span></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
