import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { apiClient } from '../src/api/client';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../src/context/CartContext';
import BottomTabBar from '../src/components/BottomTabBar';

interface Product {
  id: string | number;
  name: string;
  price: string;
  image_url: string;
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data);
      setFiltered(response.data);
    } catch (error) {
      console.error('Search fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setQuery(text);
    setFiltered(products.filter((item) => item.name.toLowerCase().includes(text.toLowerCase())));
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="orange" /></View>;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.header}>Search Menu</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput placeholder="Search for burgers, pizza..." style={styles.input} value={query} onChangeText={handleSearch} placeholderTextColor="#999" />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <Image source={{ uri: item.image_url }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>R{parseFloat(item.price).toFixed(2)}</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => addToCart({ ...item, id: item.id.toString(), quantity: 1 })}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<View style={styles.center}><Text style={{ color: '#999' }}>No results found for `{query}`</Text></View>}
        />
      </View>
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  header: { fontSize: 28, fontWeight: 'bold', marginVertical: 20, color: '#333' },
  searchBar: { flexDirection: 'row', backgroundColor: '#f5f5f5', padding: 12, borderRadius: 15, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },
  itemCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#fff', padding: 12, borderRadius: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  itemImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#eee' },
  itemInfo: { flex: 1, marginLeft: 15 },
  itemName: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  itemPrice: { color: 'green', fontWeight: 'bold', marginTop: 4, fontSize: 15 },
  addBtn: { backgroundColor: 'orange', borderRadius: 12, padding: 8 },
});