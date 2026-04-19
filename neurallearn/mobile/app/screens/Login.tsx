import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, GradientColors } from '../../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../../store/authStore';
import api from '../../hooks/useApi';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<Nav>();
    const login = useAuthStore((s) => s.login);

    const handleSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (isRegister && !name.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return;
        }

        setLoading(true);
        try {
            const endpoint = isRegister ? '/auth/register' : '/auth/login';
            const payload = isRegister ? { email, password, name } : { email, password };
            const { data } = await api.post(endpoint, payload);
            await login(data.token, data.refreshToken, data.user);
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        } catch (error: any) {
            const msg = error?.response?.data?.message ?? 'Something went wrong';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    <Text style={styles.logo}>NeuralLearn</Text>

                    <View style={styles.formContainer}>
                        <Text style={styles.heading}>{isRegister ? 'Create account' : 'Welcome back'}</Text>
                        <Text style={styles.subheading}>
                            {isRegister ? 'Start your learning journey' : 'Continue your learning journey'}
                        </Text>

                        <View style={styles.fields}>
                            {isRegister && (
                                <TextInput
                                    placeholder="Full name"
                                    placeholderTextColor={Colors.mutedForeground}
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                />
                            )}

                            <TextInput
                                placeholder="Email address"
                                placeholderTextColor={Colors.mutedForeground}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                            />

                            <View style={styles.passRow}>
                                <TextInput
                                    placeholder="Password"
                                    placeholderTextColor={Colors.mutedForeground}
                                    secureTextEntry={!showPass}
                                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPass(!showPass)}
                                    style={styles.eyeBtn}
                                >
                                    {showPass ? (
                                        <EyeOff size={18} color={Colors.mutedForeground} />
                                    ) : (
                                        <Eye size={18} color={Colors.mutedForeground} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.85}
                            style={[styles.ctaWrapper, loading && { opacity: 0.7 }]}
                        >
                            <LinearGradient
                                colors={GradientColors.synapse}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.cta}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.ctaText}>
                                        {isRegister ? 'Create Account' : 'Sign In'}
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={styles.switchText}>
                            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                            <Text
                                style={styles.switchLink}
                                onPress={() => setIsRegister(!isRegister)}
                            >
                                {isRegister ? 'Sign In' : 'Sign Up'}
                            </Text>
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 },
    logo: {
        fontSize: 22,
        fontFamily: 'Inter_700Bold',
        color: Colors.primary,
        marginBottom: 8,
    },
    formContainer: { flex: 1, justifyContent: 'center', paddingTop: 40 },
    heading: {
        fontSize: 30,
        fontFamily: 'Inter_700Bold',
        color: Colors.foreground,
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    subheading: {
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
        color: Colors.mutedForeground,
        marginBottom: 32,
    },
    fields: { gap: 12 },
    input: {
        height: 52,
        backgroundColor: Colors.secondary,
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
        color: Colors.foreground,
    },
    passRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.secondary,
        borderRadius: 16,
        paddingRight: 14,
    },
    eyeBtn: { padding: 4 },
    ctaWrapper: {
        marginTop: 24,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    cta: {
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: {
        color: '#fff',
        fontSize: 17,
        fontFamily: 'Inter_600SemiBold',
    },
    switchText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: Colors.mutedForeground,
    },
    switchLink: {
        color: Colors.primary,
        fontFamily: 'Inter_600SemiBold',
    },
});
