import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, ScrollView, Platform
} from 'react-native';
import { apiClient } from '../src/api/client';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomTabBar from '../src/components/BottomTabBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  name: string;
  email: string;
  address: string;
  phone: string;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile>({ name: '', email: '', address: '', phone: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const router = useRouter();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      setUser({
        name: response.data.name || '',
        email: response.data.email || '',
        address: response.data.address || '',
        phone: response.data.phone || '',
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await apiClient.put('/auth/profile', user);
      setIsEditing(false);
      Alert.alert('✅ Saved', 'Your profile has been updated.');
    } catch (error) {
      Alert.alert('Error', 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('delivery_address');
          router.replace('/');
        }
      },
    ]);
  };

  const getInitials = () => {
    const parts = user.name?.trim().split(' ') || [];
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1 && parts[0]) return parts[0][0].toUpperCase();
    return user.email?.[0]?.toUpperCase() || '?';
  };

  if (loading) return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="orange" />
      <Text style={styles.loaderText}>Loading profile...</Text>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header banner */}
        <View style={styles.headerBanner}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            {isEditing && (
              <TouchableOpacity style={styles.avatarEditBtn}>
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.userName}>{user.name || 'No name set'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.memberBadge}>
            <Ionicons name="star" size={12} color="orange" />
            <Text style={styles.memberText}>Member</Text>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/orders')}>
            <Ionicons name="receipt-outline" size={24} color="orange" />
            <Text style={styles.statLabel}>My Orders</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/location')}>
            <Ionicons name="location-outline" size={24} color="orange" />
            <Text style={styles.statLabel}>Location</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/payment')}>
            <Ionicons name="card-outline" size={24} color="orange" />
            <Text style={styles.statLabel}>Payment</Text>
          </TouchableOpacity>
        </View>

        {/* Account Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            {isEditing ? (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleUpdate} style={styles.saveBtn} disabled={saving}>
                  {saving
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.saveBtnText}>Save</Text>}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editBtn}>
                <Ionicons name="pencil-outline" size={14} color="orange" />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoCard}>
            <ProfileField icon="person-outline" label="Full Name" value={user.name} placeholder="Enter your name" editable={isEditing} onChangeText={(txt) => setUser({ ...user, name: txt })} />
            <ProfileField icon="mail-outline" label="Email Address" value={user.email} placeholder="your@email.com" editable={false} onChangeText={() => {}} />
            <ProfileField icon="call-outline" label="Phone Number" value={user.phone} placeholder="+27 000 000 0000" editable={isEditing} onChangeText={(txt) => setUser({ ...user, phone: txt })} keyboardType="phone-pad" />
            <ProfileField icon="location-outline" label="Default Address" value={user.address} placeholder="123 Main Street, City" editable={isEditing} onChangeText={(txt) => setUser({ ...user, address: txt })} isLast />
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="receipt-outline" label="Order History" onPress={() => router.push('/orders')} />
            <MenuItem icon="location-outline" label="Change Location" onPress={() => router.push('/location')} />
            <MenuItem icon="help-circle-outline" label="Help & Support" onPress={() => setShowHelp(true)} />
            <MenuItem icon="information-circle-outline" label="About" onPress={() => setShowAbout(true)} isLast />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ff4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomTabBar />

      {/* Help Modal */}
      {showHelp && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help & Support</Text>
              <TouchableOpacity onPress={() => setShowHelp(false)}>
                <Ionicons name="close-circle" size={28} color="#ccc" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <HelpItem icon="call-outline" title="Call Us" desc="+27 60 355 2745 — Available Mon–Fri, 8am to 6pm" />
              <HelpItem icon="mail-outline" title="Email Support" desc="support@restaurant.com — We reply within 24 hours" />
              <HelpItem icon="chatbubble-outline" title="Live Chat" desc="Chat with us directly in the app during business hours" />
              <HelpItem icon="receipt-outline" title="Order Issues" desc="Missing item? Wrong order? Contact us within 30 mins of delivery" />
              <HelpItem icon="refresh-outline" title="Refunds" desc="Refunds are processed within 3–5 business days to your original payment method" />
              <HelpItem icon="shield-checkmark-outline" title="Privacy Policy" desc="We never share your personal data with third parties without your consent" isLast />
            </ScrollView>
          </View>
        </View>
      )}

      {/* About Modal */}
      {showAbout && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About</Text>
              <TouchableOpacity onPress={() => setShowAbout(false)}>
                <Ionicons name="close-circle" size={28} color="#ccc" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.aboutLogoRow}>
                <View style={styles.aboutLogo}>
                  <Text style={styles.aboutLogoText}>🍽️</Text>
                </View>
                <Text style={styles.aboutAppName}>RestaurantApp</Text>
                <Text style={styles.aboutVersion}>Version 1.0.0</Text>
              </View>
              <Text style={styles.aboutDesc}>
                RestaurantApp brings delicious food straight to your door. Browse our menu, customize your order, and enjoy great meals delivered fast.
              </Text>
              <HelpItem icon="globe-outline" title="Website" desc="www.restaurantapp.com" />
              <HelpItem icon="logo-instagram" title="Instagram" desc="@restaurantapp" />
              <HelpItem icon="people-outline" title="Team" desc="Built with ❤️ in South Africa" />
              <HelpItem icon="code-outline" title="Technology" desc="Built with React Native, Expo, Node.js & PostgreSQL" isLast />
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

