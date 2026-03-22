import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { apiClient } from '../src/api/client';
import { useRouter } from 'expo-router';
import { useCart } from '../src/context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import BottomTabBar from '../src/components/BottomTabBar';

interface OrderItem {
  id: string;
  name: string;
  price: string;
  image_url: string;
  quantity: number;
}

interface Order {
  id: number;
  total_amount: string;
  status: string;
  items: string;
  created_at: string;
  orderItems?: OrderItem[];
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
      const data: Order[] = Array.isArray(response.data) ? response.data : [];

      // Fetch items with images for each order
      const ordersWithItems = await Promise.all(
        data.map(async (order) => {
          try {
            const itemsRes = await apiClient.get(`/orders/${order.id}/items`);
            return { ...order, orderItems: itemsRes.data };
          } catch {
            return { ...order, orderItems: [] };
          }
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Could not load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (orderId: number, orderItems?: OrderItem[]) => {
    Alert.alert('Re-order?', 'This will replace your current cart with these items.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Re-order',
        onPress: () => {
          if (orderItems && orderItems.length > 0) {
            const cartItems = orderItems.map((item) => ({
              id: item.id.toString(),
              name: item.name,
              price: item.price.toString(),
              quantity: item.quantity,
              image_url: item.image_url || '',
            }));
            reorderItems(cartItems);
            router.push('/checkout');
          } else {
            Alert.alert('Error', 'No items found for this order.');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'pending': return 'time-outline';
      case 'cancelled': return 'close-circle';
      default: return 'ellipse-outline';
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

            {/* Order header */}
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Ionicons name={getStatusIcon(item.status) as any} size={14} color={getStatusColor(item.status)} />
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status?.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Item images row */}
            {item.orderItems && item.orderItems.length > 0 && (
              <View style={styles.imagesRow}>
                {item.orderItems.slice(0, 4).map((oi, index) => (
                  <View key={index} style={styles.itemImageWrapper}>
                    {oi.image_url ? (
                      <Image source={{ uri: oi.image_url }} style={styles.itemImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.itemImagePlaceholder}>
                        <Ionicons name="fast-food-outline" size={20} color="#ddd" />
                      </View>
                    )}
                    {/* Show +N if more than 4 items */}
                    {index === 3 && item.orderItems!.length > 4 && (
                      <View style={styles.moreOverlay}>
                        <Text style={styles.moreText}>+{item.orderItems!.length - 4}</Text>
                      </View>
                    )}
                  </View>
                ))}
                <View style={styles.itemNamesList}>
                  {item.orderItems.slice(0, 3).map((oi, i) => (
                    <Text key={i} style={styles.itemNameText} numberOfLines={1}>
                      • {oi.name} x{oi.quantity}
                    </Text>
                  ))}
                  {item.orderItems.length > 3 && (
                    <Text style={styles.itemNameText}>• +{item.orderItems.length - 3} more</Text>
                  )}
                </View>
              </View>
            )}

            <View style={styles.divider} />

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.totalAmount}>R{Number(item.total_amount).toFixed(2)}</Text>
              <TouchableOpacity style={styles.reorderBtn} onPress={() => handleReorder(item.id, item.orderItems)}>
                <Ionicons name="refresh-outline" size={16} color="#fff" />
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

  orderCard: { backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8 },

  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  date: { fontSize: 12, color: '#aaa', marginTop: 3 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: '#f5f5f5' },
  statusText: { fontSize: 11, fontWeight: 'bold' },

  // Images row
  imagesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  itemImageWrapper: { width: 52, height: 52, borderRadius: 12, overflow: 'hidden', marginRight: 8, position: 'relative' },
  itemImage: { width: '100%', height: '100%' },
  itemImagePlaceholder: { width: '100%', height: '100%', backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  moreOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  moreText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  itemNamesList: { flex: 1 },
  itemNameText: { fontSize: 12, color: '#777', marginBottom: 2 },

  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },

  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: 'orange' },
  reorderBtn: { flexDirection: 'row', backgroundColor: 'orange', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, alignItems: 'center', gap: 6, elevation: 2 },
  reorderText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#bbb', fontSize: 18, marginTop: 15, marginBottom: 20 },
  shopBtn: { backgroundColor: 'orange', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  shopBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});