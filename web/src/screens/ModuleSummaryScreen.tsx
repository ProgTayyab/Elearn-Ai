import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, FileText, Sparkles, AlertCircle } from 'lucide-react';
import { useModuleSummary } from '../hooks/useModules';
import { Spinner } from '../components/ui/Spinner';
import { MarkdownDocument } from '../components/ui/MarkdownDocument';
import { GradientButton } from '../components/ui/GradientButton';

export const ModuleSummaryScreen: React.FC = () => {
  const { id, courseId } = useParams<{ id: string; courseId: string }>();
  const moduleId = id ? parseInt(id, 10) : undefined;
  const navigate = useNavigate();

  const { data, isLoading, error, refetch, isFetching, regenerateDoc, isRegenerating } =
    useModuleSummary(moduleId);

  const handleDownload = () => {
    if (!data?.summary) return;
    const filename = `week-${data.weekNumber}-${data.moduleTitle.replace(/\s+/g, '-').toLowerCase()}.md`;
    const blob = new Blob([data.summary], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = () => {
    regenerateDoc();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/courses/${courseId}/modules/${moduleId}`)}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          aria-label="Back to module"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Week {data?.weekNumber ?? '...'} · Study Document
          </span>
          <h1 className="text-xl font-bold text-white mt-0.5 truncate">
            {data?.moduleTitle ?? 'Week Summary'}
          </h1>
        </div>
      </div>

      {isLoading || isFetching || isRegenerating ? (
        <div className="glass-panel rounded-3xl p-16 flex flex-col items-center justify-center gap-4 border border-white/5 min-h-[400px]">
          <Spinner size="lg" color="text-indigo-500" />
          <div className="text-center space-y-1">
            <p className="font-semibold text-white">Generating your week study guide...</p>
            <p className="text-sm text-muted-foreground-dark max-w-sm">
              Building a complete document with Week {data?.weekNumber ?? '1'} description, objectives, and content.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-indigo-400">
            <Sparkles className="w-4 h-4" />
            <span>Powered by NeuralLearn AI</span>
          </div>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 rounded-3xl border border-red-500/20 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-red-400 text-sm">Failed to load week summary. Please try again.</p>
          <GradientButton onClick={() => refetch()} className="mx-auto">
            <RefreshCw className="w-4 h-4" />
            Retry
          </GradientButton>
        </div>
      ) : data ? (
        <>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              Download .md
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isFetching || isRegenerating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-purple-400 ${isRegenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>

          <div className="glass-panel p-6 md:p-10 rounded-3xl border border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{data.courseTitle}</p>
                <p className="text-xs text-muted-foreground-dark">
                  {data.cached ? 'Saved document' : 'Newly generated'}
                  {data.generatedAt && ` · ${new Date(data.generatedAt).toLocaleString()}`}
                </p>
              </div>
            </div>
            <MarkdownDocument content={data.summary} />
          </div>
        </>
      ) : null}
    </div>
  );
};
