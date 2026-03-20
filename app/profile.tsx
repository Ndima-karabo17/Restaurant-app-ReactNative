import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { apiClient } from '../src/api/client';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomTabBar from '../src/components/BottomTabBar';

export default function ProfileScreen() {
  const [user, setUser] = useState({ name: '', email: '', address: '', phone: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await apiClient.put('/auth/profile', user);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Could not update profile.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => router.replace('/') },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="orange" />;

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase() || '?'}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            <TouchableOpacity onPress={() => isEditing ? handleUpdate() : setIsEditing(true)}>
              <Text style={styles.editLink}>{isEditing ? 'SAVE' : 'EDIT'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={[styles.input, !isEditing && styles.disabledInput]} value={user.phone} editable={isEditing} onChangeText={(txt) => setUser({ ...user, phone: txt })} />
            <Text style={styles.label}>Default Delivery Address</Text>
            <TextInput style={[styles.input, !isEditing && styles.disabledInput]} value={user.address} editable={isEditing} multiline onChangeText={(txt) => setUser({ ...user, address: txt })} />
          </View>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/orders')}>
          <Ionicons name="receipt-outline" size={22} color="#444" />
          <Text style={styles.menuText}>My Order History</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="red" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <View style={{ height: 20 }} />
      </ScrollView>
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fdfdfd' },
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#fff' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'orange', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#888', marginTop: 5 },
  section: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase' },
  editLink: { color: 'orange', fontWeight: 'bold' },
  infoBox: { backgroundColor: '#fff', borderRadius: 15, padding: 15, elevation: 2 },
  label: { fontSize: 12, color: '#aaa', marginBottom: 5 },
  input: { fontSize: 16, color: '#333', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 8, marginBottom: 15 },
  disabledInput: { borderBottomColor: 'transparent', color: '#666' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16, color: '#333' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', padding: 20, marginTop: 20 },
  logoutText: { marginLeft: 15, fontSize: 16, color: 'red', fontWeight: 'bold' },
});