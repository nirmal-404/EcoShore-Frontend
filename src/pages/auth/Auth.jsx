import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { loginUser, setAuthToken, getMe } from '@/api/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/store/authSlice';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Code2 } from 'lucide-react';
import GoogleLogin from '@/components/auth/GoogleLogin';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user } = useSelector((state) => state.auth);

  // const redirectByRole = (role) => {
  //   if (role === 'admin') navigate('/admin', { replace: true });
  //   else if (role === 'organizer') navigate('/organizer', { replace: true });
  //   else if (role === 'volunteer') navigate('/volunteer', { replace: true });
  //   else navigate('/', { replace: true });
  // };

  // 🔥 GOOGLE CALLBACK HANDLER
  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      setAuthToken(token);
      getMe()
        .then((data) => {
          dispatch(setUser(data));
          // Note: setUser will handle the cookie via authSlice
        })
        .catch((error) => {
          console.error('Invalid Google token', error);
        });
    }
  }, [searchParams, dispatch]);

  // 🚫 Prevent logged-in users from seeing login
  useEffect(() => {
    if (user) {
      // redirectByRole(user.role);
      navigate('/', { replace: true });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: ({ email, password }) => loginUser(email, password),
    onSuccess: (data) => {
      setAuthToken(data.token);
      dispatch(setUser(data));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  const handleQuickLogin = (email, password) => {
    mutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-emerald-400 opacity-20 dark:opacity-10 rounded-full blur-3xl mix-blend-multiply"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 opacity-20 dark:opacity-10 rounded-full blur-3xl mix-blend-multiply delay-1000"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50">
          
          <div className="p-8 sm:p-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to continue to EcoShore</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all sm:text-sm"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all sm:text-sm"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Secure Login
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>

            </form>

            {mutation.isError && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-center">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {mutation.error.response?.data?.error || 'Login failed. Please check your credentials.'}
                </p>
              </div>
            )}

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or continue with</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center w-full">
                <GoogleLogin />
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors">
                Create one now
              </Link>
            </p>
          </div>

          {/* ==============================================================
              DEVELOPER TOOLS: QUICK LOGIN SECTION
              Note: Remove this entire block below for Production deployment 
              ============================================================== */}
          <div className="bg-gray-100 dark:bg-gray-900/50 p-6 border-t border-dashed border-gray-300 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 mb-4 text-xs font-bold tracking-widest text-gray-400 uppercase">
              <Code2 className="w-4 h-4" />
              Testing Quick Logins
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => handleQuickLogin('admin@gmail.com', 'admin')}
                className="py-2 px-3 text-xs font-semibold rounded-xl bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors"
                title="Log in as Admin"
              >
                Admin
              </button>
              <button 
                onClick={() => handleQuickLogin('organizer@gmail.com', 'organizer')}
                className="py-2 px-3 text-xs font-semibold rounded-xl bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50 transition-colors"
                title="Log in as Organizer"
              >
                Organizer
              </button>
              <button 
                onClick={() => handleQuickLogin('volunteer@gmail.com', 'volunteer')}
                className="py-2 px-3 text-xs font-semibold rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-colors"
                title="Log in as Volunteer"
              >
                Volunteer
              </button>
            </div>
          </div>
          {/* ============================================================== */}
          
        </div>
      </div>
    </div>
  );
}
