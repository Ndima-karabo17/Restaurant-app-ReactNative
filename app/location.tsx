import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomTabBar from '../src/components/BottomTabBar';

export default function LocationScreen() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name="location" size={50} color="orange" />
        </View>
        <Text style={styles.title}>Delivery Location</Text>
        <Text style={styles.subtitle}>
          We need your location to find kitchens near you and provide accurate delivery times.
        </Text>
        <View style={styles.addressCard}>
          <View style={styles.addressIconHeader}>
            <Ionicons name="home" size={24} color="orange" />
            <Text style={styles.addressLabel}>Home Address</Text>
          </View>
          <Text style={styles.addressText}>123 Default Street, Morningside</Text>
          <Text style={styles.addressText}>Johannesburg, 2057</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Address</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.primaryButton}>
          <Ionicons name="map-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.buttonText}>Confirm on Map</Text>
        </TouchableOpacity>
      </View>
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, alignItems: 'center', padding: 25, justifyContent: 'center' },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff5e6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  subtitle: { textAlign: 'center', color: '#777', marginTop: 10, marginBottom: 40, lineHeight: 22, fontSize: 15 },
  addressCard: { backgroundColor: '#f9f9f9', padding: 20, borderRadius: 20, width: '100%', marginBottom: 30, borderWidth: 1, borderColor: '#f0f0f0' },
  addressIconHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  addressLabel: { fontWeight: 'bold', fontSize: 18, marginLeft: 10, color: '#333' },
  addressText: { color: '#666', fontSize: 15, marginBottom: 2 },
  editBtn: { marginTop: 15 },
  editBtnText: { color: 'orange', fontWeight: 'bold', fontSize: 16 },
  primaryButton: { backgroundColor: 'orange', flexDirection: 'row', paddingVertical: 18, paddingHorizontal: 50, borderRadius: 15, alignItems: 'center', width: '100%', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});