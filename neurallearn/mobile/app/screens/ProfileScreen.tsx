import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { User, BookOpen, Trophy, Bell, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, GradientColors } from '../../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../../store/authStore';
import { useCourses } from '../../hooks/useCourses';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
    const navigation = useNavigation<Nav>();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const { data: courses } = useCourses();

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                },
            },
        ]);
    };

    const menuItems = [
        { icon: BookOpen, label: 'Learning Preferences', value: '', danger: false, onPress: () => { } },
        { icon: Bell, label: 'Notifications', value: 'On', danger: false, onPress: () => { } },
        { icon: Shield, label: 'Privacy & Security', value: '', danger: false, onPress: () => { } },
        { icon: HelpCircle, label: 'Help & Support', value: '', danger: false, onPress: () => { } },
        { icon: LogOut, label: 'Sign Out', value: '', danger: true, onPress: handleLogout },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.profileSection}>
                    <LinearGradient colors={GradientColors.synapse} style={styles.avatar}>
                        <User size={36} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.name}>{user?.name ?? 'Learner'}</Text>
                    <Text style={styles.email}>{user?.email ?? ''}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={styles.statVal}>{courses?.length ?? 0}</Text>
                            <Text style={styles.statLbl}>Courses</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.stat}>
                            <Text style={styles.statVal}>0d</Text>
                            <Text style={styles.statLbl}>Streak</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.stat}>
                            <Text style={styles.statVal}>–</Text>
                            <Text style={styles.statLbl}>Avg Score</Text>
                        </View>
                    </View>
                </View>

                {/* Achievement banner */}
                <TouchableOpacity activeOpacity={0.88} style={styles.achieveWrapper}>
                    <LinearGradient colors={['#F59E0B', '#EF4444']} style={styles.achieveCard}>
                        <Trophy size={28} color="#fff" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.achieveTitle}>Keep Learning! 🚀</Text>
                            <Text style={styles.achieveSub}>Complete courses to earn achievements</Text>
                        </View>
                        <ChevronRight size={18} color="rgba(255,255,255,0.8)" />
                    </LinearGradient>
                </TouchableOpacity>

                {/* Menu */}
                <View style={styles.menuCard}>
                    {menuItems.map((item, i) => (
                        <TouchableOpacity
                            key={item.label}
                            activeOpacity={0.8}
                            onPress={item.onPress}
                            style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}
                        >
                            <View style={[styles.menuIcon, item.danger && styles.menuIconDanger]}>
                                <item.icon size={18} color={item.danger ? '#EF4444' : Colors.primary} />
                            </View>
                            <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                                {item.label}
                            </Text>
                            <View style={styles.menuRight}>
                                {item.value ? <Text style={styles.menuValue}>{item.value}</Text> : null}
                                <ChevronRight size={16} color={Colors.mutedForeground} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.version}>NeuralLearn v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    profileSection: { alignItems: 'center', paddingVertical: 24 },
    avatar: {
        width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
        shadowColor: '#6366F1', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
    },
    name: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.foreground, marginBottom: 4 },
    email: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, marginBottom: 20 },
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: 24 },
    stat: { alignItems: 'center', gap: 2 },
    statVal: { fontSize: 20, fontFamily: 'Inter_700Bold', color: Colors.foreground },
    statLbl: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground },
    divider: { width: 1, height: 36, backgroundColor: Colors.border },
    achieveWrapper: {
        borderRadius: 20, overflow: 'hidden', marginBottom: 16,
        shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25, shadowRadius: 12, elevation: 5,
    },
    achieveCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingVertical: 16, paddingHorizontal: 20,
    },
    achieveTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#fff' },
    achieveSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.85)' },
    menuCard: {
        backgroundColor: Colors.card, borderRadius: 20, overflow: 'hidden', marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingVertical: 14, paddingHorizontal: 16,
    },
    menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
    menuIcon: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: `${Colors.primary}15`, alignItems: 'center', justifyContent: 'center',
    },
    menuIconDanger: { backgroundColor: '#EF444415' },
    menuLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.foreground },
    menuLabelDanger: { color: '#EF4444' },
    menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    menuValue: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground },
    version: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, textAlign: 'center', paddingBottom: 8 },
});
