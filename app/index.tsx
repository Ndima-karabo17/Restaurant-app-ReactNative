import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image, TouchableOpacity,
  ActivityIndicator, ScrollView, TextInput, Alert,
  RefreshControl, Animated, StatusBar, Platform
} from 'react-native';
import { apiClient } from '../src/api/client';
import { useRouter } from 'expo-router';
import { useCart } from '../src/context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import BottomTabBar from '../src/components/BottomTabBar';

interface Product {
  id: string;
  name: string;
  price: string;
  image_url: string;
  category: string;
  description?: string;
}

const CATEGORIES = [
  { label: 'All', emoji: '🍽️' },
  { label: 'Main', emoji: '🍔' },
  { label: 'Starters', emoji: '🥗' },
  { label: 'Drinks', emoji: '🥤' },
  { label: 'Dessert', emoji: '🍰' },
  { label: 'Breakfast', emoji: '🍳' },
];

const FEATURED_BANNERS = [
  { title: '20% OFF', subtitle: 'On all burgers today', color: 'orange', emoji: '🍔', category: 'Main' },
  { title: 'Free Drink', subtitle: 'With any Main order', color: '#e67e00', emoji: '🥤', category: 'Drinks' },
  { title: 'New Items', subtitle: 'Fresh additions daily', color: '#cc6600', emoji: '⭐', category: 'All' },
];

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
 
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useState(new Animated.Value(0))[0];
  const toastTranslateY = useState(new Animated.Value(-20))[0];
  const router = useRouter();
  const { addToCart, cart } = useCart();

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    toastTranslateY.setValue(-20);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(toastTranslateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
      Animated.delay(1800),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastVisible(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    let result = products;
    if (selectedCategory !== 'All') result = result.filter((p) => p.category === selectedCategory);
    setFilteredProducts(result);
  }, [ selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      const data = Array.isArray(response.data) ? response.data : [];
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Connection Error', 'Could not fetch the menu. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart({ id: product.id, name: product.name, price: product.price, quantity: 1, image_url: product.image_url });
    showToast(`🛒 ${product.name} added to cart!`);
  };

  if (loading) return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="orange" />
      <Text style={{ marginTop: 10, color: '#888' }}>Loading delicious menu...</Text>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Toast */}
      {toastVisible && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity, transform: [{ translateY: toastTranslateY }] }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['orange']} />}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋</Text>
                <Text style={styles.header}>Delicious Menu</Text>
              </View>
              <TouchableOpacity style={styles.cartIcon} onPress={() => router.push('/checkout')}>
                <Ionicons name="cart" size={26} color="white" />
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>


            {/* Banners */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannerContainer}>
              {FEATURED_BANNERS.map((banner, i) => (
                <View key={i} style={[styles.banner, { backgroundColor: banner.color }]}>
                  <View style={styles.bannerContent}>
                    <Text style={styles.bannerTitle}>{banner.title}</Text>
                    <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                   <TouchableOpacity 
  style={styles.bannerBtn}
  onPress={() => setSelectedCategory(banner.category)}
>
  <Text style={styles.bannerBtnText}>Order Now</Text>
</TouchableOpacity>
                  </View>
                  <Text style={styles.bannerEmoji}>{banner.emoji}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Categories */}
            <Text style={styles.sectionLabel}>Categories</Text>
            <View style={{ height: 80 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.label}
                    style={[styles.categoryButton, selectedCategory === cat.label && styles.categoryButtonActive]}
                    onPress={() => setSelectedCategory(cat.label)}
                  >
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.categoryText, selectedCategory === cat.label && styles.categoryTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Menu count */}
            <View style={styles.menuTitleRow}>
              <Text style={styles.sectionLabel}>{selectedCategory === 'All' ? 'All Items' : selectedCategory}</Text>
              <Text style={styles.menuCount}>{filteredProducts.length} items</Text>
            </View>
          </View>
        }
       
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.imageWrapper}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="fast-food-outline" size={40} color="#ddd" />
                </View>
              )}
            </View>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              {item.description ? <Text style={styles.desc} numberOfLines={1}>{item.description}</Text> : null}
              <Text style={styles.price}>R{parseFloat(item.price).toFixed(2)}</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
                <Text style={styles.buttonText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Toast
  toast: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, alignSelf: 'center', backgroundColor: '#1a1a1a', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, zIndex: 999, elevation: 20 },
  toastText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, marginBottom: 15 },
  greeting: { fontSize: 13, color: 'orange', fontWeight: '700', marginBottom: 2 },
  header: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  cartIcon: { backgroundColor: 'orange', padding: 10, borderRadius: 12, elevation: 3 },
  cartBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: 'red', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  cartBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  // Search
  searchSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', marginHorizontal: 20, borderRadius: 15, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16, color: '#333' },

  // Banners
  bannerContainer: { paddingHorizontal: 20 },
  banner: { width: 280, height: 130, borderRadius: 20, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  bannerContent: { flex: 1 },
  bannerTitle: { fontSize: 26, fontWeight: '900', color: '#fff' },
  bannerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 3, marginBottom: 10 },
  bannerBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, alignSelf: 'flex-start' },
  bannerBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  bannerEmoji: { fontSize: 55 },

  // Section labels
  sectionLabel: { fontSize: 18, fontWeight: 'bold', color: '#333', marginHorizontal: 20, marginTop: 18, marginBottom: 10 },
  menuTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginBottom: 5 },
  menuCount: { fontSize: 13, color: '#aaa', fontWeight: '600' },

  // Categories
  categoryContainer: { paddingHorizontal: 15, paddingVertical: 10 },
  categoryButton: { alignItems: 'center', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f5f5f5', marginRight: 10, height: 60, justifyContent: 'center' },
  categoryButtonActive: { backgroundColor: 'orange' },
  catEmoji: { fontSize: 18, marginBottom: 2 },
  categoryText: { fontWeight: '600', color: '#777', fontSize: 12 },
  categoryTextActive: { color: '#fff' },

  // Cards
  row: { justifyContent: 'space-between', paddingHorizontal: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 20, width: '47%', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, overflow: 'hidden' },
  imageWrapper: { width: '100%', height: 120, backgroundColor: '#f9f9f9' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' },
  info: { padding: 12 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  desc: { fontSize: 11, color: '#bbb', marginBottom: 2 },
  price: { fontSize: 15, color: 'green', fontWeight: '800', marginVertical: 4 },
  addButton: { backgroundColor: 'orange', paddingVertical: 10, borderRadius: 12, alignItems: 'center', marginTop: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyText: { color: '#bbb', marginTop: 10, fontSize: 16, textAlign: 'center' },
});