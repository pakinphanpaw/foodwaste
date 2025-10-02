import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { register } from "../services/api";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");

  const handleRegister = async () => {
    try {
      await register(username, password, role);
      Alert.alert("Success", "User registered successfully!");
      navigation.replace("Login"); 
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Role (buyer/seller)"
        value={role}
        onChangeText={setRole}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>สมัครสมาชิก</Text>
      </TouchableOpacity>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    padding: 12, marginBottom: 15, fontSize: 16,
  },
  button: {
    backgroundColor: "#2196F3", padding: 15, borderRadius: 8, alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  link: { color: "#2196F3", marginTop: 15, textAlign: "center" },
});
