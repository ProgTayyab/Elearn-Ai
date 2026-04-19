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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, BookOpen, CheckCircle, Lock, Play } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, GradientColors } from '../../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCourse } from '../../hooks/useCourses';
import { useModules } from '../../hooks/useModules';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'CourseOverview'>;

export default function CourseOverview() {
    const navigation = useNavigation<Nav>();
    const { params } = useRoute<Route>();
    const { data: course, isLoading: courseLoading } = useCourse(params.id);
    const { data: modules, isLoading: modulesLoading } = useModules(params.id);

    const isLoading = courseLoading || modulesLoading;

    return (
        <SafeAreaView style={styles.container}>
            {/* Hero */}
            <LinearGradient
                colors={['#3B82F6', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <View style={styles.heroIcon}>
                    <BookOpen size={28} color="#fff" />
                </View>
                <Text style={styles.heroTitle}>{course?.title ?? '...'}</Text>
                <Text style={styles.heroMeta}>
                    {course?.difficulty} · {course?.durationWeeks} weeks · {course?.progress ?? 0}% complete
                </Text>

                <View style={styles.progressTrack}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressFill, { width: `${course?.progress ?? 0}%` }]}
                    />
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Course Modules</Text>

                {isLoading ? (
                    <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
                ) : (modules ?? []).map((mod) => (
                    <TouchableOpacity
                        key={mod.id}
                        activeOpacity={mod.status === 'locked' ? 1 : 0.88}
                        onPress={() => mod.status !== 'locked' && navigation.navigate('ModuleScreen', { id: mod.id, courseId: params.id })}
                        style={[styles.moduleCard, mod.status === 'active' && styles.moduleCardActive]}
                    >
                        <View style={[
                            styles.weekBadge,
                            mod.status === 'done' && styles.weekBadgeDone,
                            mod.status === 'active' && styles.weekBadgeActive,
                            mod.status === 'locked' && styles.weekBadgeLocked,
                        ]}>
                            {mod.status === 'done' && <CheckCircle size={16} color="#fff" />}
                            {mod.status === 'active' && <Play size={16} color="#fff" fill="#fff" />}
                            {mod.status === 'locked' && <Lock size={14} color={Colors.mutedForeground} />}
                        </View>
                        <View style={styles.moduleInfo}>
                            <Text style={[styles.moduleWeek, mod.status === 'locked' && styles.textMuted]}>
                                Week {mod.weekNumber}
                            </Text>
                            <Text style={[styles.moduleTitle, mod.status === 'locked' && styles.textMuted]}>
                                {mod.title}
                            </Text>
                            <Text style={styles.moduleLessons}>
                                {mod.resources?.length ?? 0} resources
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    hero: { padding: 24, paddingTop: 16, gap: 10 },
    backBtn: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    },
    heroIcon: {
        width: 56, height: 56, borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center', marginBottom: 4,
    },
    heroTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.4 },
    heroMeta: { fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)' },
    progressTrack: {
        height: 5, backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 4, overflow: 'hidden', marginTop: 8,
    },
    progressFill: { height: '100%', borderRadius: 4 },
    scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
    sectionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.foreground, marginBottom: 14 },
    moduleCard: {
        backgroundColor: Colors.card, borderRadius: 16, padding: 16,
        flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    moduleCardActive: { borderWidth: 1.5, borderColor: Colors.primary },
    weekBadge: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: Colors.secondary,
    },
    weekBadgeDone: { backgroundColor: '#22C55E' },
    weekBadgeActive: { backgroundColor: Colors.primary },
    weekBadgeLocked: { backgroundColor: Colors.secondary },
    moduleInfo: { flex: 1 },
    moduleWeek: { fontSize: 11, fontFamily: 'Inter_500Medium', color: Colors.primary, marginBottom: 2 },
    moduleTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.foreground },
    moduleLessons: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, marginTop: 2 },
    textMuted: { color: Colors.mutedForeground },
});
