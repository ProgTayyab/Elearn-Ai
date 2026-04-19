import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BookOpen, BarChart3, MessageCircle, User } from 'lucide-react-native';
import { Colors } from '../../theme/colors';

// Screens
import Onboarding from '../screens/Onboarding';
import Login from '../screens/Login';
import HomeDashboard from '../screens/HomeDashboard';
import CoursesScreen from '../screens/CoursesScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import AITutor from '../screens/AITutor';
import ProfileScreen from '../screens/ProfileScreen';
import GenerateCourse from '../screens/GenerateCourse';
import CourseOverview from '../screens/CourseOverview';
import ModuleScreen from '../screens/ModuleScreen';
import QuizScreen from '../screens/QuizScreen';
import AssignmentScreen from '../screens/AssignmentScreen';

export type RootStackParamList = {
    Onboarding: undefined;
    Login: undefined;
    Main: undefined;
    GenerateCourse: undefined;
    CourseOverview: { id: number };
    ModuleScreen: { id: number; courseId: number };
    QuizScreen: { moduleId: number };
    AssignmentScreen: { moduleId: number };
};

export type TabParamList = {
    Home: undefined;
    Courses: undefined;
    Analytics: undefined;
    Tutor: undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.border,
                    borderTopWidth: 1,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 68,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.mutedForeground,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontFamily: 'Inter_500Medium',
                    marginTop: 2,
                },
                tabBarIcon: ({ color, size }) => {
                    const icons: Record<string, React.ReactNode> = {
                        Home: <Home size={22} color={color} strokeWidth={1.5} />,
                        Courses: <BookOpen size={22} color={color} strokeWidth={1.5} />,
                        Analytics: <BarChart3 size={22} color={color} strokeWidth={1.5} />,
                        Tutor: <MessageCircle size={22} color={color} strokeWidth={1.5} />,
                        Profile: <User size={22} color={color} strokeWidth={1.5} />,
                    };
                    return icons[route.name] ?? null;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeDashboard} options={{ title: 'Home' }} />
            <Tab.Screen name="Courses" component={CoursesScreen} options={{ title: 'Courses' }} />
            <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
            <Tab.Screen name="Tutor" component={AITutor} options={{ title: 'AI Tutor' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Onboarding" component={Onboarding} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen name="GenerateCourse" component={GenerateCourse} />
                <Stack.Screen name="CourseOverview" component={CourseOverview} />
                <Stack.Screen name="ModuleScreen" component={ModuleScreen} />
                <Stack.Screen name="QuizScreen" component={QuizScreen} />
                <Stack.Screen name="AssignmentScreen" component={AssignmentScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
