import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import CustomSplashScreen from '@/components/CustomSplashScreen';
import { useState } from 'react';

// ... (imports)

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [isSplashReady, setSplashReady] = useState(false);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Keep splash visible for a moment
      setTimeout(async () => {
        await SplashScreen.hideAsync();
        setSplashReady(true);
      }, 2000);
    }
  }, [loaded]);

  if (!loaded || !isSplashReady) {
    return <CustomSplashScreen />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // Check if we are on the Reels page
  // Using includes for safety against /reels, /reels/, or (tabs)/reels
  const isReels = pathname?.includes('reels');

  // We removed the setStatusBarHidden effect to stop layout jumps (Box jumps when status bar disappears)
  // Instead we just use transparent background for Reels

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar
        style="light"
        backgroundColor={isReels ? 'transparent' : '#FF4500'}
        translucent={true}
        hidden={false}
      />
      {/* Manually render status bar background for non-Reels pages to handle safe area */}
      {!isReels && (
        <View style={{ height: insets.top, backgroundColor: '#FF4500' }} />
      )}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="restaurant/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
