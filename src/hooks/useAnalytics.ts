import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export interface CourseRisk {
    id: number;
    courseId: number;
    courseTitle: string;
    riskLevel: string;
    predictedAt: string;
}

export interface CourseStats {
    id: number;
    title: string;
    progress: number;
}

export interface Analytics {
    streak: number;
    totalStudyMinutes: number;
    avgScore: number;
    courseCount: number;
    courseStats: CourseStats[];
    risks: CourseRisk[];
}

export function useAnalytics() {
    return useQuery<Analytics>({
        queryKey: ['analytics'],
        queryFn: async () => {
            const { data } = await api.get('/analytics');
            return data as Analytics;
        },
    });
}
