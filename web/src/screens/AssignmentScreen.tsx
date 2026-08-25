import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { useAssignment, useSubmitAssignment } from '../hooks/useModules';
import { Spinner } from '../components/ui/Spinner';
import { GradientButton } from '../components/ui/GradientButton';

export const AssignmentScreen: React.FC = () => {
  const { id: moduleIdStr } = useParams<{ id: string }>();
  const moduleId = moduleIdStr ? parseInt(moduleIdStr, 10) : undefined;
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const { data: assignment, isLoading } = useAssignment(moduleId);
  const { mutateAsync: submitAssignment, isPending: submitting } = useSubmitAssignment();

  const submitted = assignment?.status === 'submitted';

  const handleSubmit = async () => {
    if (!assignment || !code.trim()) return;
    try {
      await submitAssignment({ id: assignment.id, code });
    } catch {
      // Gracefully capture any error
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-white">Coding Assignment</h1>
      </div>

      {isLoading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <Spinner size="lg" color="text-indigo-500" />
        </div>
      ) : !assignment ? (
        <div className="glass-panel p-12 rounded-3xl text-center text-muted-foreground-dark max-w-md mx-auto">
          Assignment not generated for this module yet.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Task prompt card */}
          <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-indigo-500 border border-white/5 shadow-lg space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                Coding Task
              </span>
              <h2 className="text-xl font-extrabold text-white leading-snug mt-1">
                {assignment.title}
              </h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {assignment.description}
            </p>
            <div className="flex gap-2.5">
              <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/15">
                {assignment.language}
              </span>
              <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/15">
                {assignment.difficulty}
              </span>
            </div>
          </div>

          {/* IDE Simulation solution editor */}
          <div className="rounded-3xl bg-[#1E1E2E] border border-white/5 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                Interactive Workspace
              </span>
              <span className="text-xs font-mono text-gray-600">UTF-8 solution.py</span>
            </div>

            {submitted ? (
              <div className="h-48 flex flex-col items-center justify-center text-center gap-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 p-6">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
                <h3 className="font-bold text-white text-base">Solution Submitted!</h3>
                <p className="text-xs text-muted-foreground-dark max-w-xs">
                  Your code has been submitted successfully for compile and evaluation. Excellent job!
                </p>
              </div>
            ) : (
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={"def solution():\n    # Write your solution here\n    pass"}
                className="w-full h-64 p-5 bg-black/25 rounded-2xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm leading-relaxed resize-none border border-white/5"
                disabled={submitting}
              />
            )}
          </div>

          {/* Action button */}
          {!submitted && (
            <div className="flex justify-end">
              <GradientButton
                onClick={handleSubmit}
                disabled={!code.trim() || submitting}
                className="w-full sm:w-auto px-8 py-3.5"
              >
                <Send className="w-5 h-5" />
                <span>Submit Solution</span>
              </GradientButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
