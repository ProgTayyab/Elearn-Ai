import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientColors, Colors } from '../theme/colors';

interface GradientButtonProps {
    onPress: () => void;
    label: string;
    disabled?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const GradientButton: React.FC<GradientButtonProps> = ({
    onPress,
    label,
    disabled = false,
    icon,
    style,
    textStyle,
}) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
        style={[styles.wrapper, disabled && styles.disabled, style]}
    >
        <LinearGradient
            colors={GradientColors.synapse}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
        >
            {icon}
            <Text style={[styles.label, textStyle]}>{label}</Text>
        </LinearGradient>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    disabled: {
        opacity: 0.5,
    },
    gradient: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 24,
    },
    label: {
        color: Colors.primaryForeground,
        fontSize: 17,
        fontFamily: 'Inter_600SemiBold',
        letterSpacing: 0.1,
    },
});

export default GradientButton;
