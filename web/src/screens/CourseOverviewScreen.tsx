import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, Lock, Play } from 'lucide-react';
import { useCourse } from '../hooks/useCourses';
import { useModules } from '../hooks/useModules';
import { Spinner } from '../components/ui/Spinner';

export const CourseOverviewScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = id ? parseInt(id, 10) : undefined;
  const navigate = useNavigate();

  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: modules, isLoading: modulesLoading } = useModules(courseId);

  const isLoading = courseLoading || modulesLoading;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/courses')}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-muted-foreground-dark uppercase tracking-wider">
          Syllabus Structure
        </span>
      </div>

      {isLoading ? (
        <div className="h-64 glass-panel rounded-3xl flex items-center justify-center border border-white/5">
          <Spinner size="lg" color="text-indigo-500" />
        </div>
      ) : !course ? (
        <div className="glass-panel p-12 rounded-3xl text-center text-muted-foreground-dark">
          Course not found.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Hero Banner card */}
          <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md shadow-inner">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                    {course.title.split(' — ')[0]}
                  </h1>
                  <p className="text-white/80 text-sm mt-1 font-medium">
                    {course.difficulty} · {course.durationWeeks} weeks · {course.progress}% completed
                  </p>
                </div>
              </div>

              {/* Progress visual */}
              <div className="flex flex-col gap-2 w-full md:w-48">
                <span className="text-white text-xs font-bold self-end">{course.progress}% Completed</span>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full shadow-lg"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Syllabus Modules checklist */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Course Modules</h2>
            <div className="grid grid-cols-1 gap-4">
              {(modules ?? []).map((mod) => {
                const isLocked = mod.status === 'locked';
                const isActive = mod.status === 'active';
                const isDone = mod.status === 'done';

                return (
                  <div
                    key={mod.id}
                    onClick={() => {
                      if (!isLocked) {
                        navigate(`/courses/${courseId}/modules/${mod.id}`);
                      }
                    }}
                    className={`glass-panel p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${
                      isLocked
                        ? 'opacity-60 border-white/5 cursor-not-allowed'
                        : 'border-white/5 cursor-pointer glow-card-hover'
                    } ${isActive ? 'ring-2 ring-indigo-500/50' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* State Badge */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-emerald-500/20 shadow-md'
                            : isActive
                            ? 'bg-indigo-500 text-white shadow-indigo-500/20 shadow-md'
                            : 'bg-white/5 text-gray-500'
                        }`}
                      >
                        {isDone && <CheckCircle className="w-5 h-5" />}
                        {isActive && <Play className="w-5 h-5 fill-current" />}
                        {isLocked && <Lock className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-indigo-400">
                          Week {mod.weekNumber}
                        </span>
                        <h3 className={`font-semibold text-base leading-snug mt-0.5 ${isLocked ? 'text-gray-400' : 'text-white'}`}>
                          {mod.title}
                        </h3>
                        <p className="text-xs text-muted-foreground-dark mt-1">
                          {mod.resources?.length ?? 0} resources included
                        </p>
                      </div>
                    </div>

                    {!isLocked && (
                      <span className="text-xs font-bold text-indigo-400 group-hover:underline">
                        {isDone ? 'Review' : 'Continue'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
