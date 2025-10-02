import React, { useState, useLayoutEffect, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
} from "react-native";
import { getMyFoods, updateFood, addFood } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SellerDashboardScreen({ navigation }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const [selectedFood, setSelectedFood] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editStatus, setEditStatus] = useState("available");
  const [editPlace, setEditPlace] = useState("");

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newPlace, setNewPlace] = useState("");

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          navigation.replace("Login");
        },
      },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const data = await getMyFoods();
      setFoods(data);
    } catch (err) {
      console.error("Error fetching foods:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  
  const openEditModal = (food) => {
    setSelectedFood(food);
    setEditName(food.name);
    setEditPrice(String(food.price));
    setEditQuantity(String(food.quantity));
    setEditStatus(food.status || "available");
    setEditPlace(food.place_name || "");
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    try {
      await updateFood(selectedFood._id, {
        name: editName,
        price: editPrice,
        quantity: editQuantity,
        status: editStatus,
        place_name: editPlace,
      });
      Alert.alert("Success", "Food updated successfully");
      setEditModalVisible(false);
      fetchFoods();
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("Error", "Failed to update food");
    }
  };

  const saveNewFood = async () => {
    try {
      await addFood({
        name: newName,
        price: newPrice,
        quantity: newQuantity,
        place_name: newPlace,
      });
      Alert.alert("Success", "Food added successfully");
      setAddModalVisible(false);
      setNewName("");
      setNewPrice("");
      setNewQuantity("");
      setNewPlace("");
      fetchFoods();
    } catch (err) {
      console.error("Add error:", err);
      Alert.alert("Error", "Failed to add food");
    }
  };

  const renderFoodItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image_url || "https://via.placeholder.com/100" }}
        style={styles.foodImage}
      />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodPrice}>฿{item.price}</Text>
        <Text style={styles.foodDetail}>Quantity: {item.quantity}</Text>
        <Text style={styles.foodDetail}>สถานที่: {item.place_name || "-"}</Text>
        <Text
          style={[
            styles.foodDetail,
            { color: item.status === "available" ? "green" : "red" },
          ]}
        >
          สถานะ: {item.status}
        </Text>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.editButtonText}>แก้ไข</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seller Dashboard</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <FlatList
          data={foods}
          keyExtractor={(item) => item._id}
          renderItem={renderFoodItem}
          style={{ marginBottom: 20 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "gray" }}>
              ❌ No foods found
            </Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setAddModalVisible(true)}
      >
        <Text style={styles.buttonText}>เพิ่มรายการอาหาร</Text>
      </TouchableOpacity>

      
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Food</Text>

            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="ชื่ออาหาร"
            />
            <TextInput
              style={styles.input}
              value={editPrice}
              onChangeText={setEditPrice}
              placeholder="ราคา"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={editQuantity}
              onChangeText={setEditQuantity}
              placeholder="จำนวน"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={editPlace}
              onChangeText={setEditPlace}
              placeholder="สถานที่"
            />
            <Picker
              selectedValue={editStatus}
              style={styles.input}
              onValueChange={(itemValue) => setEditStatus(itemValue)}
            >
              <Picker.Item label="Available" value="available" />
              <Picker.Item label="Sold Out" value="sold" />
            </Picker>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
                <Text style={styles.saveButtonText}>บันทึก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>เพิ่มรายการอาหาร</Text>

            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="ชื่ออาหาร"
            />
            <TextInput
              style={styles.input}
              value={newPrice}
              onChangeText={setNewPrice}
              placeholder="ราคา"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={newQuantity}
              onChangeText={setNewQuantity}
              placeholder="จำนวน"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={newPlace}
              onChangeText={setNewPlace}
              placeholder="สถานที่"
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.saveButton} onPress={saveNewFood}>
                <Text style={styles.saveButtonText}>เพิ่ม</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    elevation: 3,
  },
  foodImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  foodInfo: { flex: 1, justifyContent: "center" },
  foodName: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  foodPrice: { fontSize: 16, color: "green", marginBottom: 6 },
  foodDetail: { fontSize: 14, color: "gray", marginBottom: 6 },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#1976D2",
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  editButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  logout: { color: "red", fontWeight: "bold", marginRight: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  cancelButtonText: { color: "red", fontSize: 16, fontWeight: "bold" },
});
