import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import { useChatHistory, useSendMessage, getChatErrorMessage } from '../hooks/useChat';
import { Spinner } from '../components/ui/Spinner';

export const AITutorScreen: React.FC = () => {
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(undefined);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: chatHistory, isLoading: chatLoading } = useChatHistory(selectedCourseId);
  const { mutateAsync: sendMessage, isPending: sending } = useSendMessage(selectedCourseId);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (courses && courses.length > 0 && selectedCourseId === undefined) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, sending]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || !selectedCourseId) return;
    const txt = input.trim();
    setInput('');
    setError(null);
    try {
      await sendMessage(txt);
    } catch (err) {
      setError(getChatErrorMessage(err));
      setInput(txt);
    }
  };

  const messages = chatHistory ?? [];

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col justify-between animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-indigo-400" />
            AI Tutor
          </h1>
          <p className="text-xs text-muted-foreground-dark mt-1">
            Powered by Google Gemini — course-aware tutoring in real time
          </p>
        </div>

        {courses && courses.length > 0 && (
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(parseInt(e.target.value, 10));
              setError(null);
            }}
            className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer text-sm"
            aria-label="Select course context"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id} className="bg-background-dark text-white">
                {c.title.split(' — ')[0]}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {coursesLoading ? (
        <div className="flex-1 glass-panel rounded-3xl flex items-center justify-center border border-white/5">
          <Spinner size="lg" color="text-indigo-500" />
        </div>
      ) : !courses || courses.length === 0 ? (
        <div className="flex-1 glass-panel p-12 rounded-3xl flex flex-col items-center justify-center text-center gap-4 border border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">No courses generated yet</h2>
            <p className="text-sm text-muted-foreground-dark mt-2">
              Generate a course first to chat with the Gemini-powered AI tutor.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 glass-panel rounded-3xl border border-white/5 shadow-2xl flex flex-col overflow-hidden relative">
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {chatLoading ? (
              <div className="h-full flex items-center justify-center">
                <Spinner color="text-indigo-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-muted-foreground-dark">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-sm">Welcome! Ask anything about your course syllabus.</p>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-none shadow-lg'
                          : 'bg-white/5 border border-white/5 text-gray-200 rounded-bl-none'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-none p-4 flex items-center gap-2 text-sm text-indigo-400">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  Gemini is thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-black/10 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the syllabus or topic..."
              className="flex-1 h-12 px-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
              disabled={sending || chatLoading}
              maxLength={4000}
              aria-label="Chat message"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending || chatLoading}
              className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white transition-all disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
