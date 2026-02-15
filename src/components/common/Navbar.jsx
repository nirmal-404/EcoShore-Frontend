import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/authSlice';
import { Waves } from 'lucide-react';

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from '@/components/ui/navigation-menu';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Navbar() {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 flex items-center justify-between">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground group-hover:rotate-12 transition-transform">
            <Waves className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Eco<span className="text-primary">Shore</span>
          </span>
        </Link>

        <div className="hidden md:flex gap-6 items-center">
          <Link
            to="/"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            to="/events"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Events
          </Link>
          <Link
            to="/beaches"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Beaches
          </Link>

          {user?.role === 'volunteer' && (
            <Link
              to="/volunteer"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              My Profile
            </Link>
          )}

          {user?.role === 'organizer' && (
            <Link
              to="/organizer"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Organizer Panel
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Admin Dashboard
            </Link>
          )}

          {user?.role === 'collector' && (
            <Link
              to="/collector"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Waste Collection
            </Link>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        {!token ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Sign Up</Link>
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-border hover:bg-secondary/50 transition-colors">
                <span className="text-sm font-medium hidden sm:inline-block">
                  {user?.name}
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 mt-2">
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Signed in as
                </p>
                <p className="text-sm font-semibold truncate">{user?.email}</p>
              </div>
              <div className="h-px bg-border my-1" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
