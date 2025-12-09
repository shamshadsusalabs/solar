// src/screens/Account.tsx
import React from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Alert,
} from "react-native";
import {
  UserCircle2,
  ShieldCheck,
  Lock,
  Phone,
  Mail,
  Building2,
  LogOut,
} from "lucide-react-native";

import { useAdminAuthStore } from "../stores/adminAuthStore";

const Account: React.FC = () => {
  const logoutAdmin = useAdminAuthStore((s) => s.logoutAdmin);
  const admin = useAdminAuthStore((s) => s.admin);

  const onLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout from admin panel?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logoutAdmin();
          },
        },
      ]
    );
  };

  // ✅ Simple admin info – NO employeeCode
  const adminInfo = {
    name: admin?.email || "Admin User",
    role: "Super Admin",
    email: admin?.email || "—",
    phone: admin?.phoneNumber || "—",
    branch: "Jaipur HQ",
  };

  const permissions = [
    "View & approve all solar projects",
    "Manage employees & roles",
    "Access financial reports",
    "Approve RTS capacity forms",
    "Configure system settings",
  ];

  const security = {
    twoFactorEnabled: true,
    lastLogin: new Date().toLocaleString(),
    activeSessions: 1,
  };

  return (
    <ScrollView
      className="flex-1 bg-emerald-50 px-6 pt-6"
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-emerald-900">
          Admin Account
        </Text>
        <Text className="text-slate-500 mt-1 text-sm">
          Manage your profile, permissions & security settings.
        </Text>
      </View>

      {/* Profile card */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-emerald-50 flex-row items-center">
        <View className="h-14 w-14 rounded-full bg-emerald-100 items-center justify-center mr-3">
          <UserCircle2 size={34} color="#059669" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-emerald-900">
            {adminInfo.name}
          </Text>
          <Text className="text-[12px] text-emerald-600 font-medium">
            {adminInfo.role}
          </Text>
          <Text className="text-[11px] text-slate-400 mt-1">
            Solar Power Solution – {adminInfo.branch}
          </Text>
        </View>
      </View>

      {/* Contact details */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-emerald-50">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Building2 size={18} color="#059669" />
            <Text className="ml-2 text-sm font-semibold text-emerald-900">
              Contact Details
            </Text>
          </View>
          <Text className="text-[11px] text-emerald-600 font-medium">
            Admin Profile
          </Text>
        </View>

        <View className="gap-y-2">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Mail size={14} color="#059669" />
              <Text className="ml-1 text-[12px] text-slate-500">Email</Text>
            </View>
            <Text className="text-[12px] font-semibold text-slate-800">
              {adminInfo.email}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Phone size={14} color="#059669" />
              <Text className="ml-1 text-[12px] text-slate-500">Phone</Text>
            </View>
            <Text className="text-[12px] font-semibold text-slate-800">
              {adminInfo.phone}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Building2 size={14} color="#059669" />
              <Text className="ml-1 text-[12px] text-slate-500">Branch</Text>
            </View>
            <Text className="text-[12px] font-semibold text-slate-800">
              {adminInfo.branch}
            </Text>
          </View>
        </View>
      </View>

      {/* Permissions */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-emerald-50">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <ShieldCheck size={18} color="#059669" />
            <Text className="ml-2 text-sm font-semibold text-emerald-900">
              Permissions
            </Text>
          </View>
          <Text className="text-[11px] text-emerald-600 font-medium">
            Super Admin Role
          </Text>
        </View>

        {permissions.map((perm) => (
          <View key={perm} className="flex-row items-start mb-2">
            <View className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 mr-2" />
            <Text className="text-[12px] text-slate-700 flex-1">{perm}</Text>
          </View>
        ))}
      </View>

      {/* Security */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-emerald-50">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Lock size={18} color="#059669" />
            <Text className="ml-2 text-sm font-semibold text-emerald-900">
              Security
            </Text>
          </View>
          <Text className="text-[11px] text-emerald-600 font-medium">
            High Priority
          </Text>
        </View>

        <View className="gap-y-2">
          <View className="flex-row justify-between">
            <Text className="text-[12px] text-slate-500">
              Two-Factor Authentication
            </Text>
            <Text className="text-[12px] font-semibold text-emerald-700">
              {security.twoFactorEnabled ? "Enabled" : "Disabled"}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-[12px] text-slate-500">Last Login</Text>
            <Text className="text-[12px] font-semibold text-slate-800">
              {security.lastLogin}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-[12px] text-slate-500">
              Active Sessions
            </Text>
            <Text className="text-[12px] font-semibold text-slate-800">
              {security.activeSessions}
            </Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <View className="mt-2">
        <Pressable
          onPress={onLogout}
          className="flex-row items-center justify-center bg-red-50 rounded-2xl py-3 active:opacity-85 border border-red-100"
        >
          <LogOut size={18} color="#DC2626" />
          <Text className="ml-2 text-[13px] font-semibold text-red-600">
            Logout from Admin Panel
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default Account;
