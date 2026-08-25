import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Flame, Clock, Trophy, Award, Sparkles, Save, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourses } from '../hooks/useCourses';
import { useAnalytics } from '../hooks/useAnalytics';
import { useUpdateProfile } from '../hooks/useProfile';
import { GradientButton } from '../components/ui/GradientButton';
import { UserAvatar, getDisplayName } from '../components/ui/UserAvatar';
import { Spinner } from '../components/ui/Spinner';

export const ProfileScreen: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const { data: courses } = useCourses();
  const { data: analytics } = useAnalytics();
  const { mutateAsync: updateProfile, isPending: saving } = useUpdateProfile();

  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setUsername(user.username ?? '');
      setProfilePicture(user.profilePicture ?? '');
    }
  }, [user]);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await logout();
      navigate('/login');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await updateProfile({
        name: name.trim(),
        username: username.trim() || undefined,
        profilePicture: profilePicture.trim() || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message ?? 'Failed to update profile');
    }
  };

  const streak = analytics?.streak ?? user?.streak ?? 0;
  const totalMinutes = analytics?.totalStudyMinutes ?? user?.totalStudyMinutes ?? 0;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';
  const lastLogin = user?.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleString()
    : '—';

  const achievements = [
    {
      name: 'Continuous Learner',
      desc: 'Maintain a study streak',
      unlocked: streak >= 3,
    },
    {
      name: 'Quiz Champion',
      desc: 'Average quiz score above 70%',
      unlocked: (analytics?.avgScore ?? 0) >= 70,
    },
    {
      name: 'Track Master',
      desc: 'Create your first AI course',
      unlocked: (courses?.length ?? 0) >= 1,
    },
  ];

  if (!user) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" color="text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-5 relative z-10">
          <UserAvatar user={user} size="lg" />
          <div>
            <h1 className="text-xl font-extrabold text-white leading-snug">{getDisplayName(user)}</h1>
            <p className="text-sm text-muted-foreground-dark mt-0.5">{user.email}</p>
            {user.username && (
              <p className="text-xs text-indigo-400 mt-1 font-medium">@{user.username}</p>
            )}
          </div>
        </div>

        <GradientButton
          onClick={handleLogout}
          className="md:w-auto py-3 px-6 text-sm relative z-10 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-transparent shadow-none hover:shadow-none"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </GradientButton>
      </div>

      <form onSubmit={handleSave} className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 space-y-5">
        <h2 className="text-lg font-bold text-white">Edit Profile</h2>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}
        {saved && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-2xl">
            Profile updated successfully.
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground-dark">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground-dark">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="learner_name"
            pattern="[a-z0-9_]{3,30}"
            className="w-full h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground-dark">
            Profile picture URL
          </label>
          <input
            type="url"
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
            placeholder="https://..."
            className="w-full h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground-dark pt-2">
          <div>
            <span className="block text-[10px] uppercase font-bold tracking-wider">Member since</span>
            <span className="text-white">{memberSince}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold tracking-wider">Last login</span>
            <span className="text-white">{lastLogin}</span>
          </div>
        </div>

        <GradientButton type="submit" loading={saving} className="w-full py-3">
          <Save className="w-5 h-5" />
          <span>Save Changes</span>
        </GradientButton>
      </form>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex flex-col items-center text-center gap-1.5 border border-white/5">
          <Flame className="w-6 h-6 text-red-400" />
          <span className="text-lg font-extrabold text-white">{streak} days</span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground-dark tracking-wider">Streak</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex flex-col items-center text-center gap-1.5 border border-white/5">
          <Clock className="w-6 h-6 text-indigo-400" />
          <span className="text-lg font-extrabold text-white">{totalMinutes} min</span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground-dark tracking-wider">Study time</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex flex-col items-center text-center gap-1.5 border border-white/5">
          <Trophy className="w-6 h-6 text-amber-400" />
          <span className="text-lg font-extrabold text-white">{courses?.length ?? 0}</span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground-dark tracking-wider">Courses</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Achievements
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {achievements.map((a) => (
            <div
              key={a.name}
              className={`glass-panel p-5 rounded-2xl border flex items-center gap-4 ${
                a.unlocked ? 'border-white/5' : 'border-white/5 opacity-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  a.unlocked ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-gray-500'
                }`}
              >
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{a.name}</h3>
                <p className="text-xs text-muted-foreground-dark mt-1">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
