import React from "react";
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
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="FoodList" component={FoodListScreen} />
          <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
          
          <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
