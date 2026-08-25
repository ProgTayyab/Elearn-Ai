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
import { ArrowLeft, CheckSquare, FileText, Video, HelpCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, GradientColors } from '../theme/colors';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useModule } from '../hooks/useModules';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ModuleScreen'>;

export default function ModuleScreen() {
    const navigation = useNavigation<Nav>();
    const { params } = useRoute<Route>();
    const { data: module, isLoading } = useModule(params.id);

    const contentItems = [
        { type: 'summary', icon: FileText, label: 'Week Summary', desc: module?.description ?? 'Key concepts overview', done: false },
        ...(module?.resources ?? []).map((r) => ({
            type: r.type,
            icon: r.type === 'video' ? Video : FileText,
            label: r.title,
            desc: `${r.readTime} min read`,
            done: false,
        })),
        { type: 'quiz', icon: HelpCircle, label: 'Knowledge Quiz', desc: '10 questions · ~15 min', done: false },
        { type: 'assignment', icon: CheckSquare, label: 'Coding Assignment', desc: `${module?.title ?? 'Module'} exercise`, done: false },
    ];

    const completedCount = 0;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={20} color={Colors.foreground} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.week}>Week {module?.weekNumber ?? '...'}</Text>
                    <Text style={styles.title}>{module?.title ?? '...'}</Text>
                </View>
            </View>

            {/* Progress */}
            <View style={styles.progressCard}>
                <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Module Progress</Text>
                    <Text style={styles.progressPct}>{completedCount > 0 ? Math.round((completedCount / contentItems.length) * 100) : 0}%</Text>
                </View>
                <View style={styles.progressTrack}>
                    <LinearGradient
                        colors={GradientColors.synapse}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressFill, { width: completedCount > 0 ? `${Math.round((completedCount / contentItems.length) * 100)}%` : '0%' }]}
                    />
                </View>
                <Text style={styles.progressSub}>{completedCount} of {contentItems.length} tasks completed</Text>
            </View>

            {isLoading ? (
                <ActivityIndicator color={Colors.primary} style={{ marginTop: 30 }} />
            ) : (
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {contentItems.map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            activeOpacity={0.88}
                            onPress={() => {
                                if (item.type === 'quiz') navigation.navigate('QuizScreen', { moduleId: params.id });
                                if (item.type === 'assignment') navigation.navigate('AssignmentScreen', { moduleId: params.id });
                            }}
                            style={[styles.itemCard, item.done && styles.itemDone]}
                        >
                            <View style={[styles.itemIcon, item.done && styles.itemIconDone]}>
                                <item.icon size={18} color={item.done ? '#fff' : Colors.primary} />
                            </View>
                            <View style={styles.itemInfo}>
                                <Text style={[styles.itemLabel, item.done && styles.itemLabelDone]}>{item.label}</Text>
                                <Text style={styles.itemDesc}>{item.desc}</Text>
                            </View>
                            {item.done && (
                                <View style={styles.doneTag}>
                                    <Text style={styles.doneTagText}>Done</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingHorizontal: 20, paddingVertical: 16,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center',
    },
    week: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.primary },
    title: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.foreground },
    progressCard: {
        marginHorizontal: 20, backgroundColor: Colors.card,
        borderRadius: 16, padding: 16, gap: 8, marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
    progressLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.foreground },
    progressPct: { fontSize: 13, fontFamily: 'Inter_700Bold', color: Colors.primary },
    progressTrack: { height: 5, backgroundColor: Colors.secondary, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    progressSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground },
    scroll: { paddingHorizontal: 20, paddingBottom: 30 },
    itemCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    itemDone: { opacity: 0.75 },
    itemIcon: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: `${Colors.primary}15`, alignItems: 'center', justifyContent: 'center',
    },
    itemIconDone: { backgroundColor: Colors.primary },
    itemInfo: { flex: 1 },
    itemLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.foreground },
    itemLabelDone: { textDecorationLine: 'line-through', color: Colors.mutedForeground },
    itemDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, marginTop: 2 },
    doneTag: { backgroundColor: '#22C55E20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    doneTagText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#22C55E' },
});
