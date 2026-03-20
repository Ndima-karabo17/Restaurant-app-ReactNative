import { Stack } from 'expo-router';
import { CartProvider } from '../src/context/CartContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <CartProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#fff' },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="signup" options={{animation:'fade'}}/>
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="location" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="orders" options={{ title: 'My Orders', headerShown: true }} />
        <Stack.Screen name="checkout" options={{ title: 'My Cart', headerShown: true }} />
        <Stack.Screen name="delivery-options" options={{ title: 'Delivery', headerShown: true }} />
        <Stack.Screen name="payment" options={{ title: 'Payment', headerShown: true }} />
        <Stack.Screen name="checkout-message" options={{ headerShown: false }} />
      </Stack>
    </CartProvider>
  );
}