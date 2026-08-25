import React from 'react';
import { BarChart3, Flame, Clock, Trophy, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { Spinner } from '../components/ui/Spinner';

export const AnalyticsScreen: React.FC = () => {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spinner size="lg" color="text-indigo-500" />
      </div>
    );
  }

  const risks = analytics?.risks ?? [];
  const streak = analytics?.streak ?? 0;
  const totalStudyMinutes = analytics?.totalStudyMinutes ?? 0;
  const avgScore = analytics?.avgScore ?? 0;
  const courseCount = analytics?.courseCount ?? 0;

  const cardStats = [
    { label: 'Study Streak', value: `${streak} days`, icon: Flame, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Time Studied', value: `${totalStudyMinutes} mins`, icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Avg quiz score', value: `${avgScore}%`, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Generated tracks', value: String(courseCount), icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-indigo-400" />
          Neural Analytics
        </h1>
        <p className="text-xs text-muted-foreground-dark mt-1">
          Machine Learning predictions and personal performance metrics synchronized in real-time
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cardStats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-white/5 shadow-md relative overflow-hidden"
            >
              <div className="flex justify-between items-start gap-4">
                <span className="text-xs font-bold text-muted-foreground-dark uppercase tracking-wider">
                  {s.label}
                </span>
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-white mt-4">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* ML predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            FastAPI AI Risk Predictions
          </h2>

          {risks.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-muted-foreground-dark border border-white/5">
              Generate dynamic courses to begin evaluating course completion risks.
            </div>
          ) : (
            <div className="space-y-4">
              {risks.map((risk) => {
                const isHigh = risk.riskLevel === 'High';
                const isMedium = risk.riskLevel === 'Medium';

                const alertBg = isHigh
                  ? 'bg-red-500/5 border-red-500/20'
                  : isMedium
                  ? 'bg-amber-500/5 border-amber-500/20'
                  : 'bg-emerald-500/5 border-emerald-500/20';

                const iconColor = isHigh
                  ? 'text-red-400 bg-red-500/10'
                  : isMedium
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-emerald-400 bg-emerald-500/10';

                return (
                  <div
                    key={risk.id}
                    className={`glass-panel p-5 rounded-2xl border ${alertBg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
                        {isHigh || isMedium ? (
                          <AlertTriangle className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white leading-snug">{risk.courseTitle}</h3>
                        <p className="text-xs text-muted-foreground-dark mt-1">
                          Evaluated: {new Date(risk.predictedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground-dark tracking-wider">
                        Risk Level:
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          isHigh
                            ? 'text-red-400 bg-red-500/15 border border-red-500/20'
                            : isMedium
                            ? 'text-amber-400 bg-amber-500/15 border border-amber-500/20'
                            : 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/20'
                        }`}
                      >
                        {risk.riskLevel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Study tips sidebar */}
        <section className="lg:col-span-4 space-y-4">
          <h2 className="text-lg font-bold text-white">Study Optimizer</h2>
          <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-lg space-y-4">
            <h3 className="font-bold text-white text-sm">Suggested AI Actions</h3>
            <ul className="space-y-3.5 text-xs text-muted-foreground-dark leading-relaxed font-medium">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <span>Keep study streaks above 3 days to establish consistent learning loops.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                <span>Submit coding assignments before completing weekly summaries for faster review cycles.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <span>Consult the AI Tutor whenever quiz averages drop below 80% on a course track.</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};
