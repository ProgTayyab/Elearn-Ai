import { registerRootComponent } from 'expo';
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './neurallearn/mobile/app/navigation/AppNavigator';
import { useAuthStore } from './neurallearn/mobile/store/authStore';

const queryClient = new QueryClient();

function AppWrapper() {
    useEffect(() => {
        useAuthStore.getState().hydrate();
    }, []);

    return (
        <QueryClientProvider client= { queryClient } >
        <AppNavigator />
        </QueryClientProvider>
    );
}

registerRootComponent(AppWrapper);
