import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

export interface Course {
    id: number;
    title: string;
    topic: string;
    difficulty: string;
    durationWeeks: number;
    status: string;
    progress: number;
    modules: { id: number; status: string }[];
}

export function useCourses() {
    return useQuery<Course[]>({
        queryKey: ['courses'],
        queryFn: async () => {
            const { data } = await api.get('/courses');
            return data.courses;
        },
    });
}

export function useCourse(id: number | undefined) {
    return useQuery<Course>({
        queryKey: ['course', id],
        queryFn: async () => {
            const { data } = await api.get(`/courses/${id}`);
            return data.course;
        },
        enabled: !!id,
    });
}

export function useCreateCourse() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { topic: string; difficulty: string; durationWeeks: number }) => {
            const { data } = await api.post('/courses', payload);
            return data.course as Course;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['courses'] });
        },
    });
}

export function useDeleteCourse() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/courses/${id}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['courses'] });
        },
    });
}
