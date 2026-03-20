import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function PaymentMethodScreen() {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'cash'>('card');
  const router = useRouter();
  const { deliveryMethod, deliveryAddress } = useLocalSearchParams();

  const handleNext = () => {
    router.push({ pathname: '/checkout', params: { paymentType: selectedMethod, deliveryMethod, deliveryAddress } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Method</Text>
      <Text style={styles.subtitle}>How would you like to pay for your meal?</Text>

      <TouchableOpacity style={[styles.paymentCard, selectedMethod === 'card' && styles.selected]} onPress={() => setSelectedMethod('card')}>
        <Text style={styles.icon}>💳</Text>
        <View style={styles.textContainer}>
          <Text style={styles.methodTitle}>Credit / Debit Card</Text>
          <Text style={styles.methodSub}>Secure online payment</Text>
        </View>
        <View style={[styles.radio, selectedMethod === 'card' && styles.radioActive]} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.paymentCard, selectedMethod === 'cash' && styles.selected]} onPress={() => setSelectedMethod('cash')}>
        <Text style={styles.icon}>💵</Text>
        <View style={styles.textContainer}>
          <Text style={styles.methodTitle}>Cash on Delivery</Text>
          <Text style={styles.methodSub}>Pay at your door</Text>
        </View>
        <View style={[styles.radio, selectedMethod === 'cash' && styles.radioActive]} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.mainButton} onPress={handleNext}>
        <Text style={styles.buttonText}>Confirm & View Summary</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backLinkText}>Change Delivery Options</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 30 },
  paymentCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderWidth: 1.5, borderColor: '#eee', borderRadius: 15, marginBottom: 15, backgroundColor: '#fff' },
  selected: { borderColor: 'orange', backgroundColor: '#fffcf5' },
  icon: { fontSize: 28, marginRight: 15 },
  textContainer: { flex: 1 },
  methodTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  methodSub: { fontSize: 14, color: '#aaa' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#eee' },
  radioActive: { borderColor: 'orange', backgroundColor: 'orange' },
  mainButton: { backgroundColor: 'orange', padding: 18, borderRadius: 12, marginTop: 30 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 18 },
  backLink: { marginTop: 20, alignItems: 'center' },
  backLinkText: { color: '#888', textDecorationLine: 'underline' },
});