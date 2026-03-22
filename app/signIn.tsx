import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../src/api/client';
import { Ionicons } from '@expo/vector-icons';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      const response = await apiClient.post('/signin', { email, password });
      if (response.data.token) router.replace('/checkout-message');
    } catch (error) {
      Alert.alert('Error', 'Invalid email or password.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.motivation}>
        Good things take time, but great food is just a login away. Let's get you fed!
      </Text>

      <Text style={styles.label}>Email:</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#000" style={styles.icon} />
        <TextInput placeholder="your@email.com" style={styles.input} onChangeText={setEmail} value={email} autoCapitalize="none" keyboardType="email-address" />
      </View>

      <Text style={styles.label}>Password:</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#000" style={styles.icon} />
        <TextInput placeholder="Enter your password" style={styles.input} secureTextEntry onChangeText={setPassword} value={password} />
      </View>

      <TouchableOpacity style={styles.orangeButton} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text style={styles.link}>Don't have an account? <Text style={{ fontWeight: 'bold', color: 'orange' }}>Sign Up</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 25, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#333' },
  motivation: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#fafafa', marginBottom: 20, paddingHorizontal: 10 },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#333' },
  orangeButton: { backgroundColor: 'orange', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  link: { marginTop: 25, color: 'orange', textAlign: 'center', fontSize: 15 },
});