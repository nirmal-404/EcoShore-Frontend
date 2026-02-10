import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/authSlice';

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
    <nav className="border-b px-6 py-3 flex items-center justify-between">
      {/* LEFT SIDE */}
      <NavigationMenu>
        <NavigationMenuList className="flex gap-6">
          <NavigationMenuItem>
            <Link to="/" className="font-semibold">
              Home
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link to="/events">Events</Link>
          </NavigationMenuItem>

          {user?.role === 'volunteer' && (
            <NavigationMenuItem>
              <Link to="/volunteer">Volunteer</Link>
            </NavigationMenuItem>
          )}

          {user?.role === 'organizer' && (
            <NavigationMenuItem>
              <Link to="/organizer">Organizer</Link>
            </NavigationMenuItem>
          )}

          {user?.role === 'admin' && (
            <NavigationMenuItem>
              <Link to="/admin">Admin</Link>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>

      {/* RIGHT SIDE */}
      <div>
        {!token ? (
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarFallback>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>{user?.email}</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
