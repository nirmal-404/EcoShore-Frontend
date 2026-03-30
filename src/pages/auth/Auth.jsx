import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLogin, useGoogleCallback, useSignup } from '@/hooks/auth.js';

/* ─── initial form states ─────────────────────────────────────── */
const initialLogin = { email: '', password: '', rememberMe: false };
const initialSignup = { name: '', email: '', phoneNumber: '', password: '', confirmPassword: '' };

/* ─── shared input wrapper ────────────────────────────────────── */
function InputRow({ icon, children }) {
  return (
    <div
      className="flex items-center w-full h-12 rounded-full overflow-hidden pl-5 gap-2 mb-4"
      style={{
        background: 'transparent',
        border: '1px solid rgba(209,213,219,0.6)',
      }}
    >
      <span className="text-gray-400 shrink-0">{icon}</span>
      {children}
    </div>
  );
}

/* ─── svg icons ───────────────────────────────────────────────── */
const IconEmail = (
  <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd" clipRule="evenodd"
      d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z"
      fill="#6B7280"
    />
  </svg>
);
const IconLock = (
  <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z"
      fill="#6B7280"
    />
  </svg>
);
const IconUser = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" fill="#6B7280" />
  </svg>
);
const IconPhone = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="#6B7280" />
  </svg>
);

/* ─── shared text input style ─────────────────────────────────── */
const inputCls =
  'bg-transparent text-gray-600 placeholder-gray-400 outline-none text-sm w-full h-full ' +
  '[&:-webkit-autofill]:!bg-transparent [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset] ' +
  '[&:-webkit-autofill]:!text-gray-600';

