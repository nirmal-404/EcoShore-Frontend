import { Toaster } from '@/components/ui/sonner';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/common/Navbar.jsx';

export default function Layout() {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Navbar />
      <div className="flex-1 overflow-auto min-h-0">
        <Outlet />
      </div>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={true} />
    </div>
  );
}
