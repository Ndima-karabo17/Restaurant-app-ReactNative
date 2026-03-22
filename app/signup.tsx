import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../src/api/client';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../src/context/CartContext';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { cart, totalPrice, clearCart } = useCart();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      // 1. Sign in
      const response = await apiClient.post('/signin', { email, password });
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        // 2. Place the order
        const orderResponse = await apiClient.post('/orders', {
          items: cart,
          total: totalPrice,
          userId: response.data.user?.id || null,
        });

        if (orderResponse.status === 201) {
          clearCart();
          router.replace('/checkout-message');
        }
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Invalid email or password.';
      Alert.alert('Sign In Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#333" />
      </TouchableOpacity>

      <View style={styles.topSection}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>🍽️</Text>
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to complete your order</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#aaa" style={styles.icon} />
            <TextInput
              placeholder="your@email.com"
              style={styles.input}
              onChangeText={setEmail}
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#ccc"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#aaa" style={styles.icon} />
            <TextInput
              placeholder="Enter your password"
              style={styles.input}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              value={password}
              placeholderTextColor="#ccc"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#aaa" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cart summary */}
        {cart.length > 0 && (
          <View style={styles.orderSummary}>
            <Ionicons name="cart-outline" size={18} color="orange" />
            <Text style={styles.orderSummaryText}>
              {cart.length} item{cart.length > 1 ? 's' : ''} • R{totalPrice.toFixed(2)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.orangeButton, loading && styles.disabledBtn]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Sign In & Place Order</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/signup')} style={styles.linkBtn}>
          <Text style={styles.link}>
            Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  backBtn: { marginTop: Platform.OS === 'ios' ? 50 : 10, marginBottom: 10, backgroundColor: '#f5f5f5', padding: 8, borderRadius: 12, alignSelf: 'flex-start' },
  topSection: { alignItems: 'center', marginVertical: 24 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff5e6', justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 3, shadowColor: 'orange', shadowOpacity: 0.2, shadowRadius: 8 },
  iconEmoji: { fontSize: 36 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#888', textAlign: 'center' },
  form: { flex: 1 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#eee', borderRadius: 14, backgroundColor: '#fafafa', paddingHorizontal: 14 },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#333' },
  orderSummary: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff5e6', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#ffe0b2' },
  orderSummaryText: { color: 'orange', fontWeight: '700', fontSize: 14 },
  orangeButton: { backgroundColor: 'orange', padding: 17, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, elevation: 4, shadowColor: 'orange', shadowOpacity: 0.3, shadowRadius: 8 },
  disabledBtn: { backgroundColor: '#ccc', elevation: 0 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  linkBtn: { marginTop: 24, alignItems: 'center' },
  link: { color: '#888', fontSize: 15, textAlign: 'center' },
  linkBold: { fontWeight: 'bold', color: 'orange' },
});