import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Trophy, TrendingUp, Flame, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getFirstName } from '../components/ui/UserAvatar';
import { useCourses } from '../hooks/useCourses';
import { useAnalytics } from '../hooks/useAnalytics';
import { Spinner } from '../components/ui/Spinner';

const gradientPalette = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-amber-500 to-red-500',
  'from-indigo-500 to-violet-500',
];

const weekBars = [40, 65, 80, 55, 90, 70, 30];
const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: courses, isLoading } = useCourses();
  const { data: analytics } = useAnalytics();

  const activeCourses = (courses ?? []).slice(0, 3);
  const avgScore = analytics?.avgScore ?? 0;
  const streak = analytics?.streak ?? 0;
  const hoursWeek = analytics ? (analytics.totalStudyMinutes / 60).toFixed(1) : '0';

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { icon: BookOpen, label: 'Active Courses', value: String(courses?.length ?? 0), color: 'text-indigo-400' },
    { icon: Trophy, label: 'Avg quiz score', value: `${avgScore}%`, color: 'text-amber-400' },
    { icon: Flame, label: 'Study streak', value: `${streak}d`, color: 'text-red-400' },
    { icon: TrendingUp, label: 'Hours studied', value: `${hoursWeek}h`, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Dynamic Header */}
      <div>
        <span className="text-xs font-semibold text-muted-foreground-dark uppercase tracking-wider">
          {greeting} 👋
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
          {user ? `Hello, ${getFirstName(user)}!` : 'What do you want to master today?'}
        </h1>
      </div>

      {/* Generate Course Action Box */}
      <div
        onClick={() => navigate('/generate-course')}
        className="relative overflow-hidden group rounded-3xl cursor-pointer p-6 md:p-8 bg-gradient-to-r from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-1 active:scale-99"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative flex items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-xl md:text-2xl text-white">Generate New Course</h2>
              <p className="text-white/80 text-sm md:text-base mt-1">AI-powered learning, tailored to your objectives</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white/80 group-hover:text-white transition-colors hidden sm:block" />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="glass-panel p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-white/5 glow-card-hover"
            >
              <Icon className={`w-6 h-6 ${s.color}`} />
              <span className="text-2xl font-extrabold text-white">{s.value}</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground-dark tracking-wider">
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Active Courses + Weekly Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Courses */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Active Courses</h2>
            <Link to="/courses" className="text-indigo-400 font-semibold text-sm hover:underline">
              See all
            </Link>
          </div>

          {isLoading ? (
            <div className="h-48 glass-panel rounded-2xl flex items-center justify-center">
              <Spinner color="text-indigo-500" />
            </div>
          ) : activeCourses.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3">
              <BookOpen className="w-10 h-10 text-muted-foreground-dark" />
              <p className="text-muted-foreground-dark text-sm">
                No active courses yet. Generate one above to begin!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeCourses.map((course, idx) => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer border border-white/5 glow-card-hover"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${
                        gradientPalette[idx % gradientPalette.length]
                      } flex items-center justify-center text-white shadow-md`}
                    >
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">{course.title}</h3>
                      <p className="text-xs text-muted-foreground-dark mt-1">
                        {course.difficulty} · {course.durationWeeks} weeks
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                    <span className="font-extrabold text-indigo-400 text-sm">{course.progress}%</span>
                    <div className="w-full sm:w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Weekly Progress Chart */}
        <section className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-bold text-white">This Week</h2>
          <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between h-[282px] border border-white/5 shadow-md">
            <div className="flex items-end justify-between h-48 gap-3 px-2">
              {weekBars.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                  <div className="w-full bg-white/5 rounded-2xl overflow-hidden h-full flex flex-col justify-end">
                    {i === 4 ? (
                      <div
                        className="w-full bg-gradient-to-t from-indigo-500 to-purple-600 rounded-t-2xl shadow-lg shadow-indigo-500/20"
                        style={{ height: `${h}%` }}
                      />
                    ) : (
                      <div className="w-full bg-white/10 rounded-t-2xl" style={{ height: `${h}%` }} />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground-dark">{weekDays[i]}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground-dark text-center mt-2 font-medium">
              Study habits are stable. 84% average scores this week.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
