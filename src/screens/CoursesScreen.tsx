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
import { BookOpen, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useCourses } from '../hooks/useCourses';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const gradientPalette: [string, string][] = [
    ['#3B82F6', '#6366F1'],
    ['#A855F7', '#EC4899'],
    ['#22C55E', '#10B981'],
    ['#F59E0B', '#EF4444'],
    ['#6366F1', '#8B5CF6'],
];

export default function CoursesScreen() {
    const navigation = useNavigation<Nav>();
    const { data: courses, isLoading } = useCourses();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>My Courses</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('GenerateCourse')}
                    style={styles.addBtn}
                >
                    <LinearGradient colors={['#6366F1', '#A855F7']} style={styles.addBtnGrad}>
                        <Plus size={18} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
                ) : !courses || courses.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <BookOpen size={40} color={Colors.mutedForeground} strokeWidth={1.5} />
                        <Text style={styles.emptyTitle}>No courses yet</Text>
                        <Text style={styles.emptyDesc}>Tap + to generate your first AI-powered course</Text>
                    </View>
                ) : (
                    courses.map((course, idx) => (
                        <TouchableOpacity
                            key={course.id}
                            onPress={() => navigation.navigate('CourseOverview', { id: course.id })}
                            activeOpacity={0.88}
                            style={styles.card}
                        >
                            <LinearGradient colors={gradientPalette[idx % gradientPalette.length]} style={styles.cardBanner}>
                                <BookOpen size={32} color="#fff" />
                                <Text style={styles.cardLevel}>{course.difficulty}</Text>
                            </LinearGradient>
                            <View style={styles.cardBody}>
                                <Text style={styles.cardTitle}>{course.title}</Text>
                                <Text style={styles.cardMeta}>{course.durationWeeks} weeks</Text>
                                <View style={styles.progressRow}>
                                    <View style={styles.progressTrack}>
                                        <LinearGradient
                                            colors={gradientPalette[idx % gradientPalette.length]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={[styles.progressFill, { width: `${course.progress}%` }]}
                                        />
                                    </View>
                                    <Text style={styles.progressText}>{course.progress}%</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16,
    },
    heading: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.foreground },
    addBtn: { borderRadius: 12, overflow: 'hidden' },
    addBtnGrad: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    emptyCard: {
        backgroundColor: Colors.card, borderRadius: 20, padding: 40,
        alignItems: 'center', gap: 10, marginTop: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.foreground },
    emptyDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, textAlign: 'center' },
    card: {
        backgroundColor: Colors.card, borderRadius: 20, overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    },
    cardBanner: {
        height: 100, flexDirection: 'row', alignItems: 'flex-end',
        justifyContent: 'space-between', padding: 16,
    },
    cardLevel: {
        fontSize: 12, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.9)',
        backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10,
        paddingVertical: 4, borderRadius: 8,
    },
    cardBody: { padding: 16 },
    cardTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.foreground, marginBottom: 4 },
    cardMeta: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, marginBottom: 12 },
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    progressTrack: { flex: 1, height: 5, backgroundColor: Colors.secondary, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    progressText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
});
