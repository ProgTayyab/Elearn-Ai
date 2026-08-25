import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api, { aiApi } from '../api/client';
import { Module, Quiz, Assignment } from '../types';

export function useModules(courseId: number | undefined) {
  return useQuery<Module[]>({
    queryKey: ['modules', courseId],
    queryFn: async () => {
      const { data } = await api.get(`/courses/${courseId}/modules`);
      return data.modules;
    },
    enabled: !!courseId,
  });
}

export function useModule(id: number | undefined) {
  return useQuery<Module>({
    queryKey: ['module', id],
    queryFn: async () => {
      const { data } = await api.get(`/modules/${id}`);
      return data.module;
    },
    enabled: !!id,
  });
}

export interface ModuleSummaryDoc {
  summary: string;
  weekNumber: number;
  moduleTitle: string;
  courseTitle: string;
  generatedAt: string | null;
  cached: boolean;
}

export function useModuleSummary(moduleId: number | undefined) {
  const qc = useQueryClient();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const query = useQuery<ModuleSummaryDoc>({
    queryKey: ['moduleSummary', moduleId],
    queryFn: async () => {
      const { data } = await aiApi.get(`/modules/${moduleId}/summary`);
      return data as ModuleSummaryDoc;
    },
    enabled: !!moduleId,
    staleTime: 1000 * 60 * 30,
  });

  const regenerateDoc = async () => {
    if (!moduleId) return;
    setIsRegenerating(true);
    try {
      const { data } = await aiApi.get(`/modules/${moduleId}/summary?regenerate=true`);
      qc.setQueryData(['moduleSummary', moduleId], data);
      return data as ModuleSummaryDoc;
    } finally {
      setIsRegenerating(false);
    }
  };

  return { ...query, regenerateDoc, isRegenerating };
}

export function useCompleteModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/modules/${id}/complete`);
    },
    onSuccess: (_data, moduleId) => {
      qc.invalidateQueries({ queryKey: ['modules'] });
      qc.invalidateQueries({ queryKey: ['course'] });
      qc.invalidateQueries({ queryKey: ['module', moduleId] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// Quiz
export function useQuiz(moduleId: number | undefined) {
  return useQuery<Quiz>({
    queryKey: ['quiz', moduleId],
    queryFn: async () => {
      const { data } = await aiApi.get(`/modules/${moduleId}/quiz`);
      return data.quiz;
    },
    enabled: !!moduleId,
  });
}

export function useSubmitQuiz() {
  return useMutation({
    mutationFn: async (payload: { quizId: number; answers: Record<number, number>; timeTaken: number }) => {
      const { data } = await api.post(`/quizzes/${payload.quizId}/attempt`, {
        answers: payload.answers,
        timeTaken: payload.timeTaken,
      });
      return data as { score: number; correct: number; total: number };
    },
  });
}

// Assignment
export function useAssignment(moduleId: number | undefined) {
  return useQuery<Assignment>({
    queryKey: ['assignment', moduleId],
    queryFn: async () => {
      const { data } = await aiApi.get(`/modules/${moduleId}/assignment`);
      return data.assignment;
    },
    enabled: !!moduleId,
  });
}

export function useSubmitAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, code }: { id: number; code?: string }) => {
      const { data } = await api.patch(`/assignments/${id}/submit`, { code });
      return data.assignment as Assignment;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignment'] });
    },
  });
}
