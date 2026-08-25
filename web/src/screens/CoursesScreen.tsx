import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus } from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import { Spinner } from '../components/ui/Spinner';

const gradientPalette = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-500',
  'from-green-500 to-emerald-600',
  'from-amber-500 to-red-500',
  'from-indigo-600 to-violet-600',
];

export const CoursesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { data: courses, isLoading } = useCourses();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Learning Modules</h1>
          <p className="text-sm text-muted-foreground-dark mt-1">Manage and access all your dynamic AI study tracks</p>
        </div>
        <button
          onClick={() => navigate('/generate-course')}
          className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-indigo-500/25 flex items-center justify-center text-white font-bold transition-all duration-300 transform active:scale-95 shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 glass-panel rounded-3xl flex items-center justify-center border border-white/5">
          <Spinner size="lg" color="text-indigo-500" />
        </div>
      ) : !courses || courses.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-4 max-w-lg mx-auto border border-white/5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">No courses generated yet</h2>
            <p className="text-sm text-muted-foreground-dark mt-2 leading-relaxed">
              Tap the button below or at the top right to create your first fully customized AI-generated learning module.
            </p>
          </div>
          <button
            onClick={() => navigate('/generate-course')}
            className="px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 font-semibold text-white transition-colors"
          >
            Create your first module
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => (
            <div
              key={course.id}
              onClick={() => navigate(`/courses/${course.id}`)}
              className="group cursor-pointer rounded-3xl overflow-hidden glass-panel border border-white/5 shadow-lg glow-card-hover flex flex-col justify-between"
            >
              {/* Card Banner */}
              <div
                className={`h-36 bg-gradient-to-tr ${
                  gradientPalette[idx % gradientPalette.length]
                } p-6 flex flex-col justify-between relative`}
              >
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    {course.difficulty}
                  </span>
                </div>
                <h3 className="font-extrabold text-lg text-white leading-tight truncate group-hover:translate-x-1 transition-transform duration-300">
                  {course.title.split(' — ')[0]}
                </h3>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-muted-foreground-dark uppercase font-bold tracking-wider">
                    Topic Area
                  </p>
                  <p className="text-white font-medium text-sm mt-1">{course.topic}</p>
                  <p className="text-xs text-muted-foreground-dark mt-2 font-medium">
                    Duration: {course.durationWeeks} weeks
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground-dark">Syllabus Progress</span>
                    <span className="text-indigo-400">{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${
                        gradientPalette[idx % gradientPalette.length]
                      } rounded-full`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
