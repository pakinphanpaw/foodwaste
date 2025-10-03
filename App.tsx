import React from "react";
import 'react-native-get-random-values';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SellerDashboardScreen from "./src/screens/SellerDashboard";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import FoodListScreen from "./src/screens/FoodListScreen";
import FoodDetailScreen from "./src/screens/FoodDetailScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "เข้าสู่ระบบ" }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "สมัครสมาชิก" }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "หน้าหลัก" }}
          />
          <Stack.Screen
            name="FoodList"
            component={FoodListScreen}
            options={{ title: "รายการอาหาร" }}
          />
          <Stack.Screen
            name="SellerDashboard"
            component={SellerDashboardScreen}
            options={{ title: "หน้าหลักผู้ขาย" }}
          />
          <Stack.Screen
            name="FoodDetail"
            component={FoodDetailScreen}
            options={{ title: "รายละเอียดสินค้า" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
