import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Video, HelpCircle, CheckSquare, ChevronRight } from 'lucide-react';
import { useModule, useCompleteModule } from '../hooks/useModules';
import { Spinner } from '../components/ui/Spinner';
import { GradientButton } from '../components/ui/GradientButton';

export const ModuleScreen: React.FC = () => {
  const { id, courseId } = useParams<{ id: string; courseId: string }>();
  const moduleId = id ? parseInt(id, 10) : undefined;
  const navigate = useNavigate();

  const { data: module, isLoading } = useModule(moduleId);
  const { mutateAsync: completeModule, isPending: completing } = useCompleteModule();

  const contentItems = [
    {
      type: 'summary',
      icon: FileText,
      label: 'Week Summary',
      desc: 'Full week study guide · objectives & content',
      action: () => navigate(`/courses/${courseId}/modules/${moduleId}/summary`),
    },
    ...(module?.resources ?? []).map((r) => ({
      type: r.type,
      icon: r.type === 'video' ? Video : FileText,
      label: r.title,
      desc: `${r.readTime} min read`,
      action: r.url
        ? () => window.open(r.url, '_blank', 'noopener,noreferrer')
        : null,
    })),
    {
      type: 'quiz',
      icon: HelpCircle,
      label: 'Knowledge Quiz',
      desc: 'AI-generated quiz · ~15 min',
      action: () => navigate(`/courses/${courseId}/modules/${moduleId}/quiz`),
    },
    {
      type: 'assignment',
      icon: CheckSquare,
      label: 'Coding Assignment',
      desc: `${module?.title ?? 'Module'} exercise`,
      action: () => navigate(`/courses/${courseId}/modules/${moduleId}/assignment`),
    },
  ];

  const completedCount = module?.status === 'done' ? contentItems.length : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Week {module?.weekNumber ?? '...'}
          </span>
          <h1 className="text-xl font-bold text-white mt-0.5">{module?.title ?? '...'}</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 glass-panel rounded-3xl flex items-center justify-center border border-white/5">
          <Spinner size="lg" color="text-indigo-500" />
        </div>
      ) : !module ? (
        <div className="glass-panel p-12 rounded-3xl text-center text-muted-foreground-dark">
          Module details not found.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress Header card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-lg space-y-4">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-white">Module Completion Progress</span>
              <span className="text-indigo-400">
                {completedCount > 0 ? Math.round((completedCount / contentItems.length) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                style={{
                  width: `${
                    completedCount > 0 ? Math.round((completedCount / contentItems.length) * 100) : 0
                  }%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground-dark">
              {completedCount} of {contentItems.length} tasks completed
            </p>
          </div>

          {/* Module checklist items */}
          <div className="space-y-3">
            {contentItems.map((item, i) => {
              const Icon = item.icon;
              const hasAction = !!item.action;

              return (
                <div
                  key={i}
                  onClick={() => item.action?.()}
                  className={`glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between gap-4 transition-all duration-300 ${
                    hasAction ? 'cursor-pointer hover:bg-white/5 hover:border-white/10 glow-card-hover' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm md:text-base leading-snug">
                        {item.label}
                      </h3>
                      <p className="text-xs text-muted-foreground-dark mt-1">{item.desc}</p>
                    </div>
                  </div>

                  {hasAction && (
                    <ChevronRight className="w-5 h-5 text-muted-foreground-dark group-hover:text-white transition-colors" />
                  )}
                </div>
              );
            })}
          </div>

          {module.status !== 'done' && (
            <GradientButton
              onClick={async () => {
                if (!moduleId) return;
                await completeModule(moduleId);
                navigate(`/courses/${courseId}`);
              }}
              loading={completing}
              className="w-full py-4"
            >
              Mark Module Complete
            </GradientButton>
          )}
        </div>
      )}
    </div>
  );
};
