// components/auth/GoogleLogin.jsx
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export default function GoogleLogin({ text = 'Continue with Google' }) {
  const handleLogin = () => {
    const backendUrl =
      import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogin}
      className="w-full flex items-center gap-2"
    >
      <LogIn className="w-4 h-4" />
      {text}
    </Button>
  );
}
