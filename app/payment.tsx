import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Platform, Animated
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Detect card type from number
const getCardType = (number: string): { type: string; icon: string } => {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return { type: 'Visa', icon: '💳' };
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return { type: 'Mastercard', icon: '💳' };
  if (/^3[47]/.test(n)) return { type: 'Amex', icon: '💳' };
  if (/^6(?:011|5)/.test(n)) return { type: 'Discover', icon: '💳' };
  return { type: '', icon: '💳' };
};

const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
};

const validateExpiry = (expiry: string): boolean => {
  const [month, year] = expiry.split('/');
  if (!month || !year || year.length !== 2) return false;
  const m = parseInt(month);
  const y = parseInt('20' + year);
  if (m < 1 || m > 12) return false;
  const now = new Date();
  const expDate = new Date(y, m - 1, 1);
  return expDate > now;
};

const validateCardNumber = (number: string): boolean => {
  const digits = number.replace(/\s/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i]);
    if (isEven) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    isEven = !isEven;
  }
  return sum % 10 === 0;
};

export default function PaymentMethodScreen() {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'cash'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { deliveryMethod, deliveryAddress } = useLocalSearchParams();

  const cardType = getCardType(cardNumber);

  const getCardColor = () => {
    const type = cardType.type;
    if (type === 'Visa') return ['#1a1f71', '#2962ff'];
    if (type === 'Mastercard') return ['#eb001b', '#f79e1b'];
    if (type === 'Amex') return ['#007b5e', '#00d2a0'];
    return ['#333', '#666'];
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateCardNumber(cardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }
    if (!cardName.trim()) {
      newErrors.cardName = 'Please enter the name on card';
    }
    if (!validateExpiry(expiry)) {
      newErrors.expiry = 'Invalid or expired date';
    }
    if (cvv.length < 3) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (selectedMethod === 'card' && !validate()) return;
    router.push({
      pathname: '/checkout',
      params: { paymentType: selectedMethod, deliveryMethod, deliveryAddress }
    });
  };

  const colors = getCardColor();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Payment Method</Text>
      <Text style={styles.subtitle}>How would you like to pay?</Text>

      {/* Method selector */}
      <View style={styles.methodRow}>
        <TouchableOpacity
          style={[styles.methodTab, selectedMethod === 'card' && styles.methodTabActive]}
          onPress={() => setSelectedMethod('card')}
        >
          <Text style={styles.methodTabEmoji}>💳</Text>
          <Text style={[styles.methodTabText, selectedMethod === 'card' && styles.methodTabTextActive]}>Card</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.methodTab, selectedMethod === 'cash' && styles.methodTabActive]}
          onPress={() => setSelectedMethod('cash')}
        >
          <Text style={styles.methodTabEmoji}>💵</Text>
          <Text style={[styles.methodTabText, selectedMethod === 'cash' && styles.methodTabTextActive]}>Cash</Text>
        </TouchableOpacity>
      </View>

      {selectedMethod === 'card' ? (
        <View>
          {/* Card preview */}
          <View style={[styles.cardPreview, { backgroundColor: colors[0] }]}>
            <View style={styles.cardPreviewTop}>
              <View style={styles.chip}>
                <View style={styles.chipLine} />
                <View style={styles.chipLine} />
              </View>
              <Text style={styles.cardTypeLabel}>{cardType.type || 'Card'}</Text>
            </View>
            <Text style={styles.cardPreviewNumber}>
              {cardNumber || '•••• •••• •••• ••••'}
            </Text>
            <View style={styles.cardPreviewBottom}>
              <View>
                <Text style={styles.cardPreviewLabel}>CARD HOLDER</Text>
                <Text style={styles.cardPreviewValue}>{cardName || 'YOUR NAME'}</Text>
              </View>
              <View>
                <Text style={styles.cardPreviewLabel}>EXPIRES</Text>
                <Text style={styles.cardPreviewValue}>{expiry || 'MM/YY'}</Text>
              </View>
            </View>
          </View>

          {/* Card form */}
          <View style={styles.formCard}>

            {/* Card number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card Number</Text>
              <View style={[styles.inputRow, errors.cardNumber && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#bbb"
                  value={cardNumber}
                  onChangeText={(v) => {
                    setCardNumber(formatCardNumber(v));
                    setErrors(e => ({ ...e, cardNumber: '' }));
                  }}
                  keyboardType="numeric"
                  maxLength={19}
                />
                <Text style={styles.cardTypeChip}>{cardType.type}</Text>
              </View>
              {errors.cardNumber ? <Text style={styles.errorText}>{errors.cardNumber}</Text> : null}
            </View>

            {/* Cardholder name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name on Card</Text>
              <View style={[styles.inputRow, errors.cardName && styles.inputError]}>
                <Ionicons name="person-outline" size={18} color="#bbb" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ndima Karabo"
                  placeholderTextColor="#bbb"
                  value={cardName}
                  onChangeText={(v) => {
                    setCardName(v);
                    setErrors(e => ({ ...e, cardName: '' }));
                  }}
                  autoCapitalize="words"
                />
              </View>
              {errors.cardName ? <Text style={styles.errorText}>{errors.cardName}</Text> : null}
            </View>

            {/* Expiry + CVV */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Expiry Date</Text>
                <View style={[styles.inputRow, errors.expiry && styles.inputError]}>
                  <Ionicons name="calendar-outline" size={18} color="#bbb" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor="#bbb"
                    value={expiry}
                    onChangeText={(v) => {
                      setExpiry(formatExpiry(v));
                      setErrors(e => ({ ...e, expiry: '' }));
                    }}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                {errors.expiry ? <Text style={styles.errorText}>{errors.expiry}</Text> : null}
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>CVV</Text>
                <View style={[styles.inputRow, errors.cvv && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={18} color="#bbb" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="•••"
                    placeholderTextColor="#bbb"
                    value={cvv}
                    onChangeText={(v) => {
                      setCvv(v.replace(/\D/g, '').slice(0, 4));
                      setErrors(e => ({ ...e, cvv: '' }));
                    }}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry={!showCvv}
                  />
                  <TouchableOpacity onPress={() => setShowCvv(!showCvv)}>
                    <Ionicons name={showCvv ? 'eye-off-outline' : 'eye-outline'} size={18} color="#bbb" />
                  </TouchableOpacity>
                </View>
                {errors.cvv ? <Text style={styles.errorText}>{errors.cvv}</Text> : null}
              </View>
            </View>

            {/* Security note */}
            <View style={styles.secureNote}>
              <Ionicons name="shield-checkmark-outline" size={16} color="green" />
              <Text style={styles.secureText}>Your payment details are encrypted and secure</Text>
            </View>
          </View>
        </View>
      ) : (
        /* Cash option */
        <View style={styles.cashCard}>
          <Text style={styles.cashEmoji}>💵</Text>
          <Text style={styles.cashTitle}>Cash on Delivery</Text>
          <Text style={styles.cashSubtitle}>Have the exact amount ready when your order arrives. Our driver will provide a receipt.</Text>
        </View>
      )}

      <TouchableOpacity style={styles.mainButton} onPress={handleNext}>
        <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
        <Text style={styles.buttonText}>Confirm & View Summary</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backLinkText}>← Change Delivery Options</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginTop: Platform.OS === 'ios' ? 10 : 0 },
  subtitle: { fontSize: 15, color: '#888', marginBottom: 24, marginTop: 5 },

  // Method tabs
  methodRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  methodTab: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#eee', backgroundColor: '#fff' },
  methodTabActive: { borderColor: 'orange', backgroundColor: '#fff8f0' },
  methodTabEmoji: { fontSize: 24, marginBottom: 4 },
  methodTabText: { fontWeight: '700', color: '#aaa', fontSize: 14 },
  methodTabTextActive: { color: 'orange' },

  // Card preview
  cardPreview: { borderRadius: 20, padding: 24, marginBottom: 20, minHeight: 180 },
  cardPreviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  chip: { width: 40, height: 30, backgroundColor: '#f0c060', borderRadius: 6, justifyContent: 'center', padding: 4, gap: 4 },
  chipLine: { height: 1, backgroundColor: '#c09020' },
  cardTypeLabel: { color: 'rgba(255,255,255,0.9)', fontWeight: 'bold', fontSize: 16 },
  cardPreviewNumber: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 3, marginBottom: 24, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  cardPreviewBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardPreviewLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  cardPreviewValue: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginTop: 3 },

  // Form
  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f8f8', borderRadius: 14, paddingHorizontal: 14, borderWidth: 1.5, borderColor: '#f0f0f0' },
  inputError: { borderColor: '#ff4444' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 52, fontSize: 16, color: '#333' },
  cardTypeChip: { color: 'orange', fontWeight: 'bold', fontSize: 13 },
  rowInputs: { flexDirection: 'row' },
  errorText: { color: '#ff4444', fontSize: 12, marginTop: 4, fontWeight: '600' },

  // Secure note
  secureNote: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fff4', padding: 10, borderRadius: 10, marginTop: 4 },
  secureText: { color: 'green', fontSize: 12, fontWeight: '600', flex: 1 },

  // Cash
  cashCard: { alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 20, padding: 40, marginBottom: 16 },
  cashEmoji: { fontSize: 60, marginBottom: 16 },
  cashTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  cashSubtitle: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 22 },

  // Buttons
  mainButton: { backgroundColor: 'orange', padding: 18, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 3, shadowColor: 'orange', shadowOpacity: 0.3, shadowRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  backLink: { marginTop: 16, alignItems: 'center' },
  backLinkText: { color: '#888', fontSize: 14, fontWeight: '600' },
});