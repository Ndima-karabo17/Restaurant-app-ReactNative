import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../src/api/client';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');

  const handleSignUp = async () => {
    try {
      const response = await apiClient.post('/signup', { email, password, address });
      if (response.status === 201) {
        Alert.alert('Success', 'Account created! Please login.');
        router.push('/');
      }
    } catch (error) {
      Alert.alert('Error', 'Signup failed. Check your connection or details.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join us for secure checkout, order tracking, and the best food in town</Text>

      <Text style={styles.label}>Email Address:</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#000" style={styles.icon} />
        <TextInput placeholder="example@mail.com" style={styles.input} onChangeText={setEmail} value={email} autoCapitalize="none" keyboardType="email-address" />
      </View>

      <Text style={styles.label}>Password:</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#000" style={styles.icon} />
        <TextInput placeholder="Create a strong password" style={styles.input} secureTextEntry onChangeText={setPassword} value={password} />
      </View>

      <Text style={styles.label}>Delivery Address:</Text>
      <View style={[styles.inputContainer, { alignItems: 'flex-start', paddingTop: 12 }]}>
        <Ionicons name="location-outline" size={20} color="#050505" style={styles.icon} />
        <TextInput placeholder="Street, City, Zip Code" style={[styles.input, { height: 60 }]} onChangeText={setAddress} value={address} multiline textAlignVertical="top" />
      </View>

      <TouchableOpacity style={styles.orangeButton} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/')}>
        <Text style={styles.link}>Already have an account? <Text style={{ fontWeight: 'bold', color: 'orange' }}>Login</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 25, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 30, textAlign: 'center', lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#fafafa', marginBottom: 20, paddingHorizontal: 12 },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#333' },
  orangeButton: { backgroundColor: 'orange', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10, elevation: 4 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  link: { marginTop: 25, color: 'orange', textAlign: 'center', fontSize: 15 },
});