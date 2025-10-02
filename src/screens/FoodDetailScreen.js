import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";

export default function FoodDetailScreen({ route }) {
  const { food } = route.params; 

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: food.image_url || "https://via.placeholder.com/200" }}
        style={styles.image}
      />

      <Text style={styles.title}>{food.name}</Text>
      <Text style={styles.price}>฿{food.price}</Text>
      <Text style={styles.quantity}>Quantity: {food.quantity}</Text>
      <Text style={styles.status}>
        Status: {food.status === "available" ? "✅ Available" : "❌ Sold Out"}
      </Text>

      <View style={styles.section}>
        <Text style={styles.label}>📄 Description:</Text>
        <Text style={styles.value}>{food.description || "No description"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>📍 Place:</Text>
        <Text style={styles.value}>{food.place_name || "N/A"}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  image: { width: "100%", height: 200, borderRadius: 10, marginBottom: 15 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  price: { fontSize: 20, color: "green", marginBottom: 5 },
  quantity: { fontSize: 16, color: "gray", marginBottom: 5 },
  status: { fontSize: 16, marginBottom: 15 },
  section: { marginBottom: 15 },
  label: { fontWeight: "bold", fontSize: 16, marginBottom: 3 },
  value: { fontSize: 15, color: "#555" },
});
