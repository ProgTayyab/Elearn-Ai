import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, GradientColors } from '../theme/colors';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useCreateCourse } from '../hooks/useCourses';

type Nav = NativeStackNavigationProp<RootStackParamList, 'GenerateCourse'>;

const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
const durationOptions = [
    { label: '4 weeks', value: 4 },
    { label: '6 weeks', value: 6 },
    { label: '8 weeks', value: 8 },
];

export default function GenerateCourseScreen() {
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState(1);
    const [durationIdx, setDurationIdx] = useState(1);
    const navigation = useNavigation<Nav>();
    const { mutateAsync: createCourse, isPending } = useCreateCourse();

    const generate = async () => {
        if (!topic.trim()) return;
        try {
            const course = await createCourse({
                topic,
                difficulty: difficulties[difficulty],
                durationWeeks: durationOptions[durationIdx].value,
            });
            navigation.replace('CourseOverview', { id: course.id });
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Failed to generate course');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ArrowLeft size={20} color={Colors.foreground} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Generate Course</Text>
                </View>

                {isPending ? (
                    <View style={styles.loadingContainer}>
                        <LinearGradient
                            colors={GradientColors.synapse}
                            style={styles.loadingIcon}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Sparkles size={40} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.loadingTitle}>Creating your course...</Text>
                        <Text style={styles.loadingDesc}>
                            Building a personalized learning path for "{topic}"
                        </Text>
                        <View style={styles.loadingRow}>
                            <ActivityIndicator size="small" color={Colors.mutedForeground} />
                            <Text style={styles.loadingHint}>Generating modules</Text>
                        </View>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
                        {/* Topic */}
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Topic</Text>
                            <TextInput
                                value={topic}
                                onChangeText={setTopic}
                                placeholder="e.g. Neural Networks, Python, Data Structures"
                                placeholderTextColor={Colors.mutedForeground}
                                style={styles.textInput}
                            />
                        </View>

                        {/* Difficulty */}
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Difficulty</Text>
                            <View style={styles.segmented}>
                                {difficulties.map((d, i) => (
                                    <TouchableOpacity
                                        key={d}
                                        onPress={() => setDifficulty(i)}
                                        style={[styles.segment, i === difficulty && styles.segmentActive]}
                                    >
                                        <Text style={[styles.segmentText, i === difficulty && styles.segmentTextActive]}>
                                            {d}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Duration */}
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Duration</Text>
                            <View style={styles.segmented}>
                                {durationOptions.map((d, i) => (
                                    <TouchableOpacity
                                        key={d.label}
                                        onPress={() => setDurationIdx(i)}
                                        style={[styles.segment, i === durationIdx && styles.segmentActive]}
                                    >
                                        <Text style={[styles.segmentText, i === durationIdx && styles.segmentTextActive]}>
                                            {d.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={generate}
                            disabled={!topic.trim()}
                            activeOpacity={0.85}
                            style={[styles.ctaWrapper, !topic.trim() && styles.ctaDisabled]}
                        >
                            <LinearGradient
                                colors={GradientColors.synapse}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.cta}
                            >
                                <Sparkles size={20} color="#fff" />
                                <Text style={styles.ctaText}>Generate Course with AI</Text>
                            </LinearGradient>
                        </TouchableOpacity>
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
    form: { paddingHorizontal: 20, paddingBottom: 32, gap: 24 },
    field: { gap: 8 },
    fieldLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.mutedForeground },
    textInput: {
        height: 56, backgroundColor: Colors.secondary, borderRadius: 16,
        paddingHorizontal: 20, fontSize: 16, fontFamily: 'Inter_400Regular', color: Colors.foreground,
    },
    segmented: {
        flexDirection: 'row', backgroundColor: Colors.secondary, borderRadius: 16, padding: 4, gap: 4,
    },
    segment: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    segmentActive: {
        backgroundColor: Colors.card,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    },
    segmentText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.mutedForeground },
    segmentTextActive: { color: Colors.foreground },
    ctaWrapper: {
        borderRadius: 20, overflow: 'hidden', marginTop: 8,
        shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
    },
    ctaDisabled: { opacity: 0.5 },
    cta: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    ctaText: { color: '#fff', fontSize: 17, fontFamily: 'Inter_600SemiBold' },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    loadingIcon: {
        width: 96, height: 96, borderRadius: 28,
        alignItems: 'center', justifyContent: 'center', marginBottom: 24,
        shadowColor: '#6366F1', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
    },
    loadingTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: Colors.foreground, marginBottom: 8 },
    loadingDesc: {
        fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground,
        textAlign: 'center', maxWidth: 260, lineHeight: 22, marginBottom: 24,
    },
    loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    loadingHint: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground },
});
