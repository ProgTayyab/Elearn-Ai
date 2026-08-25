import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, BarChart3, MessageSquare, User, LogOut, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserAvatar, getDisplayName, getFirstName } from '../ui/UserAvatar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'AI Tutor', path: '/tutor', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await logout();
      navigate('/login');
    }
  };

  const displayName = getDisplayName(user);

  return (
    <div className="min-h-screen bg-background-dark text-foreground-dark flex flex-col md:flex-row">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[35rem] h-[35rem] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <aside className="hidden md:flex flex-col w-64 fixed top-0 bottom-0 left-0 glass-panel border-r border-border-dark z-20 m-4 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Synapse
            </h1>
            <p className="text-[10px] text-muted-foreground-dark tracking-wide uppercase font-semibold">
              AI Learning Hub
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground-dark mb-4 px-2">
          Welcome, <span className="text-white font-semibold">{getFirstName(user)}</span>
        </p>

        <Link
          to="/profile"
          className="flex items-center gap-3 mb-8 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
        >
          <UserAvatar user={user} size="md" />
          <div className="truncate min-w-0">
            <h3 className="font-semibold text-sm truncate text-white">{displayName}</h3>
            <p className="text-xs text-muted-foreground-dark truncate">
              {user?.username ? `@${user.username}` : user?.email}
            </p>
          </div>
        </Link>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 py-3.5 px-4 rounded-2xl font-medium text-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-600/20 text-indigo-400 border border-indigo-500/20 glow-card'
                    : 'text-muted-foreground-dark hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-muted-foreground-dark'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 py-3.5 px-4 rounded-2xl font-medium text-sm text-red-400 hover:bg-red-500/10 transition-colors border border-transparent w-full mt-auto"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          Sign Out
        </button>
      </aside>

      <main className="flex-1 md:pl-72 z-10 px-4 py-6 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        <header className="flex md:hidden items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar user={user} size="sm" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground-dark uppercase tracking-wide">Welcome</p>
              <h1 className="font-bold text-sm tracking-tight truncate">{displayName}</h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4 text-red-400" />
          </button>
        </header>

        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-border-dark flex justify-around py-3 px-2 z-20 rounded-t-3xl shadow-2xl">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-300 ${
                isActive ? 'text-indigo-400 font-semibold' : 'text-muted-foreground-dark'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-muted-foreground-dark'}`} />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
