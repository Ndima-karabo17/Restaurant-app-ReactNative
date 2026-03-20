import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../src/api/client';

export default function DeliveryOptionScreen() {
  const [option, setOption] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const router = useRouter();

  useEffect(() => { fetchUserAddress(); }, []);

  const fetchUserAddress = async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      if (response.data.address) setAddress(response.data.address);
    } catch (error) {
      console.log('Guest mode or failed to fetch address');
    }
  };

  const handleNext = () => {
    router.push({ pathname: '/payment', params: { deliveryMethod: option, deliveryAddress: option === 'delivery' ? address : 'Store Pickup' } });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Delivery Method</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity style={[styles.optionCard, option === 'delivery' && styles.selectedCard]} onPress={() => setOption('delivery')}>
            <Text style={styles.icon}>🛵</Text>
            <Text style={styles.optionText}>Delivery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionCard, option === 'pickup' && styles.selectedCard]} onPress={() => setOption('pickup')}>
            <Text style={styles.icon}>🥡</Text>
            <Text style={styles.optionText}>Pick Up</Text>
          </TouchableOpacity>
        </View>
        {option === 'delivery' && (
          <View style={styles.addressBox}>
            <Text style={styles.label}>Confirm Delivery Address</Text>
            <TextInput style={styles.input} value={address} onChangeText={setAddress} multiline placeholder="Enter your street address, suburb, and city..." placeholderTextColor="#999" />
            <Text style={styles.hint}>Tip: You can change this address if you want your food delivered somewhere else today.</Text>
          </View>
        )}
        <TouchableOpacity style={[styles.button, option === 'delivery' && !address && styles.disabled]} onPress={handleNext} disabled={option === 'delivery' && !address}>
          <Text style={styles.buttonText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 25, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 30, color: '#333' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  optionCard: { width: '47%', padding: 20, borderWidth: 2, borderColor: '#f0f0f0', borderRadius: 15, alignItems: 'center', backgroundColor: '#fafafa' },
  selectedCard: { borderColor: 'orange', backgroundColor: '#fffcf5' },
  icon: { fontSize: 40, marginBottom: 10 },
  optionText: { fontSize: 16, fontWeight: 'bold', color: '#444' },
  addressBox: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 10 },
  input: { borderWidth: 1.5, borderColor: '#eee', borderRadius: 12, padding: 15, fontSize: 16, color: '#333', backgroundColor: '#fff', minHeight: 100, textAlignVertical: 'top' },
  hint: { fontSize: 13, color: '#aaa', marginTop: 10, fontStyle: 'italic' },
  button: { backgroundColor: 'orange', padding: 18, borderRadius: 12, marginTop: 10, elevation: 3 },
  disabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 18 },
});