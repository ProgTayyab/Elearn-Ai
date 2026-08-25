import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Trophy } from 'lucide-react';
import { useQuiz, useSubmitQuiz } from '../hooks/useModules';
import { Spinner } from '../components/ui/Spinner';
import { GradientButton } from '../components/ui/GradientButton';

export const QuizScreen: React.FC = () => {
  const { id: moduleIdStr, courseId } = useParams<{ id: string; courseId: string }>();
  const moduleId = moduleIdStr ? parseInt(moduleIdStr, 10) : undefined;
  const navigate = useNavigate();

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null);
  const startTime = useRef(Date.now());

  const { data: quiz, isLoading } = useQuiz(moduleId);
  const { mutateAsync: submitQuiz, isPending: submitting } = useSubmitQuiz();

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner size="lg" color="text-indigo-500" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center text-muted-foreground-dark max-w-md mx-auto">
        Quiz modules not generated yet.
      </div>
    );
  }

  const questions = quiz.questions;
  const q = questions[currentQ];

  const handleSelect = (optionId: number) => {
    if (selected !== null) return;
    setSelected(optionId);
    setAnswers((prev) => ({ ...prev, [q.id]: optionId }));
  };

  const handleNext = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
    } else {
      const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
      try {
        const res = await submitQuiz({ quizId: quiz.id, answers, timeTaken });
        setResult(res);
      } catch {
        setResult({ score: 0, correct: 0, total: questions.length });
      }
      setDone(true);
    }
  };

  if (done && result) {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-fadeIn">
        <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl flex flex-col items-center text-center gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 blur-2xl pointer-events-none" />
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 relative z-10">
            <Trophy className="w-9 h-9" />
          </div>

          <div className="space-y-1 relative z-10">
            <h2 className="text-2xl font-extrabold text-white">Quiz Completed!</h2>
            <p className="text-sm text-muted-foreground-dark">Excellent effort, you have submitted successfully!</p>
          </div>

          <div className="w-full grid grid-cols-2 gap-4 py-4 border-y border-white/5 relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-extrabold text-indigo-400">
                {result.correct}/{result.total}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground-dark tracking-wider">
                Correct Answers
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-extrabold text-purple-400">
                {Math.round(result.score)}%
              </span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground-dark tracking-wider">
                Overall Score
              </span>
            </div>
          </div>

          <GradientButton
            onClick={() => navigate(`/courses/${courseId}/modules/${moduleId}`)}
            className="w-full py-4 relative z-10"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Back to Module</span>
          </GradientButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Knowledge Quiz</h1>
        </div>
        <span className="text-sm font-semibold text-muted-foreground-dark">
          {currentQ + 1} of {questions.length}
        </span>
      </div>

      {/* Progress tracking bar */}
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question container */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 shadow-xl space-y-6">
        <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed">
          {q.text}
        </h2>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {q.options.map((opt, i) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                disabled={selected !== null}
                className={`w-full p-5 rounded-2xl border text-left font-medium transition-all duration-300 flex items-center gap-4 ${
                  isSelected
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 ring-1 ring-indigo-500'
                    : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/8 hover:border-white/10'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isSelected ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  {['A', 'B', 'C', 'D'][i]}
                </div>
                <span className="flex-1 text-sm md:text-base leading-snug">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Next/Finish controller */}
        {selected !== null && (
          <div className="flex justify-end pt-4">
            <GradientButton onClick={handleNext} loading={submitting} className="w-full sm:w-auto px-8 py-3.5">
              <span>{currentQ < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
              <ArrowRight className="w-5 h-5" />
            </GradientButton>
          </div>
        )}
      </div>
    </div>
  );
};
