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
  ScrollView,
} from "react-native";

import AdminLoginForm from "./AdminLoginForm";
import EmployeeLoginForm from "./EmployeeLoginForm";
import ManagerLoginForm from "./ManagerLoginForm";
import ChiefLoginForm from "./ChiefLoginForm";
import GodownInchargeLoginForm from "./GodownInchargeLoginForm";

type LoginMode = "admin" | "employee" | "manager" | "chief" | "godown_incharge";

const AuthLoginScreen: React.FC = () => {
  const [mode, setMode] = useState<LoginMode>("admin");

  const isAdmin = mode === "admin";
  const isEmployee = mode === "employee";
  const isManager = mode === "manager";
  const isChief = mode === "chief";
  const isGodownIncharge = mode === "godown_incharge";

  // Title & subtitle based on mode
  const getTitle = () => {
    switch (mode) {
      case "admin":
        return "Admin Console";
      case "employee":
        return "Employee Portal";
      case "manager":
        return "Manager Portal";
      case "chief":
        return "Chief Portal";
      case "godown_incharge":
        return "Warehouse Portal";
    }
  };

  const getWelcomeText = () => {
    switch (mode) {
      case "admin":
        return "Welcome back 👋";
      case "employee":
        return "Welcome to Solar Team 👋";
      case "manager":
        return "Welcome Manager 👋";
      case "chief":
        return "Welcome Chief 👋";
      case "godown_incharge":
        return "Welcome Godown Incharge 👋";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "admin":
        return "Sign in to access your solar projects, installations & reports.";
      case "employee":
        return "Login with your employee code to fill forms & manage site visits.";
      case "manager":
        return "Access management dashboard, team overview & reports.";
      case "chief":
        return "Access chief dashboard, operations & team management.";
      case "godown_incharge":
        return "Access warehouse operations, inventory & lead management.";
    }
  };

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
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 justify-center py-8">
            {/* Logo + Company Name */}
            <View className="items-center mb-8">
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
                  {getTitle()}
                </Text>
                <View className="h-1 w-8 rounded-full bg-emerald-400" />
              </View>
            </View>

            {/* 🔀 5-Way Mode Toggle: Admin / Employee / Manager / Chief / Godown */}
            <View className="bg-emerald-100/70 rounded-2xl p-1 mb-4">
              <View className="flex-row gap-x-1">
                <View className="flex-1">
                  <Text
                    className={`text-center py-2 rounded-2xl text-[9px] font-semibold ${isAdmin ? "bg-white shadow text-emerald-700" : "text-emerald-500"
                      }`}
                    onPress={() => setMode("admin")}
                  >
                    Admin
                  </Text>
                </View>

                <View className="flex-1">
                  <Text
                    className={`text-center py-2 rounded-2xl text-[9px] font-semibold ${isEmployee ? "bg-white shadow text-emerald-700" : "text-emerald-500"
                      }`}
                    onPress={() => setMode("employee")}
                  >
                    Employee
                  </Text>
                </View>

                <View className="flex-1">
                  <Text
                    className={`text-center py-2 rounded-2xl text-[9px] font-semibold ${isManager ? "bg-white shadow text-emerald-700" : "text-emerald-500"
                      }`}
                    onPress={() => setMode("manager")}
                  >
                    Manager
                  </Text>
                </View>

                <View className="flex-1">
                  <Text
                    className={`text-center py-2 rounded-2xl text-[9px] font-semibold ${isChief ? "bg-white shadow text-emerald-700" : "text-emerald-500"
                      }`}
                    onPress={() => setMode("chief")}
                  >
                    Chief
                  </Text>
                </View>

                <View className="flex-1">
                  <Text
                    className={`text-center py-2 rounded-2xl text-[9px] font-semibold ${isGodownIncharge ? "bg-white shadow text-emerald-700" : "text-emerald-500"
                      }`}
                    onPress={() => setMode("godown_incharge")}
                  >
                    Godown
                  </Text>
                </View>
              </View>
            </View>

            {/* Card (common layout) */}
            <View className="bg-white/95 rounded-3xl p-6 shadow-xl border border-emerald-100">
              {/* Heading */}
              <Text className="text-xl font-semibold text-emerald-900 mb-1">
                {getWelcomeText()}
              </Text>
              <Text className="text-slate-500 mb-6 text-sm">
                {getSubtitle()}
              </Text>

              {/* Render different forms based on mode */}
              {isAdmin && <AdminLoginForm />}
              {isEmployee && <EmployeeLoginForm />}
              {isManager && <ManagerLoginForm />}
              {isChief && <ChiefLoginForm />}
              {isGodownIncharge && <GodownInchargeLoginForm />}
            </View>

            {/* Footer */}
            <View className="items-center mt-6">
              <Text className="text-emerald-400 text-xs">
                © {new Date().getFullYear()} Solar Power Solution
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthLoginScreen;
