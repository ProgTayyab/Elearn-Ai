import { StyleSheet } from 'react-native';

export const Colors = {
    // Core
    background: '#F7F9FC',
    foreground: '#0F172A',
    card: '#FFFFFF',
    cardForeground: '#0F172A',

    // Primary (Indigo)
    primary: '#6366F1',
    primaryForeground: '#FFFFFF',

    // Secondary
    secondary: '#EEF2F7',
    secondaryForeground: '#0F172A',

    // Muted
    muted: '#EEF2F7',
    mutedForeground: '#64748B',

    // Accent (Violet)
    accent: '#A855F7',
    accentForeground: '#FFFFFF',

    // Destructive
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',

    // Border / Input
    border: 'rgba(0,0,0,0.05)',
    input: '#D9E2EC',

    // Surface
    surface: '#FFFFFF',
    surfaceElevated: '#F7F9FC',
};

export const DarkColors = {
    background: '#0A0A0F',
    foreground: '#FAFAFA',
    card: '#18181F',
    cardForeground: '#FAFAFA',
    primary: '#6366F1',
    primaryForeground: '#FFFFFF',
    secondary: '#25252E',
    secondaryForeground: '#FAFAFA',
    muted: '#25252E',
    mutedForeground: '#A1A1AA',
    accent: '#A855F7',
    accentForeground: '#FFFFFF',
    destructive: '#7F1D1D',
    destructiveForeground: '#FAFAFA',
    border: 'rgba(255,255,255,0.08)',
    input: '#25252E',
    surface: '#18181F',
    surfaceElevated: '#232330',
};

export const GradientColors = {
    synapse: ['#6366F1', '#A855F7'] as const,
};

export const SharedStyles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: 24,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
    },
    cardSm: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    screenPadding: {
        paddingHorizontal: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowShadow: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    h1: {
        fontSize: 28,
        fontFamily: 'Inter_700Bold',
        color: Colors.foreground,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 20,
        fontFamily: 'Inter_700Bold',
        color: Colors.foreground,
        letterSpacing: -0.3,
    },
    h3: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: Colors.foreground,
    },
    body: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: Colors.foreground,
        lineHeight: 22,
    },
    caption: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: Colors.mutedForeground,
    },
    label: {
        fontSize: 13,
        fontFamily: 'Inter_500Medium',
        color: Colors.mutedForeground,
    },
});
