import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, BookOpen, Trophy, Flame, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, GradientColors } from '../../theme/colors';
import { useAnalytics } from '../../hooks/useAnalytics';

export default function AnalyticsScreen() {
    const { data, isLoading } = useAnalytics();

    const metrics = [
        { icon: BookOpen, label: 'Courses Active', value: String(data?.courseCount ?? 0), color: Colors.primary },
        { icon: Trophy, label: 'Avg Score', value: `${data?.avgScore ?? 0}%`, color: '#F59E0B' },
        { icon: Flame, label: 'Streak', value: `${data?.streak ?? 0}d`, color: '#EF4444' },
        { icon: TrendingUp, label: 'Study Hours', value: `${((data?.totalStudyMinutes ?? 0) / 60).toFixed(1)}h`, color: '#22C55E' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>Analytics</Text>
                <Text style={styles.sub}>Your learning overview</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Metrics grid */}
                <View style={styles.metricsGrid}>
                    {metrics.map((m) => (
                        <View key={m.label} style={styles.metricCard}>
                            <m.icon size={20} color={m.color} strokeWidth={1.5} />
                            <Text style={styles.metricValue}>{m.value}</Text>
                            <Text style={styles.metricLabel}>{m.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Course progress */}
                {isLoading ? (
                    <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
                ) : (data?.courseStats ?? []).length > 0 && (
                    <View style={styles.chartCard}>
                        <Text style={styles.cardTitle}>Course Progress</Text>
                        {(data?.courseStats ?? []).map((cs) => (
                            <View key={cs.id} style={styles.progressRow}>
                                <Text style={styles.progressLabel} numberOfLines={1}>{cs.title}</Text>
                                <View style={styles.progressTrack}>
                                    <LinearGradient
                                        colors={GradientColors.synapse}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[styles.progressFill, { width: `${cs.progress}%` }]}
                                    />
                                </View>
                                <Text style={styles.progressPct}>{cs.progress}%</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Risk Prediction */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>AI Risk Prediction</Text>
                    {isLoading ? (
                        <ActivityIndicator color={Colors.primary} />
                    ) : (data?.risks ?? []).length === 0 ? (
                        <View style={styles.riskCard}>
                            <Text style={styles.riskDesc}>No risk data yet — create and start a course first.</Text>
                        </View>
                    ) : (data?.risks ?? []).map((r) => {
                        const isHigh = r.riskLevel === 'High';
                        const isMed = r.riskLevel === 'Medium';
                        const color = isHigh ? '#EF4444' : isMed ? '#F59E0B' : '#22C55E';
                        const bg = isHigh ? '#EF444420' : isMed ? '#F59E0B20' : '#22C55E20';
                        return (
                            <View key={r.id} style={styles.riskCard}>
                                <View style={[styles.riskBadge, { backgroundColor: bg }]}>
                                    {isHigh ? (
                                        <AlertTriangle size={14} color={color} />
                                    ) : (
                                        <CheckCircle size={14} color={color} />
                                    )}
                                    <Text style={[styles.riskBadgeText, { color }]}>{r.riskLevel} Risk</Text>
                                </View>
                                <Text style={styles.riskCourse}>{r.courseTitle}</Text>
                                <Text style={styles.riskDesc}>
                                    {isHigh ? 'Behind schedule — review missed modules' :
                                        isMed ? 'Some modules incomplete — keep going!' :
                                            'On track — great progress!'}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { paddingHorizontal: 20, paddingVertical: 16 },
    heading: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.foreground },
    sub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, marginTop: 2 },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    metricCard: {
        flex: 1, minWidth: '44%', backgroundColor: Colors.card, borderRadius: 20,
        padding: 16, alignItems: 'center', gap: 6,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    metricValue: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.foreground },
    metricLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, textAlign: 'center' },
    chartCard: {
        backgroundColor: Colors.card, borderRadius: 20, padding: 20, marginBottom: 16, gap: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    cardTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.foreground },
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    progressLabel: { width: 100, fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.foreground },
    progressTrack: { flex: 1, height: 5, backgroundColor: Colors.secondary, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    progressPct: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.primary, width: 34, textAlign: 'right' },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.foreground, marginBottom: 12 },
    riskCard: {
        backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    riskBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 8, marginBottom: 8,
    },
    riskBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
    riskCourse: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.foreground, marginBottom: 4 },
    riskDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground },
});
