// src/screens/FoodListScreen.js
import React, { useEffect, useState, useLayoutEffect } from "react";
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
  TextInput,
} from "react-native";
import { getAvailableFoods } from "../services/api";

export default function FoodListScreen({ navigation }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // state ฟิลเตอร์
  const [statusFilter, setStatusFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFoods();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
          <Text style={{ color: "red", fontWeight: "bold" }}>ออกจากระบบ</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert("ออกจากระบบ", "คุณแน่ใจหรือไม่ที่จะออกจากระบบ?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ออกจากระบบ",
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
        <Text style={styles.bodyText}>กำลังโหลดสินค้า...</Text>
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

  // ฟิลเตอร์ข้อมูลก่อนแสดง
  const filteredFoods = foods.filter((food) => {
    if (statusFilter !== "all" && food.status !== statusFilter) return false;

    const price = parseFloat(food.price);
    if (priceFilter === "<50" && price >= 50) return false;
    if (priceFilter === "50-100" && (price < 50 || price > 100)) return false;
    if (priceFilter === ">100" && price <= 100) return false;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const nameMatch = food.name?.toLowerCase().includes(query);
      const placeMatch = food.place_name?.toLowerCase().includes(query);
      if (!nameMatch && !placeMatch) return false;
    }

    return true;
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.imageBase64 ? (
        <Image
          source={{
            uri: `data:${item.imageContentType};base64,${item.imageBase64}`,
          }}
          style={styles.image}
        />
      ) : (
        <View style={styles.noImage}>
          <Text style={styles.bodyText}>ไม่มีรูป</Text>
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.rowBetween}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>฿ {item.price}</Text>
        </View>
        <Text style={styles.place}>สถานที่: {item.place_name || "-"}</Text>
        <Text style={styles.quantity}>สินค้าคงเหลือ: {item.quantity} ชิ้น</Text>
        <Text style={styles.owner}>ผู้ขาย: {item.user_id?.username}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => openMap(item.location)}
          >
            <Text style={styles.mapButtonText}>แผนที่</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => navigation.navigate("FoodDetail", { food: item })}
          >
            <Text style={styles.detailButtonText}>รายละเอียด</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหาสินค้า หรือ สถานที่..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* ฟิลเตอร์ */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>สถานะ:</Text>
        <TouchableOpacity onPress={() => setStatusFilter("all")}>
          <Text style={[styles.filterButton, statusFilter === "all" && styles.active]}>
            ทั้งหมด
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStatusFilter("available")}>
          <Text
            style={[
              styles.filterButton,
              statusFilter === "available" && styles.active,
            ]}
          >
            มีสินค้า
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStatusFilter("unavailable")}>
          <Text
            style={[
              styles.filterButton,
              statusFilter === "unavailable" && styles.active,
            ]}
          >
            สินค้าหมด
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>ราคา:</Text>
        <TouchableOpacity onPress={() => setPriceFilter("all")}>
          <Text style={[styles.filterButton, priceFilter === "all" && styles.active]}>
            ทั้งหมด
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPriceFilter("<50")}>
          <Text style={[styles.filterButton, priceFilter === "<50" && styles.active]}>
            {"< 50"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPriceFilter("50-100")}>
          <Text
            style={[
              styles.filterButton,
              priceFilter === "50-100" && styles.active,
            ]}
          >
            50–100
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPriceFilter(">100")}>
          <Text style={[styles.filterButton, priceFilter === ">100" && styles.active]}>
            {"> 100"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* รายการอาหาร */}
      {filteredFoods.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.bodyText}>ไม่พบสินค้า</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFoods}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
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
  info: { flex: 1, marginLeft: 12 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  name: {
    fontFamily: "Sarabun-Bold", // ใช้ฟอนต์ custom
    fontSize: 18,
    color: "#333",
  },
  price: {
    fontFamily: "Sarabun-Bold",
    color: "green",
    fontSize: 16,
  },
  place: {
    fontFamily: "Sarabun-Regular",
    fontSize: 14,
    color: "#555",
    marginTop: 6,
  },
  quantity: {
    fontFamily: "Sarabun-Regular",
    fontSize: 14,
    color: "#444",
    marginTop: 2,
  },
  owner: {
    fontFamily: "Sarabun-Regular",
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  bodyText: {
    fontFamily: "Sarabun-Regular",
    fontSize: 14,
    color: "#444",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  mapButton: {
    flex: 1,
    backgroundColor: "#2196F3",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    marginRight: 6,
  },
  mapButtonText: {
    fontFamily: "Sarabun-Bold",
    color: "#fff",
    fontSize: 14,
  },
  detailButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    marginLeft: 6,
  },
  detailButtonText: {
    fontFamily: "Sarabun-Bold",
    color: "#fff",
    fontSize: 14,
  },

  // ฟิลเตอร์
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    marginVertical: 6,
  },
  filterLabel: {
    fontFamily: "Sarabun-Bold",
    marginRight: 8,
    color: "#333",
  },
  filterButton: {
    marginRight: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#aaa",
    color: "#333",
    fontFamily: "Sarabun-Regular",
  },
  active: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    borderColor: "#4CAF50",
  },

  // Search Bar
  searchContainer: {
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: "Sarabun-Regular",
  },
});
