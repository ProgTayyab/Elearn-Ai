import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientColors } from '../theme/colors';

interface GradientBoxProps {
    children: React.ReactNode;
    size?: number;
    borderRadius?: number;
    style?: object;
}

const GradientBox: React.FC<GradientBoxProps> = ({
    children,
    size = 48,
    borderRadius = 14,
    style,
}) => (
    <LinearGradient
        colors={GradientColors.synapse}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
            styles.box,
            { width: size, height: size, borderRadius },
            style,
        ]}
    >
        {children}
    </LinearGradient>
);

const styles = StyleSheet.create({
    box: {
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
});

export default GradientBox;
