import React, { useState, useRef } from 'react';
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
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, GradientColors } from '../../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useQuiz, useSubmitQuiz } from '../../hooks/useModules';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'QuizScreen'>;

export default function QuizScreen() {
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [done, setDone] = useState(false);
    const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null);
    const startTime = useRef(Date.now());

    const navigation = useNavigation<Nav>();
    const { params } = useRoute<Route>();
    const { data: quiz, isLoading } = useQuiz(params.moduleId);
    const { mutateAsync: submitQuiz, isPending: submitting } = useSubmitQuiz();

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
            </SafeAreaView>
        );
    }

    if (!quiz) return null;

    const questions = quiz.questions;
    const q = questions[currentQ];

    const handleSelect = (optionId: number) => {
        if (selected !== null) return;
        setSelected(optionId);
        setAnswers((prev) => ({ ...prev, [q.id]: optionId }));
    };

    const next = async () => {
        if (currentQ < questions.length - 1) {
            setCurrentQ((c) => c + 1);
            setSelected(null);
        } else {
            const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
            try {
                const res = await submitQuiz({ quizId: quiz.id, answers, timeTaken });
                setResult(res);
            } catch {
                setResult({ score: 0, correct: 0, total: questions.length });
            }
            setDone(true);
        }
    };

    if (done && result) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.doneContainer}>
                    <LinearGradient colors={GradientColors.synapse} style={styles.doneIcon}>
                        <CheckCircle size={48} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.doneTitle}>Quiz Complete!</Text>
                    <Text style={styles.doneScore}>{result.correct}/{result.total}</Text>
                    <Text style={styles.doneLabel}>Correct Answers</Text>
                    <Text style={styles.doneScorePct}>{Math.round(result.score)}%</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85} style={styles.doneBtn}>
                        <LinearGradient colors={GradientColors.synapse} style={styles.doneBtnInner}>
                            <Text style={styles.doneBtnText}>Back to Module</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={20} color={Colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quiz</Text>
                <Text style={styles.counter}>{currentQ + 1}/{questions.length}</Text>
            </View>

            {/* Progress */}
            <View style={styles.quizTrack}>
                <LinearGradient
                    colors={GradientColors.synapse}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.quizFill, { width: `${((currentQ + 1) / questions.length) * 100}%` }]}
                />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.question}>{q.text}</Text>

                <View style={styles.options}>
                    {q.options.map((opt, i) => {
                        const isSelected = selected === opt.id;
                        const bg = isSelected ? `${Colors.primary}20` : Colors.secondary;
                        const border = isSelected ? Colors.primary : 'transparent';
                        const textColor = isSelected ? Colors.primary : Colors.foreground;

                        return (
                            <TouchableOpacity
                                key={opt.id}
                                onPress={() => handleSelect(opt.id)}
                                style={[styles.option, { backgroundColor: bg, borderColor: border, borderWidth: selected !== null ? 1.5 : 0 }]}
                            >
                                <View style={[styles.optionBadge, isSelected && styles.optionBadgeSelected]}>
                                    <Text style={styles.optionLetter}>{['A', 'B', 'C', 'D'][i]}</Text>
                                </View>
                                <Text style={[styles.optionText, { color: textColor }]}>{opt.text}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {selected !== null && (
                    <TouchableOpacity onPress={next} disabled={submitting} activeOpacity={0.85} style={styles.nextBtn}>
                        <LinearGradient colors={GradientColors.synapse} style={styles.nextBtnInner}>
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.nextBtnText}>
                                        {currentQ < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                    </Text>
                                    <ArrowRight size={18} color="#fff" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
        paddingVertical: 16, gap: 12,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { flex: 1, fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.foreground },
    counter: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.mutedForeground },
    quizTrack: {
        height: 4, backgroundColor: Colors.secondary, marginHorizontal: 20,
        borderRadius: 2, overflow: 'hidden', marginBottom: 24,
    },
    quizFill: { height: '100%', borderRadius: 2 },
    scroll: { paddingHorizontal: 20, paddingBottom: 40 },
    question: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.foreground, lineHeight: 26, marginBottom: 24 },
    options: { gap: 10 },
    option: {
        flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
        backgroundColor: Colors.secondary, borderRadius: 16,
    },
    optionBadge: {
        width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.muted,
        alignItems: 'center', justifyContent: 'center',
    },
    optionBadgeSelected: { backgroundColor: Colors.primary },
    optionLetter: { fontSize: 13, fontFamily: 'Inter_700Bold', color: Colors.foreground },
    optionText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.foreground },
    nextBtn: {
        marginTop: 24, borderRadius: 20, overflow: 'hidden',
        shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
    },
    nextBtnInner: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    nextBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
    doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    doneIcon: {
        width: 96, height: 96, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
        marginBottom: 24, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
    },
    doneTitle: { fontSize: 26, fontFamily: 'Inter_700Bold', color: Colors.foreground, marginBottom: 8 },
    doneScore: { fontSize: 56, fontFamily: 'Inter_700Bold', color: Colors.primary },
    doneScorePct: { fontSize: 20, fontFamily: 'Inter_600SemiBold', color: Colors.mutedForeground, marginBottom: 32 },
    doneLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, marginBottom: 4 },
    doneBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
    doneBtnInner: { height: 56, alignItems: 'center', justifyContent: 'center' },
    doneBtnText: { color: '#fff', fontSize: 17, fontFamily: 'Inter_600SemiBold' },
});
