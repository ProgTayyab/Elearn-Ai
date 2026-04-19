import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Send } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, GradientColors } from '../../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAssignment, useSubmitAssignment } from '../../hooks/useModules';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AssignmentScreen'>;

export default function AssignmentScreen() {
    const [code, setCode] = useState('');
    const navigation = useNavigation<Nav>();
    const { params } = useRoute<Route>();
    const { data: assignment, isLoading } = useAssignment(params.moduleId);
    const { mutateAsync: submitAssignment, isPending: submitting } = useSubmitAssignment();

    const submitted = assignment?.status === 'submitted';

    const handleSubmit = async () => {
        if (!assignment || !code.trim()) return;
        await submitAssignment(assignment.id);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ArrowLeft size={20} color={Colors.foreground} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Coding Assignment</Text>
                </View>

                {isLoading ? (
                    <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
                ) : (
                    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                        {/* Task card */}
                        <View style={styles.taskCard}>
                            <Text style={styles.taskLabel}>Your Task</Text>
                            <Text style={styles.taskTitle}>{assignment?.title ?? 'Coding Assignment'}</Text>
                            <Text style={styles.taskDesc}>{assignment?.description}</Text>
                        </View>

                        {/* Info row */}
                        <View style={styles.infoRow}>
                            <View style={styles.infoBadge}>
                                <Text style={styles.infoBadgeText}>{assignment?.language ?? 'Python'}</Text>
                            </View>
                            <View style={styles.infoBadge}>
                                <Text style={styles.infoBadgeText}>{assignment?.difficulty ?? 'Medium'}</Text>
                            </View>
                        </View>

                        {/* Code editor */}
                        <View style={styles.editorCard}>
                            <Text style={styles.editorLabel}>Your Solution</Text>
                            <TextInput
                                value={submitted ? '✅ Solution submitted!' : code}
                                onChangeText={setCode}
                                placeholder={'def solution():\n    # Your code here\n    pass'}
                                placeholderTextColor={Colors.mutedForeground}
                                multiline
                                editable={!submitted}
                                style={styles.codeInput}
                                autoCapitalize="none"
                                autoCorrect={false}
                                spellCheck={false}
                            />
                        </View>

                        {submitted ? (
                            <View style={styles.successCard}>
                                <Text style={styles.successTitle}>✅ Submitted!</Text>
                                <Text style={styles.successDesc}>Your solution has been submitted for review. Great work!</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={!code.trim() || submitting}
                                activeOpacity={0.85}
                                style={[styles.submitBtn, (!code.trim() || submitting) && styles.submitBtnDisabled]}
                            >
                                <LinearGradient
                                    colors={GradientColors.synapse}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.submitBtnInner}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Send size={18} color="#fff" />
                                            <Text style={styles.submitBtnText}>Submit Solution</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 20, paddingVertical: 16,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.foreground },
    scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
    taskCard: {
        backgroundColor: Colors.card, borderRadius: 20, padding: 20,
        borderLeftWidth: 4, borderLeftColor: Colors.primary,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    taskLabel: {
        fontSize: 11, fontFamily: 'Inter_500Medium', color: Colors.primary,
        marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8,
    },
    taskTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.foreground, marginBottom: 10 },
    taskDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, lineHeight: 22 },
    infoRow: { flexDirection: 'row', gap: 8 },
    infoBadge: {
        backgroundColor: `${Colors.primary}15`, paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 10,
    },
    infoBadgeText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.primary },
    editorCard: {
        backgroundColor: '#1E1E2E', borderRadius: 20, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
    },
    editorLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.5)', marginBottom: 10 },
    codeInput: {
        fontSize: 13, fontFamily: 'Inter_400Regular', color: '#E2E8F0',
        minHeight: 180, textAlignVertical: 'top', lineHeight: 22,
    },
    submitBtn: {
        borderRadius: 20, overflow: 'hidden',
        shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitBtnInner: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    submitBtnText: { color: '#fff', fontSize: 17, fontFamily: 'Inter_600SemiBold' },
    successCard: {
        backgroundColor: '#22C55E15', borderRadius: 20, padding: 20, alignItems: 'center',
        borderWidth: 1, borderColor: '#22C55E40',
    },
    successTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#22C55E', marginBottom: 8 },
    successDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, textAlign: 'center' },
});
