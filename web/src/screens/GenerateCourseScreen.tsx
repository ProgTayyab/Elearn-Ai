import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { useCreateCourse } from '../hooks/useCourses';
import { GradientButton } from '../components/ui/GradientButton';

const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
const durationOptions = [
  { label: '4 weeks', value: 4 },
  { label: '6 weeks', value: 6 },
  { label: '8 weeks', value: 8 },
];

export const GenerateCourseScreen: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  const [durationIdx, setDurationIdx] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { mutateAsync: createCourse, isPending } = useCreateCourse();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setError(null);
    try {
      const course = await createCourse({
        topic: topic.trim(),
        difficulty: difficulties[difficulty],
        durationWeeks: durationOptions[durationIdx].value,
      });
      navigate(`/courses/${course.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to generate course. Please try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Generate Study Track</h1>
      </div>

      {isPending ? (
        /* Dynamic loading indicator */
        <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-6 border border-white/5 shadow-2xl relative overflow-hidden h-[450px]">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 blur-3xl animate-pulse" />
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 animate-bounce relative z-10">
            <Sparkles className="w-10 h-10" />
          </div>
          <div className="space-y-2 relative z-10">
            <h2 className="text-2xl font-extrabold text-white">Assembling personalized modules...</h2>
            <p className="text-sm text-muted-foreground-dark max-w-sm mx-auto leading-relaxed">
              Curating resources, generating test banks, and tailoring objectives to study "{topic}"
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/15 animate-pulse relative z-10">
            <div className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Consulting Synapse Neural Model</span>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-6 md:p-8 rounded-3xl space-y-6 border border-white/5 shadow-xl relative overflow-hidden">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Topic entry */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground-dark">
              Course Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Deep Learning, Rust, Microeconomics, Flutter"
              className="w-full h-13 px-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-base"
            />
          </div>

          {/* Difficulty segment selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground-dark">
              Expertise Level
            </label>
            <div className="grid grid-cols-3 bg-white/5 p-1 rounded-2xl border border-white/5 gap-1">
              {difficulties.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(i)}
                  className={`py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    i === difficulty
                      ? 'bg-white/10 text-white shadow-md'
                      : 'text-muted-foreground-dark hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Duration segment selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground-dark">
              Study Duration
            </label>
            <div className="grid grid-cols-3 bg-white/5 p-1 rounded-2xl border border-white/5 gap-1">
              {durationOptions.map((d, i) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => setDurationIdx(i)}
                  className={`py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    i === durationIdx
                      ? 'bg-white/10 text-white shadow-md'
                      : 'text-muted-foreground-dark hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <GradientButton
            onClick={handleGenerate}
            disabled={!topic.trim()}
            className="w-full py-4 mt-4"
          >
            <Sparkles className="w-5 h-5" />
            <span>Generate Course with AI</span>
          </GradientButton>
        </div>
      )}
    </div>
  );
};