/* ═══════════════════════════════════════════════════════════════ */
export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [loginData, setLoginData] = useState(initialLogin);
  const [signupData, setSignupData] = useState(initialSignup);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { mutate: login, isPending: loginPending, isError: loginError, error: loginErr } = useLogin();
  const { mutate: signup, isPending: signupPending, isError: signupError, error: signupErr } = useSignup();
  const { resolveToken } = useGoogleCallback();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) resolveToken(token).catch((err) => console.error('Invalid Google token', err));
  }, [searchParams, resolveToken]);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  /* ── handlers ─────────────────────────────────────────────── */
  function handleLoginChange(e) {
    const { name, value, type, checked } = e.target;
    setLoginData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSignupChange(e) {
    const { name, value } = e.target;
    setSignupData((p) => ({ ...p, [name]: value }));
  }

  function onLoginSubmit(e) {
    e.preventDefault();
    login({ email: loginData.email, password: loginData.password });
  }

  function onSignupSubmit(e) {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    signup(signupData);
  }

  /* ── google oauth ─────────────────────────────────────────── */
  function googleOAuth() {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    window.location.href = `${backendUrl}/auth/google`;
  }

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="flex h-screen w-full bg-white">
      {/* Left side image */}
      <div className="w-full hidden md:inline-block">
        <img
          className="h-full w-full object-cover"
          src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/leftSideImage.png"
          alt="leftSideImage"
        />
      </div>

      {/* Right side */}
      <div className="w-full flex flex-col items-center justify-center px-6 md:px-0 overflow-y-auto py-8">

        {/* ──── LOGIN ──── */}
        {mode === 'login' && (
          <form
            className="md:w-96 w-80 flex flex-col items-center justify-center"
            onSubmit={onLoginSubmit}
            autoComplete="off"
          >
            <h2 className="text-4xl text-gray-900 font-medium">Sign in</h2>
            <p className="text-sm text-gray-500/90 mt-3">Welcome back! Please sign in to continue</p>

            {/* Google */}
            <button
              type="button"
              onClick={googleOAuth}
              className="w-full mt-8 bg-gray-500/10 flex items-center justify-center h-12 rounded-full hover:bg-gray-500/20 transition-colors"
            >
              <img
                src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleLogo.svg"
                alt="googleLogo"
              />
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 w-full my-5">
              <div className="w-full h-px bg-gray-300/90" />
              <p className="w-full text-nowrap text-sm text-gray-500/90">or sign in with email</p>
              <div className="w-full h-px bg-gray-300/90" />
            </div>

            {/* Email */}
            <InputRow icon={IconEmail}>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="Email id"
                autoComplete="new-email"
                className={inputCls}
                required
              />
            </InputRow>

            {/* Password */}
            <InputRow icon={IconLock}>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                placeholder="Password"
                autoComplete="new-password"
                className={inputCls}
                required
              />
            </InputRow>

            {/* Error */}
            {loginError && (
              <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-center mb-2">
                <p className="text-sm font-medium text-red-600">
                  {loginErr?.response?.data?.error || 'Login failed. Please check your credentials.'}
                </p>
              </div>
            )}

            {/* Remember + Forgot */}
            <div className="w-full flex items-center justify-between mt-4 text-gray-500/80">
              <div className="flex items-center gap-2">
                <input
                  className="h-5 w-5 cursor-pointer"
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  checked={loginData.rememberMe}
                  onChange={handleLoginChange}
                />
                <label className="text-sm cursor-pointer" htmlFor="rememberMe">Remember me</label>
              </div>
              <Link to="/forgot-password" className="text-sm underline hover:text-gray-900 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loginPending}
              className="mt-8 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loginPending ? 'Signing in...' : 'Login'}
            </button>

            {/* Switch to Sign Up */}
            <p className="text-gray-500/90 text-sm mt-4">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setSignupData(initialSignup); }}
                className="text-indigo-400 hover:underline font-medium transition-colors"
              >
                Sign up
              </button>
            </p>
          </form>
        )}

        {/* ──── SIGN UP ──── */}
        {mode === 'signup' && (
          <form
            className="md:w-96 w-80 flex flex-col items-center justify-center"
            onSubmit={onSignupSubmit}
            autoComplete="off"
          >
            <h2 className="text-4xl text-gray-900 font-medium">Sign up</h2>
            <p className="text-sm text-gray-500/90 mt-3">Create your account to get started</p>

            {/* Google */}
            <button
              type="button"
              onClick={googleOAuth}
              className="w-full mt-8 bg-gray-500/10 flex items-center justify-center h-12 rounded-full hover:bg-gray-500/20 transition-colors"
            >
              <img
                src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleLogo.svg"
                alt="googleLogo"
              />
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 w-full my-5">
              <div className="w-full h-px bg-gray-300/90" />
              <p className="w-full text-nowrap text-sm text-gray-500/90">or sign up with email</p>
              <div className="w-full h-px bg-gray-300/90" />
            </div>

            {/* Full Name */}
            <InputRow icon={IconUser}>
              <input
                type="text"
                name="name"
                value={signupData.name}
                onChange={handleSignupChange}
                placeholder="Full name"
                autoComplete="off"
                className={inputCls}
                required
              />
            </InputRow>

            {/* Email */}
            <InputRow icon={IconEmail}>
              <input
                type="email"
                name="email"
                value={signupData.email}
                onChange={handleSignupChange}
                placeholder="Email id"
                autoComplete="off"
                className={inputCls}
                required
              />
            </InputRow>

            {/* Phone */}
            <InputRow icon={IconPhone}>
              <input
                type="tel"
                name="phoneNumber"
                value={signupData.phoneNumber}
                onChange={handleSignupChange}
                placeholder="Phone number"
                autoComplete="off"
                className={inputCls}
              />
            </InputRow>

            {/* Password */}
            <InputRow icon={IconLock}>
              <input
                type="password"
                name="password"
                value={signupData.password}
                onChange={handleSignupChange}
                placeholder="Password"
                autoComplete="new-password"
                className={inputCls}
                required
              />
            </InputRow>

            {/* Confirm Password */}
            <InputRow icon={IconLock}>
              <input
                type="password"
                name="confirmPassword"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                placeholder="Confirm password"
                autoComplete="new-password"
                className={inputCls}
                required
              />
            </InputRow>

            {/* Error */}
            {signupError && (
              <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-center mb-2">
                <p className="text-sm font-medium text-red-600">
                  {signupErr?.response?.data?.error || 'Registration failed. Please try again.'}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={signupPending}
              className="mt-6 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {signupPending ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Switch to Login */}
            <p className="text-gray-500/90 text-sm mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setLoginData(initialLogin); }}
                className="text-indigo-400 hover:underline font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>

      {/* Override browser autofill yellow/blue tint globally for this page */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px white inset !important;
          -webkit-text-fill-color: #4b5563 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
