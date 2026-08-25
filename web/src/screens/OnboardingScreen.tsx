import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, BarChart3, ChevronRight } from 'lucide-react';
import { GradientButton } from '../components/ui/GradientButton';

const slides = [
  {
    Icon: Sparkles,
    title: 'Generate your own course',
    description:
      'Enter any topic and our AI creates a complete, structured learning path tailored to your level.',
  },
  {
    Icon: BookOpen,
    title: 'Learn through modules & tasks',
    description:
      'Each week brings summaries, articles, videos, quizzes, and coding assignments — all curated for you.',
  },
  {
    Icon: BarChart3,
    title: 'Track progress with AI analytics',
    description:
      'Real-time performance insights and risk predictions keep you on the path to mastery.',
  },
];

export const OnboardingScreen: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const navigate = useNavigate();

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      if (current < slides.length - 1) {
        setCurrent(current + 1);
        setFade(true);
      } else {
        navigate('/login');
      }
    }, 200);
  };

  const slide = slides[current];
  const Icon = slide.Icon;

  return (
    <div className="relative min-h-screen bg-background-dark overflow-hidden flex flex-col items-center justify-between p-6">
      {/* Mesh background styling */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-background-dark to-purple-950/40 z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />

      {/* Header Logo */}
      <header className="w-full max-w-lg flex justify-start z-10 py-4">
        <h1 className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          Synapse
        </h1>
      </header>

      {/* Main Slide Carousel container */}
      <main className="w-full max-w-md flex flex-col items-center justify-center text-center z-10 flex-1 px-4">
        <div
          className={`flex flex-col items-center transition-all duration-300 transform ${
            fade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Glass Box Icon */}
          <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl mb-8 relative group">
            <div className="absolute inset-0 rounded-3xl bg-indigo-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
            <Icon className="w-10 h-10 text-white relative z-10" />
          </div>

          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            {slide.title}
          </h2>
          <p className="text-gray-400 text-base leading-relaxed max-w-sm">
            {slide.description}
          </p>
        </div>
      </main>

      {/* Footer Controllers */}
      <footer className="w-full max-w-md flex flex-col items-center gap-8 z-10 pb-8">
        {/* Indicators */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setFade(false);
                setTimeout(() => {
                  setCurrent(i);
                  setFade(true);
                }, 200);
              }}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                i === current ? 'w-8 bg-indigo-500 shadow-md shadow-indigo-500/50' : 'w-2.5 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* CTA Action */}
        <GradientButton onClick={handleNext} className="w-full py-4">
          <span>{current === slides.length - 1 ? 'Get Started' : 'Continue'}</span>
          <ChevronRight className="w-5 h-5" />
        </GradientButton>
      </footer>
    </div>
  );
};
