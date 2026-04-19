import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './useApi';

export interface ModuleObjective { id: number; text: string; completed: boolean }
export interface Resource { id: number; type: string; title: string; url: string; readTime: number }

export interface Module {
    id: number;
    courseId: number;
    weekNumber: number;
    title: string;
    description: string;
    status: string;
    order: number;
    objectives: ModuleObjective[];
    resources: Resource[];
}

export interface QuizOption { id: number; text: string }
export interface Question { id: number; text: string; type: string; order: number; options: QuizOption[] }
export interface Quiz { id: number; moduleId: number; questions: Question[] }

export interface Assignment {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    language: string;
    status: string;
}

// Modules
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

export function useCompleteModule() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.patch(`/modules/${id}/complete`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['modules'] });
            qc.invalidateQueries({ queryKey: ['course'] });
        },
    });
}

// Quiz
export function useQuiz(moduleId: number | undefined) {
    return useQuery<Quiz>({
        queryKey: ['quiz', moduleId],
        queryFn: async () => {
            const { data } = await api.get(`/modules/${moduleId}/quiz`);
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
            const { data } = await api.get(`/modules/${moduleId}/assignment`);
            return data.assignment;
        },
        enabled: !!moduleId,
    });
}

export function useSubmitAssignment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await api.patch(`/assignments/${id}/submit`);
            return data.assignment as Assignment;
        },
        onSuccess: (_data, id) => {
            qc.invalidateQueries({ queryKey: ['assignment'] });
        },
    });
}
