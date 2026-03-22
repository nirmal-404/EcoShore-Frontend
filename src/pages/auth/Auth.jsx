import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Code2 } from 'lucide-react';
import CommonForm from '@/components/common/Form.jsx';
import GoogleLogin from '@/components/auth/GoogleLogin';
import { loginFormControls } from '@/config/index.js';
import { useLogin, useGoogleCallback } from '@/hooks/auth.js';

const initialFormData = {
  email: '',
  password: '',
};

export default function Login() {
  const [formData, setFormData] = useState(initialFormData);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { mutate: login, isPending, isError, error } = useLogin();
  const { resolveToken } = useGoogleCallback();

  // 🔥 Handle Google OAuth token from URL query param
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      resolveToken(token).catch((err) =>
        console.error('Invalid Google token', err)
      );
    }
  }, [searchParams, resolveToken]);

  // 🚫 Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  function onSubmit(e) {
    e.preventDefault();
    login(formData);
  }

  // Developer helper — kept isolated for easy removal before production
  const handleQuickLogin = (email, password) => login({ email, password });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">

      {/* Decorative background blobs */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-emerald-400 opacity-20 dark:opacity-10 rounded-full blur-3xl mix-blend-multiply" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 opacity-20 dark:opacity-10 rounded-full blur-3xl mix-blend-multiply delay-1000" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50">

          <div className="p-8 sm:p-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to continue to EcoShore</p>
            </div>

            {/* CommonForm replaces the hand-rolled inputs */}
            <CommonForm
              formControls={loginFormControls}
              formData={formData}
              setFormData={setFormData}
              onSubmit={onSubmit}
              isBtnDisabled={isPending}
              buttonText={isPending ? 'Authenticating...' : 'Sign In'}
            />

            {isError && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-center">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {error?.response?.data?.error || 'Login failed. Please check your credentials.'}
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
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
              <button onClick={() => handleQuickLogin('admin@gmail.com', 'admin')} className="py-2 px-3 text-xs font-semibold rounded-xl bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 transition-colors" title="Log in as Admin">Admin</button>
              <button onClick={() => handleQuickLogin('organizer@gmail.com', 'organizer')} className="py-2 px-3 text-xs font-semibold rounded-xl bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 transition-colors" title="Log in as Organizer">Organizer</button>
              <button onClick={() => handleQuickLogin('volunteer@gmail.com', 'volunteer')} className="py-2 px-3 text-xs font-semibold rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 transition-colors" title="Log in as Volunteer">Volunteer</button>
            </div>
          </div>
          {/* ============================================================== */}

        </div>
      </div>
    </div>
  );
}
