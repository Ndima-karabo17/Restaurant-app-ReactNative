import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../src/api/client';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 4) {
      Alert.alert('Weak Password', 'Password must be at least 4 characters.');
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post('/signup', { name, email, password });
      if (response.status === 201) {
        Alert.alert(' Account Created', 'Please sign in to continue.', [
          { text: 'Sign In', onPress: () => router.replace('/signIn') }
        ]);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Signup failed. Try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#333" />
      </TouchableOpacity>

      <View style={styles.topSection}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>👋</Text>
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join us for order tracking and the best food in town</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#aaa" style={styles.icon} />
          <TextInput
            placeholder="John Doe"
            style={styles.input}
            onChangeText={setName}
            value={name}
            autoCapitalize="words"
            placeholderTextColor="#ccc"
          />
        </View>
      </View>

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
            placeholder="Create a strong password"
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

      <TouchableOpacity
        style={[styles.orangeButton, loading && styles.disabledBtn]}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="person-add-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Create Account</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/signIn')} style={styles.linkBtn}>
        <Text style={styles.link}>
          Already have an account? <Text style={styles.linkBold}>Sign In</Text>
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  backBtn: { marginTop: Platform.OS === 'ios' ? 50 : 10, marginBottom: 10, backgroundColor: '#f5f5f5', padding: 8, borderRadius: 12, alignSelf: 'flex-start' },
  topSection: { alignItems: 'center', marginVertical: 24 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff5e6', justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 3, shadowColor: 'orange', shadowOpacity: 0.2, shadowRadius: 8 },
  iconEmoji: { fontSize: 36 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 22 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#eee', borderRadius: 14, backgroundColor: '#fafafa', paddingHorizontal: 14 },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#333' },
  orangeButton: { backgroundColor: 'orange', padding: 17, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 10, elevation: 4, shadowColor: 'orange', shadowOpacity: 0.3, shadowRadius: 8 },
  disabledBtn: { backgroundColor: '#ccc', elevation: 0 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  linkBtn: { marginTop: 24, alignItems: 'center', marginBottom: 30 },
  link: { color: '#888', fontSize: 15 },
  linkBold: { fontWeight: 'bold', color: 'orange' },
});