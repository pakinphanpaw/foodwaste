import React, { useEffect, useState, useLayoutEffect } from "react";
import { Modal, TextInput } from "react-native";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from "react-native";
import { getAvailableFoods } from "../services/api";

export default function FoodListScreen({ navigation }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoods();
  }, []);

  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleLogout}
          style={{ marginRight: 15 }}
        >
          <Text style={{ color: "red", fontWeight: "bold" }}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
        
          navigation.replace("Login");
        },
      },
    ]);
  };

  const fetchFoods = async () => {
    try {
      const data = await getAvailableFoods();
      setFoods(data);
    } catch (err) {
      console.error("Error fetching foods:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading foods...</Text>
      </View>
    );
  }

  const openMap = (location) => {
    if (location && location.coordinates) {
      const [lng, lat] = location.coordinates; 
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      Linking.openURL(url);
    } else {
      console.warn("No location data");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.image} />
      ) : (
        <View style={styles.noImage}>
          <Text>No Image</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>฿ {item.price}</Text>
        <Text style={styles.place}>📍 {item.place_name}</Text>
        <Text style={styles.quantity}>สินค้าคงเหลือ: {item.quantity}</Text>
        <Text style={styles.owner}>ผู้ขาย: {item.user_id?.username}</Text>

        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => openMap(item.location)}
        >
          <Text style={styles.mapButtonText}>Open in Maps</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => navigation.navigate("FoodDetail", { food: item })}
        >
          <Text style={styles.detailButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={foods}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 10 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
    elevation: 3,
  },
  image: { width: 90, height: 90, borderRadius: 8 },
  noImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1, marginLeft: 12, justifyContent: "space-between" },
  name: { fontSize: 18, fontWeight: "bold", color: "#333" },
  price: { color: "green", marginTop: 4, fontSize: 16, fontWeight: "600" },
  place: { fontSize: 14, color: "#555", marginTop: 4 },
  quantity: { fontSize: 14, color: "#444", marginTop: 4 },
  owner: { fontSize: 12, color: "#666", marginTop: 2 },
  mapButton: {
    marginTop: 10,
    backgroundColor: "#2196F3",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  mapButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  detailButton: {
    marginTop: 8,
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  detailButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
});
