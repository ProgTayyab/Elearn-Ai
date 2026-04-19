import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Sparkles, BookOpen, BarChart3, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, GradientColors } from '../../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const slides = [
    {
        Icon: Sparkles,
        title: 'Generate your own course',
        description:
            'Enter any topic and our AI creates a complete, structured learning path tailored to your level.',
    },
    {
        Icon: BookOpen,
        title: 'Learn through modules & tasks',
        description:
            'Each week brings summaries, articles, videos, quizzes, and coding assignments — all curated for you.',
    },
    {
        Icon: BarChart3,
        title: 'Track progress with AI analytics',
        description:
            'Real-time performance insights and risk predictions keep you on the path to mastery.',
    },
];

export default function Onboarding() {
    const [current, setCurrent] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const navigation = useNavigation<Nav>();

    const next = () => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();

        if (current < slides.length - 1) {
            setTimeout(() => setCurrent(current + 1), 150);
        } else {
            navigation.navigate('Login');
        }
    };

    const slide = slides[current];
    const Icon = slide.Icon;

    return (
        <SafeAreaView style={styles.container}>
            {/* Background mesh */}
            <LinearGradient
                colors={GradientColors.synapse}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <View style={styles.overlay} />

            {/* Logo */}
            <Text style={styles.logo}>Synapse</Text>

            {/* Slide */}
            <Animated.View style={[styles.slideContainer, { opacity: fadeAnim }]}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
                    style={styles.iconBox}
                >
                    <Icon size={36} color="#fff" />
                </LinearGradient>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
                {/* Dots */}
                <View style={styles.dots}>
                    {slides.map((_, i) => (
                        <View
                            key={i}
                            style={[styles.dot, i === current ? styles.dotActive : styles.dotInactive]}
                        />
                    ))}
                </View>

                <TouchableOpacity onPress={next} activeOpacity={0.85} style={styles.btn}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                        style={styles.btnInner}
                    >
                        <Text style={styles.btnText}>
                            {current === slides.length - 1 ? 'Get Started' : 'Continue'}
                        </Text>
                        <ChevronRight size={20} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },
    logo: {
        fontSize: 22,
        fontFamily: 'Inter_700Bold',
        color: '#fff',
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    slideContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    iconBox: {
        width: 88,
        height: 88,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    title: {
        fontSize: 30,
        fontFamily: 'Inter_700Bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 300,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        gap: 20,
    },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
    dot: { height: 6, borderRadius: 3 },
    dotActive: { width: 28, backgroundColor: '#fff' },
    dotInactive: { width: 6, backgroundColor: 'rgba(255,255,255,0.4)' },
    btn: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    btnInner: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    btnText: {
        color: '#fff',
        fontSize: 17,
        fontFamily: 'Inter_600SemiBold',
    },
});
