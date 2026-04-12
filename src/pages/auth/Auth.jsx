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

  const loginControls = loginFormControls.map((controlItem) => {
    if (controlItem.name === 'email') {
      return {
        ...controlItem,
        autoComplete: 'off',
      };
    }

    if (controlItem.name === 'password') {
      return {
        ...controlItem,
        autoComplete: 'new-password',
      };
    }

    return controlItem;
  });

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

  // Keep fields blank when the page loads.
  useEffect(() => {
    setFormData(initialFormData);
  }, []);

  function onSubmit(e) {
    e.preventDefault();
    login(formData);
  }

  // Developer helper — kept isolated for easy removal before production
  // const handleQuickLogin = (email, password) => login({ email, password });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-background to-cyan-100/40 px-4 py-12 transition-colors duration-300 sm:px-6 lg:px-8 dark:from-slate-950 dark:via-slate-900 dark:to-[#061d39]">
      {/* Decorative background blobs */}
      <div className="absolute -left-10 top-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl dark:bg-primary/15" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary/20 blur-3xl dark:bg-secondary/15" />

      <div className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/90 shadow-[0_24px_60px_-24px_rgba(15,118,110,0.35)] backdrop-blur-xl dark:bg-card/85 dark:shadow-[0_24px_60px_-24px_rgba(14,165,233,0.25)]">
          <div className="p-8 sm:p-10">
            <div className="text-center mb-10">
              <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-foreground">
                Welcome Back
              </h2>
              <p className="text-sm text-muted-foreground">
                Sign in to continue to EcoShore
              </p>
            </div>

            {/* CommonForm replaces the hand-rolled inputs */}
            <CommonForm
              formControls={loginControls}
              formData={formData}
              setFormData={setFormData}
              onSubmit={onSubmit}
              isBtnDisabled={isPending}
              buttonText={isPending ? 'Authenticating...' : 'Sign In'}
              autoComplete="off"
            />

            {isError && (
              <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-center">
                <p className="text-sm font-medium text-destructive">
                  {error?.response?.data?.error ||
                    'Login failed. Please check your credentials.'}
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground">
                    or continue with
                  </span>
                </div>
              </div>
              <div className="mt-6 flex justify-center w-full">
                <GoogleLogin />
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Create one now
              </Link>
            </p>
          </div>

          {/* ==============================================================
              DEVELOPER TOOLS: QUICK LOGIN SECTION
              Note: Remove this entire block below for Production deployment
              ============================================================== */}
          {/* <div className="border-t border-dashed border-border bg-muted/30 p-6">
            <div className="mb-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Code2 className="w-4 h-4" />
              Testing Quick Logins
            </div>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => handleQuickLogin('admin@gmail.com', 'admin')}
                className="rounded-xl bg-primary/15 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/25"
                title="Log in as Admin"
              >
                Admin
              </button>
              <button
                onClick={() =>
                  handleQuickLogin('organizer@gmail.com', 'organizer')
                }
                className="rounded-xl bg-secondary/15 px-3 py-2 text-xs font-semibold text-secondary transition-colors hover:bg-secondary/25"
                title="Log in as Organizer"
              >
                Organizer
              </button>
              <button
                onClick={() =>
                  handleQuickLogin('volunteer@gmail.com', 'volunteer')
                }
                className="rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/25 dark:text-emerald-400"
                title="Log in as Volunteer"
              >
                Volunteer
              </button>
              <button
                onClick={() =>
                  handleQuickLogin('agent@gmail.com', 'AgentPassword123')
                }
                className="rounded-xl bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-600 transition-colors hover:bg-cyan-500/25 dark:text-cyan-400"
                title="Log in as Agent"
              >
                Agent
              </button>
            </div>
          </div> */}
          {/* ============================================================== */}
        </div>
      </div>
    </div>
  );
}
