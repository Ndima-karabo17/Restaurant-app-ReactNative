import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Platform, TextInput
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
 import AsyncStorage from '@react-native-async-storage/async-storage';
export default function LocationScreen() {
  const [address, setAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const [manualMode, setManualMode] = useState(Platform.OS === 'web');
  const router = useRouter();

  // On native, auto-detect on open
  useEffect(() => {
    if (Platform.OS !== 'web') {
      detectLocation();
    }
  }, []);

  const detectLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setManualMode(true);
        setLocating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length > 0) {
        const place = result[0];
        const parts = [place.street, place.district, place.city, place.region].filter(Boolean);
        setAddress(parts.join(', '));
      }
    } catch (err) {
      console.error('Location error:', err);
      setManualMode(true);
    } finally {
      setLocating(false);
    }
  };



const handleConfirm = async () => {
  if (!address.trim()) {
    Alert.alert('No location', 'Please enter your delivery address.');
    return;
  }
  await AsyncStorage.setItem('delivery_address', address);
  router.replace('/');
};

  return (
    <View style={styles.wrapper}>

      {/* Top illustration area */}
      <View style={styles.illustrationArea}>
        <View style={styles.iconCircle}>
          <Ionicons name="location" size={55} color="orange" />
        </View>
        <Text style={styles.title}>Where should we{'\n'}deliver your food?</Text>
        <Text style={styles.subtitle}>
          We'll find the best restaurants near you and give accurate delivery times.
        </Text>
      </View>

      {/* Bottom card */}
      <View style={styles.card}>

        {/* Auto-detect button (native only) */}
        {Platform.OS !== 'web' && (
          <TouchableOpacity
            style={styles.detectBtn}
            onPress={detectLocation}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator size="small" color="orange" />
            ) : (
              <Ionicons name="navigate" size={20} color="orange" />
            )}
            <Text style={styles.detectBtnText}>
              {locating ? 'Detecting...' : 'Use My Current Location'}
            </Text>
          </TouchableOpacity>
        )}

        {Platform.OS !== 'web' && (
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or enter manually</Text>
            <View style={styles.orLine} />
          </View>
        )}

        {/* Address input */}
        <View style={styles.inputWrapper}>
          <Ionicons name="location-outline" size={20} color="#aaa" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your delivery address..."
            placeholderTextColor="#bbb"
            value={address}
            onChangeText={setAddress}
            multiline={false}
          />
          {address.length > 0 && (
            <TouchableOpacity onPress={() => setAddress('')}>
              <Ionicons name="close-circle" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        {/* Detected address display */}
        {address.length > 0 && (
          <View style={styles.addressCard}>
            <Ionicons name="home-outline" size={18} color="orange" />
            <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
          </View>
        )}

        {/* Confirm button */}
        <TouchableOpacity
          style={[styles.confirmBtn, !address.trim() && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!address.trim()}
        >
          <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
          <Text style={styles.confirmBtnText}>Confirm & See Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },

  // Illustration
  illustrationArea: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 30, paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  iconCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#fff5e6', justifyContent: 'center',
    alignItems: 'center', marginBottom: 24,
    elevation: 3, shadowColor: 'orange', shadowOpacity: 0.2, shadowRadius: 10,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', textAlign: 'center', lineHeight: 34, marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 22 },

  // Card
  card: {
    backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    elevation: 10, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20,
  },

  // Detect button
  detectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff5e6', paddingVertical: 14, borderRadius: 14,
    marginBottom: 16, gap: 10, borderWidth: 1, borderColor: '#ffe0b2',
  },
  detectBtnText: { color: 'orange', fontWeight: 'bold', fontSize: 15 },

  // Or divider
  orRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: '#eee' },
  orText: { color: '#bbb', fontSize: 13, fontWeight: '600' },

  // Input
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5',
    borderRadius: 14, paddingHorizontal: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#eee',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 52, fontSize: 15, color: '#333' },

  // Address display
  addressCard: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff5e6',
    borderRadius: 12, padding: 12, marginBottom: 16, gap: 10,
    borderWidth: 1, borderColor: '#ffe0b2',
  },
  addressText: { flex: 1, color: '#555', fontSize: 14, fontWeight: '600', lineHeight: 20 },

  // Confirm button
  confirmBtn: {
    backgroundColor: 'orange', flexDirection: 'row', paddingVertical: 17,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10,
    elevation: 3, shadowColor: 'orange', shadowOpacity: 0.3, shadowRadius: 8,
    marginBottom: 12,
  },
  confirmBtnDisabled: { backgroundColor: '#ccc', elevation: 0, shadowOpacity: 0 },
  confirmBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },

  // Skip
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { color: '#aaa', fontWeight: '600', fontSize: 14 },
});