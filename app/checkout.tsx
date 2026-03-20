import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useCart } from '../src/context/CartContext';
import { apiClient } from '../src/api/client';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomTabBar from '../src/components/BottomTabBar';

export default function CheckoutScreen() {
  const { cart, totalPrice, clearCart, updateQuantity, removeFromCart } = useCart();
  const { paymentType, deliveryMethod, deliveryAddress } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const response = await apiClient.post('/orders', {
        items: cart,
        total: totalPrice,
        paymentMethod: paymentType || 'card',
        deliveryMethod,
        deliveryAddress
      });
      if (response.status === 201) {
        clearCart();
        router.replace('/checkout-message');
      }
    } catch (error) {
      Alert.alert('Error', 'Order failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Order Summary</Text>

        {/* Items Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Items</Text>
          {cart.length > 0 ? cart.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemMain}>
                <Text style={styles.itemText} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>R{(Number(item.price) * item.quantity).toFixed(2)}</Text>
              </View>
              <View style={styles.controls}>
                <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>
                  <Ionicons name="remove-circle-outline" size={24} color="orange" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.qtyBtn}>
                  <Ionicons name="add-circle-outline" size={24} color="orange" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={22} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )) : <Text style={styles.emptyText}>Your basket is empty.</Text>}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R{totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* Delivery Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <TouchableOpacity onPress={() => router.push('/delivery-options')}>
              <Text style={styles.changeText}>CHANGE</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name={deliveryMethod === 'pickup' ? 'storefront-outline' : 'location-outline'} size={20} color="#666" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.detailTitle}>{deliveryMethod === 'pickup' ? 'Store Pickup' : 'Delivery Address'}</Text>
              <Text style={styles.detailSubtext}>{deliveryMethod === 'pickup' ? 'Main Branch - Downtown' : deliveryAddress}</Text>
            </View>
          </View>
        </View>

        {/* Payment Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <TouchableOpacity onPress={() => router.push('/payment')}>
              <Text style={styles.changeText}>CHANGE</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name={paymentType === 'cash' ? 'cash-outline' : 'card-outline'} size={20} color="#666" />
            <Text style={[styles.detailTitle, { marginLeft: 10 }]}>
              {paymentType === 'cash' ? 'Cash on Delivery' : 'Credit / Debit Card'}
            </Text>
          </View>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          style={[styles.orderButton, (loading || cart.length === 0) && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={loading || cart.length === 0}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.orderButtonText}>Place Order • R{totalPrice.toFixed(2)}</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fdfdfd' },
  container: { flex: 1, padding: 20 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase' },
  changeText: { color: 'orange', fontWeight: 'bold', fontSize: 13 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  itemMain: { flex: 1 },
  itemText: { fontSize: 16, fontWeight: '600', color: '#333' },
  itemPrice: { fontSize: 14, color: 'green', fontWeight: '700' },
  controls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f8f8', borderRadius: 20, paddingHorizontal: 5 },
  qtyBtn: { padding: 5 },
  qtyText: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 8, minWidth: 20, textAlign: 'center' },
  deleteBtn: { marginLeft: 10, padding: 5 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: 'orange' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  detailTitle: { fontSize: 16, fontWeight: '600', color: '#444' },
  detailSubtext: { fontSize: 14, color: '#888', marginTop: 2 },
  orderButton: { backgroundColor: 'orange', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  disabledButton: { backgroundColor: '#ccc' },
  orderButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  emptyText: { textAlign: 'center', color: '#bbb', marginVertical: 20 },
});