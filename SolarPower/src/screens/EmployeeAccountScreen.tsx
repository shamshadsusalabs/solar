// src/screens/EmployeeAccountScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { User, Phone, CreditCard, LogOut } from "lucide-react-native";

import { useEmployeeAuthStore } from "../stores/employeeAuthStore";

const EmployeeAccountScreen: React.FC = () => {
  const {
    employee,
    profile,
    aadhaarStatus,
    loadingProfile,
    loadingAadhaar,
    fetchEmployeeProfile,
    fetchEmployeeAadhaarStatus,
    logoutEmployee,
  } = useEmployeeAuthStore();

  const [loggingOut, setLoggingOut] = useState(false);

  // Profile / Aadhaar info load on mount
  useEffect(() => {
    if (!profile) {
      fetchEmployeeProfile();
    }
    if (!aadhaarStatus) {
      fetchEmployeeAadhaarStatus();
    }
  }, [profile, aadhaarStatus, fetchEmployeeProfile, fetchEmployeeAadhaarStatus]);

  const onLogout = async () => {
    Alert.alert(
      "Logout",
      "Are You Sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              setLoggingOut(true);
              await logoutEmployee();
              // App.tsx me role null hote hi AuthLoginScreen pe chala jayega
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const isLoading = loadingProfile || loadingAadhaar;

  return (
    <ScrollView
      className="flex-1 bg-emerald-50"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <Text className="text-xl font-semibold text-emerald-900 mb-3">
        My Account
      </Text>

      {/* Loading state */}
      {isLoading && !profile && (
        <View className="mt-8 items-center">
          <ActivityIndicator color="#059669" />
          <Text className="mt-2 text-xs text-slate-500">
            Loading profile...
          </Text>
        </View>
      )}

      {/* Basic info card */}
      <View className="mb-4 rounded-2xl bg-white border border-emerald-100 shadow-sm shadow-emerald-100 px-4 py-4">
        <View className="flex-row items-center mb-3">
          <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center mr-3">
            <User size={20} color="#047857" />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-slate-900">
              {profile?.name || employee?.name || "Employee"}
            </Text>
            <Text className="text-[11px] text-slate-500">
              Code: {profile?.employeeCode || employee?.employeeCode || "-"}
            </Text>
          </View>

          <View className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            <Text className="text-[10px] text-emerald-700 font-semibold">
              Employee
            </Text>
          </View>
        </View>

        {/* Phone */}
        <View className="flex-row items-center mt-1">
          <Phone size={14} color="#4b5563" />
          <Text className="ml-2 text-[12px] text-slate-800">
            {profile?.phoneNumber || employee?.phoneNumber || "N/A"}
          </Text>
        </View>

        {/* Created at (agar ho to) */}
        {profile?.createdAt && (
          <Text className="mt-2 text-[10px] text-slate-400">
            Joined on: {new Date(profile.createdAt).toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* Aadhaar card */}
      <View className="mb-4 rounded-2xl bg-white border border-emerald-100 shadow-sm shadow-emerald-100 px-4 py-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <CreditCard size={16} color="#4b5563" />
            <Text className="ml-2 text-[13px] font-semibold text-slate-900">
              Aadhaar Details
            </Text>
          </View>

          {aadhaarStatus?.isFilled ? (
            <View className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100">
              <Text className="text-[10px] text-emerald-700 font-semibold">
                Completed
              </Text>
            </View>
          ) : (
            <View className="px-2 py-1 rounded-full bg-amber-50 border border-amber-100">
              <Text className="text-[10px] text-amber-700 font-semibold">
                Pending
              </Text>
            </View>
          )}
        </View>

        <Text className="text-[11px] text-slate-700 mb-1">
          Aadhaar Number:{" "}
          {profile?.aadhaarNumber ? profile.aadhaarNumber : "Not added"}
        </Text>

        <Text className="text-[11px] text-slate-700 mb-1">
          Aadhaar File:{" "}
          {profile?.aadhaarUrl ? "Uploaded" : "Not uploaded"}
        </Text>

        <Text className="text-[10px] text-slate-400 mt-2">
          Aadhaar update / upload option baad me yahan se add kiya ja sakta hai.
        </Text>
      </View>

      {/* Logout button */}
      <View className="mt-4">
        <Pressable
          onPress={onLogout}
          disabled={loggingOut}
          className={`flex-row items-center justify-center rounded-2xl py-3 ${
            loggingOut ? "bg-red-300" : "bg-red-500"
          } active:opacity-85`}
        >
          {loggingOut ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <LogOut size={16} color="#ffffff" />
              <Text className="ml-2 text-white font-semibold text-sm">
                Logout
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default EmployeeAccountScreen;
