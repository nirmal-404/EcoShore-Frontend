import { useState } from 'react';
import { Link } from 'react-router-dom';
import CommonForm from '@/components/common/Form.jsx';
import GoogleLogin from '@/components/auth/GoogleLogin';
import { registerFormControls } from '@/config/index.js';
import { useSignup } from '@/hooks/auth.js';

const initialFormData = {
  name: '',
  email: '',
  phoneNumber: '',
};

export default function Register() {
  const [formData, setFormData] = useState(initialFormData);

  const { mutate: signup, isPending, isError, error } = useSignup();

  function onSubmit(e) {
    e.preventDefault();

    // Client-side password match validation before hitting the API

    signup(formData);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Decorative background blobs */}
      <div className="absolute top-0 -right-10 w-96 h-96 bg-emerald-400 opacity-20 dark:opacity-10 rounded-full blur-3xl mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 opacity-20 dark:opacity-10 rounded-full blur-3xl mix-blend-multiply delay-1000" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50">
          <div className="p-8 sm:p-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                Join EcoShore
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create a new volunteer account
              </p>
            </div>

            {/* CommonForm replaces the hand-rolled inputs */}
            <CommonForm
              formControls={registerFormControls}
              formData={formData}
              setFormData={setFormData}
              onSubmit={onSubmit}
              isBtnDisabled={isPending}
              buttonText={isPending ? 'Creating Account...' : 'Create Account'}
            />

            {isError && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-center">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {error?.response?.data?.error ||
                    'Registration failed. Please try again.'}
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
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    or sign up with
                  </span>
                </div>
              </div>
              <div className="mt-6 flex justify-center w-full">
                <GoogleLogin />
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
