import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { apiClient } from '../src/api/client';
import { useRouter } from 'expo-router';
import { useCart } from '../src/context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import BottomTabBar from '../src/components/BottomTabBar';

interface Order {
  id: number;
  total_amount: string;
  status: string;
  items: string;
  created_at: string;
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { reorderItems } = useCart();
  const router = useRouter();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get('/orders');
      const data = Array.isArray(response.data) ? response.data : [];
      setOrders(data);
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Could not load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (orderId: number) => {
    Alert.alert('Re-order?', 'This will replace current cart with these items.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Re-order',
        onPress: async () => {
          try {
            const response = await apiClient.get(`/orders/${orderId}/items`);
            const cartItems = response.data.map((item: any) => ({
              id: item.id.toString(),
              name: item.name,
              price: item.price.toString(),
              quantity: item.quantity,
              image_url: item.image_url || '',
            }));
            reorderItems(cartItems);
            router.push('/checkout');
          } catch (err) {
            Alert.alert('Error', 'Could not load order items. Please try again.');
            console.error(err);
          }
        }
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'pending': return 'orange';
      case 'cancelled': return '#f44336';
      default: return '#999';
    }
  };

  if (loading) return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="orange" />
      <Text style={{ marginTop: 10, color: '#888' }}>Loading your orders...</Text>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.header}>My Orders</Text>}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color="#eee" />
            <Text style={styles.emptyText}>No orders yet</Text>
            <TouchableOpacity onPress={() => router.replace('/')} style={styles.shopBtn}>
              <Text style={styles.shopBtnText}>Start Ordering</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Order #{item.id}</Text>
              <Text style={styles.totalAmount}>R{Number(item.total_amount).toFixed(2)}</Text>
            </View>
            <Text style={styles.itemSummary}>{item.items || 'No items listed'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.footer}>
              <Text style={styles.date}>
                {new Date(item.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
              <TouchableOpacity style={styles.reorderBtn} onPress={() => handleReorder(item.id)}>
                <Ionicons name="refresh-outline" size={18} color="#fff" />
                <Text style={styles.reorderText}>Re-order</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8f9fa' },
  listContent: { padding: 20, paddingBottom: 10 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  orderCard: { backgroundColor: '#fff', borderRadius: 15, padding: 18, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: 'orange' },
  itemSummary: { fontSize: 14, color: '#777', fontStyle: 'italic', marginBottom: 8 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 4 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 13, color: '#aaa' },
  reorderBtn: { flexDirection: 'row', backgroundColor: 'orange', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
  reorderText: { color: '#fff', fontWeight: 'bold', marginLeft: 5, fontSize: 14 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#bbb', fontSize: 18, marginTop: 15, marginBottom: 20 },
  shopBtn: { backgroundColor: 'orange', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  shopBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});