import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from 'next-themes';
import { logout } from '@/store/authSlice';
import {
  Waves,
  MessageSquare,
  LogOut,
  User,
  LayoutDashboard,
  ShieldCheck,
  Trash2,
  ChevronDown,
  CheckCircle,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors relative pb-0.5 ${
    isActive
      ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full'
      : 'text-foreground/70 hover:text-foreground'
  }`;

const ROLE_META = {
  volunteer: {
    label: 'Volunteer',
    color: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25',
    gradient: 'from-emerald-500 to-teal-500',
    icon: User,
    dashboardPath: '/volunteer',
    dashboardLabel: 'My Dashboard',
  },
  organizer: {
    label: 'Organizer',
    color: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',
    gradient: 'from-purple-500 to-indigo-500',
    icon: LayoutDashboard,
    dashboardPath: '/organizer',
    dashboardLabel: 'Organizer Panel',
  },
  admin: {
    label: 'Admin',
    color: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
    gradient: 'from-rose-500 to-pink-500',
    icon: ShieldCheck,
    dashboardPath: '/admin',
    dashboardLabel: 'Admin Dashboard',
  },
  collector: {
    label: 'Collector',
    color: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    gradient: 'from-amber-500 to-orange-500',
    icon: Trash2,
    dashboardPath: '/collector',
    dashboardLabel: 'Waste Collection',
  },
  agent: {
    label: 'Agent',
    color: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
    gradient: 'from-blue-500 to-cyan-500',
    icon: CheckCircle,
    dashboardPath: '/agent',
    dashboardLabel: 'Agent Dashboard',
  },
};

export default function Navbar() {
  const { user, token } = useSelector((state) => state.auth);
  const { theme, setTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const role = user?.role;
  const roleMeta = ROLE_META[role] || null;
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:supports-[backdrop-filter]:bg-slate-950/60 px-6 py-3 flex items-center justify-between">
      {/* LEFT — Logo + Nav Links */}
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground group-hover:rotate-12 transition-transform">
            <Waves className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Eco<span className="text-primary">Shore</span>
          </span>
        </Link>

        <div className="hidden md:flex gap-6 items-center">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          {role && role !== 'agent' && (
            <NavLink to="/analytics" className={navLinkClass}>
              Analytics
            </NavLink>
          )}
          <NavLink to="/beaches" className={navLinkClass}>
            Beaches
          </NavLink>
          {role !== 'agent' && (
            <>
              <NavLink to="/events" className={navLinkClass}>
                Events
              </NavLink>
              <NavLink to="/community" className={navLinkClass}>
                Community
              </NavLink>
            </>
          )}
          {token && (
            <NavLink to="/meetings" className={navLinkClass}>
              Meetings
            </NavLink>
          )}
        </div>
      </div>

      {/* RIGHT — Auth */}
      <div className="flex items-center gap-3">
        {role === 'admin' && (
          <div className="me-3">
            <NavLink to="/usermanagement" className={navLinkClass}>
              Users
            </NavLink>
          </div>
        )}
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-secondary/30 transition-all duration-200 text-foreground/70 hover:text-foreground"
          title={
            theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'
          }
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
        {!token ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Sign Up</Link>
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-border/60 hover:border-primary/40 hover:bg-secondary/30 transition-all duration-200 outline-none group">
                {/* Avatar */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm bg-gradient-to-br shrink-0',
                    roleMeta?.gradient || 'from-primary to-primary/60'
                  )}
                >
                  {initials}
                </div>

                {/* Name + role */}
                <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
                  <span className="text-[13px] font-semibold text-foreground truncate max-w-[110px]">
                    {user?.name || 'User'}
                  </span>
                  {roleMeta && (
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full',
                        roleMeta.color
                      )}
                    >
                      {roleMeta.label}
                    </span>
                  )}
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-64 mt-2 p-0 overflow-hidden rounded-2xl shadow-xl border border-border/60"
            >
              {/* Profile card header */}
              <div
                className={cn(
                  'px-4 pt-4 pb-3.5 bg-gradient-to-br',
                  roleMeta?.gradient
                    ? `${roleMeta.gradient} opacity-90`
                    : 'from-primary to-primary/70'
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Large avatar */}
                  <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-[15px] leading-tight truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-white/70 text-[11px] truncate mt-0.5">
                      {user?.email}
                    </p>
                    {roleMeta && (
                      <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full">
                        {roleMeta.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1.5">
                {/* Role-specific dashboard */}
                {roleMeta && (
                  <>
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl px-3 py-2.5 cursor-pointer gap-3"
                    >
                      <Link
                        to={roleMeta.dashboardPath}
                        className="flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                          <roleMeta.icon className="w-4 h-4 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {roleMeta.dashboardLabel}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            View your workspace
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1.5 mx-2" />
                  </>
                )}

                {/* Profile Link */}
                <DropdownMenuItem
                  asChild
                  className="rounded-xl px-3 py-2.5 cursor-pointer gap-3"
                >
                  <Link to="/profile" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Profile Settings
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Security and preferences
                      </p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-xl px-3 py-2.5 cursor-pointer gap-3 text-destructive focus:text-destructive focus:bg-destructive/8"
                >
                  <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <LogOut className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Log out</p>
                    <p className="text-[11px] text-muted-foreground">
                      Sign out of your account
                    </p>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
