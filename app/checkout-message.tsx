import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CheckoutMessageScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-sharp" size={60} color="white" />
        </View>
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>
          Your delicious food is being prepared and will be with you shortly.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/home')}>
            <Text style={styles.primaryButtonText}>Back to Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/orders')}>
            <Text style={styles.secondaryButtonText}>View My Orders</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginBottom: 30, elevation: 5, shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#777', marginTop: 15, marginBottom: 50, textAlign: 'center', lineHeight: 24 },
  buttonContainer: { width: '100%' },
  primaryButton: { backgroundColor: 'orange', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  secondaryButton: { paddingVertical: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  secondaryButtonText: { color: '#666', fontWeight: '600', fontSize: 16 },
});