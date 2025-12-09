// src/auth/AuthLoginScreen.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";

import AdminLoginForm from "./AdminLoginForm";
import EmployeeLoginForm from "./EmployeeLoginForm";

type LoginMode = "admin" | "employee";

const AuthLoginScreen: React.FC = () => {
  const [mode, setMode] = useState<LoginMode>("admin");

  const isAdmin = mode === "admin";

  return (
    <SafeAreaView className="flex-1 bg-emerald-50">
      <StatusBar barStyle="dark-content" />

      {/* Light modern background accents */}
      <View className="absolute -top-16 -right-10 h-40 w-40 bg-emerald-200 rounded-full opacity-40" />
      <View className="absolute -bottom-20 -left-10 h-48 w-48 bg-emerald-100 rounded-full opacity-50" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 px-6 justify-center">
          {/* Logo + Company Name */}
          <View className="items-center mb-10">
            <View className="h-20 w-20 mb-4 rounded-3xl bg-white/80 shadow-md items-center justify-center">
              <Image
                source={require("../assets/logo.png")}
                className="h-14 w-14"
                resizeMode="contain"
              />
            </View>

            <Text className="text-2xl font-extrabold text-emerald-900 tracking-wide">
              Solar Power Solution
            </Text>

            <View className="mt-2 flex-row items-center gap-x-2">
              <Text className="text-emerald-500 font-medium text-xs uppercase tracking-[2px]">
                {isAdmin ? "Admin Console" : "Employee Portal"}
              </Text>
              <View className="h-1 w-8 rounded-full bg-emerald-400" />
            </View>
          </View>

          {/* 🔀 Mode Toggle: Admin / Employee */}
          <View className="flex-row bg-emerald-100/70 rounded-2xl p-1 mb-4">
            <View className="flex-1">
              <Text
                className={`text-center py-2 rounded-2xl text-xs font-semibold ${
                  isAdmin ? "bg-white shadow text-emerald-700" : "text-emerald-500"
                }`}
                onPress={() => setMode("admin")}
              >
                Admin Login
              </Text>
            </View>

            <View className="flex-1">
              <Text
                className={`text-center py-2 rounded-2xl text-xs font-semibold ${
                  !isAdmin ? "bg-white shadow text-emerald-700" : "text-emerald-500"
                }`}
                onPress={() => setMode("employee")}
              >
                Employee Login
              </Text>
            </View>
          </View>

          {/* Card (common layout) */}
          <View className="bg-white/95 rounded-3xl p-6 shadow-xl border border-emerald-100">
            {/* Heading */}
            <Text className="text-xl font-semibold text-emerald-900 mb-1">
              {isAdmin ? "Welcome back 👋" : "Welcome to Solar Team 👋"}
            </Text>
            <Text className="text-slate-500 mb-6 text-sm">
              {isAdmin
                ? "Sign in to access your solar projects, installations & reports."
                : "Login with your employee code to fill forms & manage site visits."}
            </Text>

            {/* Yahan pe alag–alag form render hoga */}
            {isAdmin ? <AdminLoginForm /> : <EmployeeLoginForm />}
          </View>

          {/* Footer */}
          <View className="items-center mt-6">
            <Text className="text-emerald-400 text-xs">
              © {new Date().getFullYear()} Solar Power Solution
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthLoginScreen;
