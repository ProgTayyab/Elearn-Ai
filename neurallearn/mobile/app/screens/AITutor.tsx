import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, GradientColors } from '../../theme/colors';
import { useCourses } from '../../hooks/useCourses';
import { useChatHistory, useSendMessage } from '../../hooks/useChat';

export default function AITutor() {
    const [input, setInput] = useState('');
    const listRef = useRef<FlatList>(null);

    const { data: courses } = useCourses();
    // Use first course for chat context; could be a picker in future
    const courseId = courses?.[0]?.id;

    const { data: messages = [], isLoading } = useChatHistory(courseId);
    const { mutateAsync: sendMessage, isPending: sending } = useSendMessage(courseId);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages]);

    const send = async () => {
        if (!input.trim() || !courseId || sending) return;
        const text = input.trim();
        setInput('');
        try {
            await sendMessage(text);
        } catch { /* silent */ }
    };

    const renderMessage = ({ item }: { item: typeof messages[0] }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
                {isUser ? (
                    <LinearGradient
                        colors={GradientColors.synapse}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.bubble, styles.bubbleUser]}
                    >
                        <Text style={styles.bubbleUserText}>{item.content}</Text>
                    </LinearGradient>
                ) : (
                    <View style={[styles.bubble, styles.bubbleAI]}>
                        <Text style={styles.bubbleAIText}>{item.content}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <LinearGradient colors={GradientColors.synapse} style={styles.headerIcon}>
                        <Sparkles size={18} color="#fff" />
                    </LinearGradient>
                    <View>
                        <Text style={styles.headerTitle}>AI Tutor</Text>
                        <Text style={styles.headerSub}>
                            {courseId ? `Context: ${courses?.[0]?.title}` : 'Create a course to start chatting'}
                        </Text>
                    </View>
                </View>

                {/* Messages */}
                {isLoading ? (
                    <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
                ) : (
                    <FlatList
                        ref={listRef}
                        data={messages}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderMessage}
                        contentContainerStyle={styles.messages}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Input */}
                <View style={styles.inputBar}>
                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        onSubmitEditing={send}
                        placeholder={courseId ? 'Ask anything...' : 'Create a course first'}
                        placeholderTextColor={Colors.mutedForeground}
                        style={styles.textInput}
                        returnKeyType="send"
                        editable={!!courseId}
                    />
                    <TouchableOpacity onPress={send} disabled={!courseId || sending} activeOpacity={0.85} style={styles.sendBtn}>
                        <LinearGradient colors={GradientColors.synapse} style={[styles.sendBtnInner, (!courseId || sending) && { opacity: 0.5 }]}>
                            {sending ? <ActivityIndicator size="small" color="#fff" /> : <Send size={18} color="#fff" />}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    headerIcon: {
        width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
        shadowColor: '#6366F1', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
    },
    headerTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.foreground },
    headerSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground },
    messages: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    msgRow: { alignItems: 'flex-start' },
    msgRowUser: { alignItems: 'flex-end' },
    bubble: { maxWidth: '80%', padding: 14, borderRadius: 20 },
    bubbleUser: { borderBottomRightRadius: 5 },
    bubbleAI: {
        backgroundColor: Colors.card, borderBottomLeftRadius: 5,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    bubbleUserText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#fff', lineHeight: 21 },
    bubbleAIText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.foreground, lineHeight: 21 },
    inputBar: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 16, paddingVertical: 12,
        borderTopWidth: 1, borderTopColor: Colors.border,
        backgroundColor: Colors.background,
    },
    textInput: {
        flex: 1, height: 46, backgroundColor: Colors.secondary,
        borderRadius: 14, paddingHorizontal: 16,
        fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.foreground,
    },
    sendBtn: { borderRadius: 14, overflow: 'hidden' },
    sendBtnInner: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
});
