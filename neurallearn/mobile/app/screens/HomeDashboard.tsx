import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, BookOpen, Trophy, TrendingUp, Flame } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, GradientColors } from '../../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../../store/authStore';
import { useCourses } from '../../hooks/useCourses';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const gradientPalette: [string, string][] = [
    ['#3B82F6', '#06B6D4'],
    ['#A855F7', '#EC4899'],
    ['#22C55E', '#10B981'],
    ['#F59E0B', '#EF4444'],
    ['#6366F1', '#8B5CF6'],
];

const weekBars = [40, 65, 80, 55, 90, 70, 30];
const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HomeDashboard() {
    const navigation = useNavigation<Nav>();
    const user = useAuthStore((s) => s.user);
    const { data: courses, isLoading } = useCourses();

    const activeCourses = (courses ?? []).slice(0, 3);
    const avgScore = 84; // will come from analytics in analytics screen
    const streak = 0;

    const now = new Date();
    const hour = now.getHours();
    const greeting =
        hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const stats = [
        { Icon: BookOpen, label: 'Courses', value: String(courses?.length ?? 0) },
        { Icon: Trophy, label: 'Avg Score', value: `${avgScore}%` },
        { Icon: Flame, label: 'Streak', value: `${streak}d` },
        { Icon: TrendingUp, label: 'Hours', value: '4.2/w' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>{greeting} 👋</Text>
                    <Text style={styles.heading}>
                        {user?.name ? `Hi, ${user.name.split(' ')[0]}!` : 'What do you want to master today?'}
                    </Text>
                </View>

                {/* Generate CTA */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('GenerateCourse')}
                    activeOpacity={0.88}
                    style={styles.generateWrapper}
                >
                    <LinearGradient
                        colors={GradientColors.synapse}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.generateGradient}
                    >
                        <View style={styles.generateIcon}>
                            <Plus size={24} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.generateTitle}>Generate New Course</Text>
                            <Text style={styles.generateSub}>AI-powered, tailored to you</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                    {stats.map((s) => (
                        <View key={s.label} style={styles.statCard}>
                            <s.Icon size={18} color={Colors.primary} strokeWidth={1.5} />
                            <Text style={styles.statValue}>{s.value}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Active Courses */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Active Courses</Text>
                        <TouchableOpacity onPress={() => { }}>
                            <Text style={styles.seeAll}>See all</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
                    ) : activeCourses.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No courses yet. Generate your first one!</Text>
                        </View>
                    ) : (
                        activeCourses.map((course, idx) => (
                            <TouchableOpacity
                                key={course.id}
                                onPress={() => navigation.navigate('CourseOverview', { id: course.id })}
                                activeOpacity={0.88}
                                style={styles.courseCard}
                            >
                                <LinearGradient
                                    colors={gradientPalette[idx % gradientPalette.length]}
                                    style={styles.courseIcon}
                                >
                                    <BookOpen size={20} color="#fff" />
                                </LinearGradient>
                                <View style={styles.courseInfo}>
                                    <Text style={styles.courseTitle}>{course.title}</Text>
                                    <Text style={styles.courseMeta}>{course.difficulty} · {course.durationWeeks} weeks</Text>
                                </View>
                                <Text style={styles.courseProgress}>{course.progress}%</Text>

                                <View style={styles.progressTrack}>
                                    <LinearGradient
                                        colors={GradientColors.synapse}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[styles.progressFill, { width: `${course.progress}%` }]}
                                    />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Weekly Progress */}
                <View style={styles.weekCard}>
                    <Text style={styles.sectionTitle}>This Week</Text>
                    <View style={styles.barChart}>
                        {weekBars.map((h, i) => (
                            <View key={i} style={styles.barCol}>
                                <View style={[styles.barTrack, { height: 80 }]}>
                                    {i === 4 ? (
                                        <LinearGradient
                                            colors={GradientColors.synapse}
                                            style={[styles.bar, { height: `${h}%` }]}
                                        />
                                    ) : (
                                        <View style={[styles.barMuted, { height: `${h}%` }]} />
                                    )}
                                </View>
                                <Text style={styles.barDay}>{weekDays[i]}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },
    header: { marginBottom: 20 },
    greeting: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, marginBottom: 4 },
    heading: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.foreground, letterSpacing: -0.4 },
    generateWrapper: {
        borderRadius: 20, overflow: 'hidden', marginBottom: 20,
        shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    generateGradient: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20 },
    generateIcon: {
        width: 48, height: 48, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center',
    },
    generateTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
    generateSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)' },
    statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
    statCard: {
        flex: 1, backgroundColor: Colors.card, borderRadius: 16,
        padding: 12, alignItems: 'center', gap: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    statValue: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.foreground },
    statLabel: { fontSize: 10, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground },
    section: { marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.foreground },
    seeAll: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.primary },
    emptyCard: {
        backgroundColor: Colors.card, borderRadius: 16, padding: 24,
        alignItems: 'center',
    },
    emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground },
    courseCard: {
        backgroundColor: Colors.card, borderRadius: 20, padding: 16,
        marginBottom: 10, flexDirection: 'row', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    courseIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    courseInfo: { flex: 1 },
    courseTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.foreground },
    courseMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, marginTop: 2 },
    courseProgress: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.primary },
    progressTrack: { width: '100%', height: 5, backgroundColor: Colors.secondary, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    weekCard: {
        backgroundColor: Colors.card, borderRadius: 20, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 16 },
    barCol: { flex: 1, alignItems: 'center', gap: 4 },
    barTrack: { width: '100%', justifyContent: 'flex-end', borderRadius: 6, overflow: 'hidden' },
    bar: { width: '100%', borderRadius: 6 },
    barMuted: { width: '100%', backgroundColor: Colors.secondary, borderRadius: 6 },
    barDay: { fontSize: 9, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground },
});
