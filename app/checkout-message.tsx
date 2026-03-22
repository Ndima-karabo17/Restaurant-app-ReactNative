import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CheckoutMessageScreen() {
  const router = useRouter();

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pop in the checkmark
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Slide up content
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Pulse the circle
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const estimatedTime = Math.floor(Math.random() * 10) + 25; // 25-35 mins

  return (
    <View style={styles.container}>

      {/* Top green wave */}
      <View style={styles.topSection}>
        <Animated.View style={[styles.outerRing, { transform: [{ scale: pulseAnim }] }]}>
          <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
            <Ionicons name="checkmark-sharp" size={60} color="white" />
          </Animated.View>
        </Animated.View>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        <Text style={styles.title}>Order Placed! 🎉</Text>
        <Text style={styles.subtitle}>
          Your delicious food is being prepared and will be with you shortly.
        </Text>

        {/* ETA card */}
        <View style={styles.etaCard}>
          <View style={styles.etaItem}>
            <Ionicons name="time-outline" size={28} color="orange" />
            <Text style={styles.etaValue}>{estimatedTime} min</Text>
            <Text style={styles.etaLabel}>Estimated Time</Text>
          </View>
          <View style={styles.etaDivider} />
          <View style={styles.etaItem}>
            <Ionicons name="bicycle-outline" size={28} color="orange" />
            <Text style={styles.etaValue}>On Way</Text>
            <Text style={styles.etaLabel}>Order Status</Text>
          </View>
          <View style={styles.etaDivider} />
          <View style={styles.etaItem}>
            <Ionicons name="star-outline" size={28} color="orange" />
            <Text style={styles.etaValue}>4.8 ★</Text>
            <Text style={styles.etaLabel}>Restaurant</Text>
          </View>
        </View>

        {/* Progress steps */}
        <View style={styles.stepsCard}>
          <Step icon="checkmark-circle" label="Order Confirmed" done />
          <StepLine done />
          <Step icon="restaurant-outline" label="Being Prepared" active />
          <StepLine />
          <Step icon="bicycle-outline" label="On The Way" />
          <StepLine />
          <Step icon="home-outline" label="Delivered" />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/')}>
            <Ionicons name="restaurant-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Back to Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/orders')}>
            <Ionicons name="receipt-outline" size={20} color="orange" />
            <Text style={styles.secondaryButtonText}>View My Orders</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

function Step({ icon, label, done, active }: { icon: string; label: string; done?: boolean; active?: boolean }) {
  return (
    <View style={stepStyles.wrapper}>
      <View style={[stepStyles.circle, done && stepStyles.circleDone, active && stepStyles.circleActive]}>
        <Ionicons name={icon as any} size={18} color={done ? '#fff' : active ? 'orange' : '#ccc'} />
      </View>
      <Text style={[stepStyles.label, done && stepStyles.labelDone, active && stepStyles.labelActive]}>
        {label}
      </Text>
    </View>
  );
}

function StepLine({ done }: { done?: boolean }) {
  return <View style={[stepStyles.line, done && stepStyles.lineDone]} />;
}

const stepStyles = StyleSheet.create({
  wrapper: { alignItems: 'center', flex: 1 },
  circle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  circleDone: { backgroundColor: '#4CAF50' },
  circleActive: { backgroundColor: '#fff', borderWidth: 2, borderColor: 'orange' },
  label: { fontSize: 10, color: '#bbb', fontWeight: '600', textAlign: 'center' },
  labelDone: { color: '#4CAF50' },
  labelActive: { color: 'orange' },
  line: { flex: 1, height: 2, backgroundColor: '#f0f0f0', marginTop: -24, alignSelf: 'center' },
  lineDone: { backgroundColor: '#4CAF50' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },

  // Top section
  topSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  outerRing: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: '#4CAF50',
    shadowOpacity: 0.4, shadowRadius: 15,
  },

  // Content
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 24 },

  // ETA card
  etaCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', marginBottom: 16,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
  },
  etaItem: { flex: 1, alignItems: 'center', gap: 4 },
  etaValue: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 4 },
  etaLabel: { fontSize: 11, color: '#aaa', fontWeight: '600' },
  etaDivider: { width: 1, height: 50, backgroundColor: '#f0f0f0' },

  // Steps
  stepsCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
  },

  // Buttons
  buttonContainer: { gap: 12 },
  primaryButton: {
    backgroundColor: 'orange', paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10,
    elevation: 3, shadowColor: 'orange', shadowOpacity: 0.3, shadowRadius: 8,
  },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  secondaryButton: {
    paddingVertical: 15, borderRadius: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#ffe0b2', backgroundColor: '#fff',
    flexDirection: 'row', justifyContent: 'center', gap: 10,
  },
  secondaryButtonText: { color: 'orange', fontWeight: '700', fontSize: 16 },
});