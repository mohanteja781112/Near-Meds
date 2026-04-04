import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { register as registerUser } from '../../services/api';

const SignUpForm = ({ switchToLogin, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await registerUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });
      console.log('Registration successful:', response.data);
      setSuccess('Account created successfully! Redirecting...');
      
      // Store token/user
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      window.dispatchEvent(new Event('auth-change'));

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-white">Success!</h3>
        <p className="text-zinc-400">{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
            Full Name
          </label>
          <input
            {...register('fullName', { required: 'Full Name is required' })}
            type="text"
            className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-zinc-600"
            placeholder="John Doe"
          />
          {errors.fullName && (
            <span className="text-red-400 text-xs mt-1 block">{errors.fullName.message}</span>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            type="email"
            className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-zinc-600"
            placeholder="name@example.com"
          />
          {errors.email && (
            <span className="text-red-400 text-xs mt-1 block">{errors.email.message}</span>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              type={showPassword ? 'text' : 'password'}
              className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-zinc-600 pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <span className="text-red-400 text-xs mt-1 block">{errors.password.message}</span>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
            Confirm Password
          </label>
          <input
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
            type="password"
            className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-zinc-600"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <span className="text-red-400 text-xs mt-1 block">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-cyan-500/20"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
      </button>

      <p className="text-center text-sm text-zinc-400 mt-6">
        Already have an account?{' '}
        <button
          type="button"
          onClick={switchToLogin}
          className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
        >
          Log in
        </button>
      </p>
    </form>

  );
};

export default SignUpForm;
