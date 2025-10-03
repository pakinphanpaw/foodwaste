// src/screens/SellerDashboardScreen.js
import React, { useState, useLayoutEffect, useEffect } from "react";
import { launchImageLibrary } from "react-native-image-picker";
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
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Marker } from "react-native-maps";
import { getMyFoods, updateFood, addFood, deleteFood } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";

export default function SellerDashboardScreen({ navigation }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newImage, setNewImage] = useState(null);

  // Modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [placePickerVisible, setPlacePickerVisible] = useState(false);

  // edit state
  const [selectedFood, setSelectedFood] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editStatus, setEditStatus] = useState("available");
  const [editPlace, setEditPlace] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // new food state
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newPlace, setNewPlace] = useState("");
  const [newLocation, setNewLocation] = useState(null);
  const [newDescription, setNewDescription] = useState("");

  // logout
  const handleLogout = async () => {
    Alert.alert("ออกจากระบบ", "คุณแน่ใจหรือไม่ที่จะออกจากระบบ?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ออกจากระบบ",
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
          <Text style={styles.logout}>ออกจากระบบ</Text>
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
    setEditDescription(food.description || "");
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
        description: editDescription,
      });
      Alert.alert("สำเร็จ", "แก้ไขข้อมูลเรียบร้อยแล้ว");
      setEditModalVisible(false);
      fetchFoods();
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("Error", "ไม่สามารถแก้ไขได้");
    }
  };

  const handleDelete = (foodId) => {
    Alert.alert("ลบรายการ", "คุณแน่ใจหรือไม่ที่จะลบรายการนี้?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteFood(foodId);
            Alert.alert("สำเร็จ", "ลบเรียบร้อยแล้ว");
            fetchFoods();
          } catch (err) {
            console.error("Delete error:", err);
            Alert.alert("Error", "ไม่สามารถลบได้");
          }
        },
      },
    ]);
  };

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        includeBase64: true,
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.7,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.errorCode) {
          console.log("ImagePicker Error: ", response.errorMessage);
        } else {
          const asset = response.assets[0];
          setNewImage(asset);
        }
      }
    );
  };

  const saveNewFood = async () => {
    try {
      if (!newLocation) {
        Alert.alert("กรุณาเลือกพิกัด", "ต้องเลือกพิกัดก่อนบันทึก");
        return;
      }
      await addFood({
        name: newName,
        price: newPrice,
        quantity: newQuantity,
        place_name: newPlace,
        description: newDescription,
        location: { type: "Point", coordinates: newLocation },
        imageBase64: newImage ? newImage.base64 : null,
        imageContentType: newImage ? newImage.type : null,
      });
      Alert.alert("สำเร็จ", "เพิ่มอาหารเรียบร้อยแล้ว");
      setAddModalVisible(false);
      setNewName("");
      setNewPrice("");
      setNewQuantity("");
      setNewPlace("");
      setNewImage(null);
      setNewLocation(null);
      fetchFoods();
    } catch (err) {
      console.error("Add error:", err);
      Alert.alert("Error", "ไม่สามารถเพิ่มได้");
    }
  };

  const renderFoodItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={
          item.imageBase64
            ? { uri: `data:${item.imageContentType};base64,${item.imageBase64}` }
            : { uri: "https://via.placeholder.com/100" }
        }
        style={styles.foodImage}
      />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodPrice}>฿ {item.price} บาท</Text>
        <Text style={styles.foodDetail}>สินค้าคงเหลือ: {item.quantity} ชิ้น</Text>
        <Text style={styles.foodDetail}>สถานที่: {item.place_name || "-"}</Text>
        <Text style={styles.foodDetail}>รายละเอียด: {item.description || "-"}</Text>

        <Text
          style={[
            styles.foodDetail,
            { color: item.status === "available" ? "green" : "red" },
          ]}
        >
          สถานะ: {item.status}
        </Text>

        <View style={{ flexDirection: "row", marginTop: 6 }}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.editButtonText}>แก้ไข</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: "red", marginLeft: 8 }]}
            onPress={() => handleDelete(item._id)}
          >
            <Text style={styles.editButtonText}>ลบ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      
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
              ❌ ไม่พบข้อมูลอาหาร
            </Text>
          }
        />
      )}

      {/* ปุ่มเพิ่มรายการ */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setAddModalVisible(true)}
      >
        <Text style={styles.buttonText}>เพิ่มรายการอาหาร</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>เพิ่มรายการอาหาร</Text>

            <Text style={styles.label}>ชื่ออาหาร :</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="ชื่ออาหาร"
            />

            <Text style={styles.label}>ราคา :</Text>
            <TextInput
              style={styles.input}
              value={newPrice}
              onChangeText={setNewPrice}
              placeholder="ราคา"
              keyboardType="numeric"
            />

            <Text style={styles.label}>จำนวน :</Text>
            <TextInput
              style={styles.input}
              value={newQuantity}
              onChangeText={setNewQuantity}
              placeholder="จำนวน"
              keyboardType="numeric"
            />
            <Text style={styles.label}>สถานที่ :</Text>
            <TextInput
              style={styles.input}
              value={newPlace}
              onChangeText={setNewPlace}
              placeholder="ชื่อสถานที่ (เช่น ร้านอาหาร, บ้าน, ฯลฯ)"
            />

            <Text style={styles.label}>รายละเอียด :</Text>
            <TextInput
              style={styles.input}
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="รายละเอียดอาหาร เช่น ส่วนประกอบ, วิธีปรุง ฯลฯ"
              multiline
            />
            {/* Upload รูป */}
            <Text style={styles.label}>รูปภาพ :</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Icon name="cloud-upload-outline" size={20} color="#333" />
              <Text style={styles.uploadButtonText}>
                {newImage ? "เลือกรูปใหม่" : "เลือกไฟล์รูปภาพ"}
              </Text>
            </TouchableOpacity>

            {newImage && (
              <View style={{ alignItems: "center", marginTop: 10 }}>
                <Image
                  source={{ uri: newImage.uri }}
                  style={{ width: 100, height: 100, borderRadius: 8 }}
                />
              </View>
            )}

            {/* เลือกพิกัด */}
            <TouchableOpacity
              style={[styles.imagePickerButton, { backgroundColor: "#009688" }]}
              onPress={() => setPlacePickerVisible(true)}
            >
              <Text style={{ color: "#fff" }}>
                {newLocation ? "📍 พิกัดถูกเลือกแล้ว" : "เลือกพิกัดจาก Google Maps"}
              </Text>
            </TouchableOpacity>

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

      {/* Google Places Autocomplete + Map Modal */}
      {/* เลือกพิกัดจากแผนที่ Modal */}
      <Modal visible={placePickerVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: newLocation ? newLocation[1] : 13.7563,
              longitude: newLocation ? newLocation[0] : 100.5018,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setNewLocation([longitude, latitude]); // กดตรงไหนก็เซ็ตพิกัดใหม่
            }}
          >
            {newLocation && (
              <Marker
                coordinate={{
                  latitude: newLocation[1],
                  longitude: newLocation[0],
                }}
                draggable
                onDragEnd={(e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  setNewLocation([longitude, latitude]); // ลากหมุดแล้วอัพเดทพิกัด
                }}
              />
            )}
          </MapView>

          {/* ปุ่มยืนยัน */}
          <TouchableOpacity
            style={{
              backgroundColor: "#4CAF50",
              padding: 15,
              alignItems: "center",
            }}
            onPress={() => setPlacePickerVisible(false)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>ยืนยันพิกัด</Text>
          </TouchableOpacity>
        </View>
      </Modal>



      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>แก้ไขรายการอาหาร</Text>

            <Text style={styles.label}>ชื่ออาหาร :</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
            />

            <Text style={styles.label}>ราคา :</Text>
            <TextInput
              style={styles.input}
              value={editPrice}
              onChangeText={setEditPrice}
              keyboardType="numeric"
            />

            <Text style={styles.label}>จำนวน :</Text>
            <TextInput
              style={styles.input}
              value={editQuantity}
              onChangeText={setEditQuantity}
              keyboardType="numeric"
            />

            <Text style={styles.label}>สถานที่ :</Text>
            <TextInput
              style={styles.input}
              value={editPlace}
              onChangeText={setEditPlace}
            />
            <Text style={styles.label}>รายละเอียด :</Text>
            <TextInput
              style={styles.input}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="รายละเอียดอาหาร"
              multiline
            />

            <Text style={styles.label}>สถานะ :</Text>
            <Picker
              selectedValue={editStatus}
              style={styles.input}
              onValueChange={(val) => setEditStatus(val)}
            >
              <Picker.Item label="Available" value="available" />
              <Picker.Item label="Unavailable" value="unavailable" />
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
    </View>
  );
}

// Styles
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
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    marginBottom: 10,
  },
  uploadButtonText: {
    fontSize: 14,
    marginLeft: 6,
    color: "#333",
    fontWeight: "500",
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
    margin: 10,
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
  imagePickerButton: {
    marginTop: 12,
    backgroundColor: "#1976D2",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
});
