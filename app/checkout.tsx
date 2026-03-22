import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image, Platform } from 'react-native';
import { useCart } from '../src/context/CartContext';
import { apiClient } from '../src/api/client';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomTabBar from '../src/components/BottomTabBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CheckoutScreen() {
  const { cart, totalPrice, clearCart, updateQuantity, removeFromCart } = useCart();
  const { paymentType, deliveryMethod, deliveryAddress } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [savedAddress, setSavedAddress] = useState('');
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('delivery_address').then(addr => {
      if (addr) setSavedAddress(addr);
    });
  }, []);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const response = await apiClient.post('/orders', {
        items: cart,
        total: totalPrice,
        paymentMethod: paymentType || 'card',
        deliveryMethod,
        deliveryAddress: deliveryAddress || savedAddress
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

  const deliveryFee = deliveryMethod === 'pickup' ? 0 : 30;
  const grandTotal = totalPrice + deliveryFee;
  const displayAddress = deliveryMethod === 'pickup'
    ? 'Main Branch - Downtown'
    : (deliveryAddress || savedAddress || 'No address set');

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.header}>My Cart</Text>
          <View style={styles.headerRight}>
            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCountText}>{cart.length} items</Text>
            </View>
            <TouchableOpacity style={styles.addMoreBtn} onPress={() => router.replace('/')}>
              <Ionicons name="add" size={18} color="orange" />
              <Text style={styles.addMoreText}>Add More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Items Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Items</Text>
          {cart.length > 0 ? cart.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemImageWrapper}>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.itemImage} resizeMode="cover" />
                ) : (
                  <View style={styles.itemImagePlaceholder}>
                    <Ionicons name="fast-food-outline" size={22} color="#ddd" />
                  </View>
                )}
              </View>
              <View style={styles.itemMain}>
                <Text style={styles.itemText} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>R{(Number(item.price) * item.quantity).toFixed(2)}</Text>
                <Text style={styles.itemUnitPrice}>R{Number(item.price).toFixed(2)} each</Text>
              </View>
              <View style={styles.controls}>
                <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>
                  <Ionicons name="remove-circle-outline" size={26} color="orange" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.qtyBtn}>
                  <Ionicons name="add-circle-outline" size={26} color="orange" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>
          )) : (
            <View style={styles.emptyCart}>
              <Ionicons name="cart-outline" size={60} color="#eee" />
              <Text style={styles.emptyText}>Your basket is empty</Text>
              <TouchableOpacity onPress={() => router.replace('/')} style={styles.shopNowBtn}>
                <Text style={styles.shopNowText}>Browse Menu</Text>
              </TouchableOpacity>
            </View>
          )}

          {cart.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Subtotal</Text>
                <Text style={styles.priceValue}>R{totalPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Delivery Fee</Text>
                <Text style={[styles.priceValue, deliveryFee === 0 && { color: 'green' }]}>
                  {deliveryFee === 0 ? 'FREE' : `R${deliveryFee.toFixed(2)}`}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>R{grandTotal.toFixed(2)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Delivery Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <TouchableOpacity onPress={() => router.push('/delivery-options')} style={styles.changeBtn}>
              <Text style={styles.changeText}>CHANGE</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name={deliveryMethod === 'pickup' ? 'storefront-outline' : 'location-outline'} size={20} color="orange" />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.detailTitle}>
                {deliveryMethod === 'pickup' ? 'Store Pickup' : 'Delivery to Address'}
              </Text>
              <Text style={styles.detailSubtext}>{displayAddress}</Text>
            </View>
          </View>
        </View>

        {/* Payment Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity onPress={() => router.push('/payment')} style={styles.changeBtn}>
              <Text style={styles.changeText}>CHANGE</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name={paymentType === 'cash' ? 'cash-outline' : 'card-outline'} size={20} color="orange" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.detailTitle}>{paymentType === 'cash' ? 'Cash on Delivery' : 'Credit / Debit Card'}</Text>
              <Text style={styles.detailSubtext}>{paymentType === 'cash' ? 'Pay when your order arrives' : 'Secure card payment'}</Text>
            </View>
          </View>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          style={[styles.orderButton, (loading || cart.length === 0) && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={loading || cart.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.orderBtnInner}>
              <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
              <Text style={styles.orderButtonText}>Place Order • R{grandTotal.toFixed(2)}</Text>
            </View>
          )}
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
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: Platform.OS === 'ios' ? 10 : 0 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#333', flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemCountBadge: { backgroundColor: '#fff3e0', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  itemCountText: { color: 'orange', fontWeight: 'bold', fontSize: 13 },
  addMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff3e0', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  addMoreText: { color: 'orange', fontWeight: 'bold', fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 },
  changeBtn: { backgroundColor: '#fff3e0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  changeText: { color: 'orange', fontWeight: 'bold', fontSize: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  itemImageWrapper: { width: 56, height: 56, borderRadius: 14, overflow: 'hidden', marginRight: 12, backgroundColor: '#f5f5f5' },
  itemImage: { width: '100%', height: '100%' },
  itemImagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  itemMain: { flex: 1 },
  itemText: { fontSize: 15, fontWeight: '700', color: '#333' },
  itemPrice: { fontSize: 14, color: 'green', fontWeight: '800', marginTop: 2 },
  itemUnitPrice: { fontSize: 11, color: '#bbb', marginTop: 1 },
  controls: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { padding: 3 },
  qtyText: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 6, minWidth: 20, textAlign: 'center', color: '#333' },
  deleteBtn: { marginLeft: 8, padding: 3 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  priceLabel: { fontSize: 14, color: '#888' },
  priceValue: { fontSize: 14, fontWeight: '700', color: '#333' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: 'orange' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  detailIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff3e0', justifyContent: 'center', alignItems: 'center' },
  detailTitle: { fontSize: 15, fontWeight: '700', color: '#333' },
  detailSubtext: { fontSize: 13, color: '#888', marginTop: 2 },
  orderButton: { backgroundColor: 'orange', padding: 18, borderRadius: 18, alignItems: 'center', marginTop: 10, elevation: 4, shadowColor: 'orange', shadowOpacity: 0.4, shadowRadius: 10 },
  disabledButton: { backgroundColor: '#ccc', elevation: 0, shadowOpacity: 0 },
  orderBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  emptyCart: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { color: '#bbb', fontSize: 16, marginTop: 10, marginBottom: 20 },
  shopNowBtn: { backgroundColor: 'orange', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 },
  shopNowText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  backBtn: { backgroundColor: '#f5f5f5', padding: 8, borderRadius: 12, marginRight: 12 },
});