function ProfileField({ icon, label, value, placeholder, editable, onChangeText, keyboardType, isLast }: {
  icon: string; label: string; value: string; placeholder: string;
  editable: boolean; onChangeText: (txt: string) => void; keyboardType?: any; isLast?: boolean;
}) {
  return (
    <View style={[fieldStyles.wrapper, !isLast && fieldStyles.border]}>
      <View style={fieldStyles.iconWrapper}>
        <Ionicons name={icon as any} size={18} color="orange" />
      </View>
      <View style={fieldStyles.content}>
        <Text style={fieldStyles.label}>{label}</Text>
        <TextInput
          style={[fieldStyles.input, !editable && fieldStyles.disabledInput]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#ccc"
          editable={editable}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
        />
      </View>
      {!editable && value ? <Ionicons name="checkmark-circle" size={18} color="#ccc" /> : null}
    </View>
  );
}

function MenuItem({ icon, label, onPress, isLast }: {
  icon: string; label: string; onPress: () => void; isLast?: boolean;
}) {
  return (
    <TouchableOpacity style={[menuStyles.item, !isLast && menuStyles.border]} onPress={onPress}>
      <View style={menuStyles.iconWrapper}>
        <Ionicons name={icon as any} size={20} color="orange" />
      </View>
      <Text style={menuStyles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );
}

function HelpItem({ icon, title, desc, isLast }: {
  icon: string; title: string; desc: string; isLast?: boolean;
}) {
  return (
    <View style={[helpStyles.item, !isLast && helpStyles.border]}>
      <View style={helpStyles.iconWrapper}>
        <Ionicons name={icon as any} size={20} color="orange" />
      </View>
      <View style={helpStyles.content}>
        <Text style={helpStyles.title}>{title}</Text>
        <Text style={helpStyles.desc}>{desc}</Text>
      </View>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  border: { borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  iconWrapper: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fff5e6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  content: { flex: 1 },
  label: { fontSize: 11, color: '#aaa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  input: { fontSize: 15, color: '#333', fontWeight: '600' },
  disabledInput: { color: '#555' },
});

const menuStyles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  border: { borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  iconWrapper: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fff5e6', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  label: { flex: 1, fontSize: 15, color: '#333', fontWeight: '600' },
});

const helpStyles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14 },
  border: { borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  iconWrapper: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fff5e6', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 3 },
  desc: { fontSize: 13, color: '#888', lineHeight: 20 },
});

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8f8f8' },
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, color: '#888' },
  headerBanner: { backgroundColor: '#fff', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 30, marginBottom: 10 },
  avatarWrapper: { position: 'relative', marginBottom: 14 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'orange', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: 'orange', shadowOpacity: 0.3, shadowRadius: 10 },
  avatarText: { fontSize: 34, color: '#fff', fontWeight: 'bold' },
  avatarEditBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#333', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#888', marginBottom: 10 },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fff5e6', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  memberText: { color: 'orange', fontWeight: 'bold', fontSize: 12 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', marginBottom: 10, paddingVertical: 5 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statDivider: { width: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
  statLabel: { fontSize: 12, color: '#666', fontWeight: '600', marginTop: 6 },
  section: { paddingHorizontal: 20, marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 10 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 },
  editActions: { flexDirection: 'row', gap: 8 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff5e6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  editBtnText: { color: 'orange', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#eee' },
  cancelBtnText: { color: '#888', fontWeight: '600', fontSize: 13 },
  saveBtn: { backgroundColor: 'orange', paddingHorizontal: 18, paddingVertical: 6, borderRadius: 20 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  infoCard: { backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8 },
  menuCard: { backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 20, paddingVertical: 16, borderRadius: 16, backgroundColor: '#fff5f5', marginBottom: 10 },
  logoutText: { color: '#ff4444', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 999 },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  aboutLogoRow: { alignItems: 'center', marginBottom: 20 },
  aboutLogo: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#fff5e6', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  aboutLogoText: { fontSize: 40 },
  aboutAppName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  aboutVersion: { fontSize: 13, color: '#aaa', marginTop: 4 },
  aboutDesc: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 20, textAlign: 'center' },
});