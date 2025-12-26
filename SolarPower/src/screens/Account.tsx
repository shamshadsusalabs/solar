// src/screens/Account.tsx
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import {
  UserCircle2,
  ShieldCheck,
  Mail,
  Phone,
  LogOut,
  Edit3,
  X,
} from "lucide-react-native";

import { useAdminAuthStore } from "../stores/adminAuthStore";

const Account: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { admin, logoutAdmin, updateAdminProfile, loading } = useAdminAuthStore();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");

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

  const openEditModal = () => {
    setEditEmail(admin?.email || "");
    setEditPhone(admin?.phoneNumber || "");
    setEditPassword("");
    setShowEditModal(true);
  };

  const handleUpdateProfile = async () => {
    if (!editEmail.trim() && !editPhone.trim() && !editPassword.trim()) {
      Alert.alert("Error", "Please fill at least one field to update");
      return;
    }

    const updateData: any = {};
    if (editEmail.trim() && editEmail !== admin?.email) {
      updateData.email = editEmail.trim();
    }
    if (editPhone.trim() && editPhone !== admin?.phoneNumber) {
      updateData.phoneNumber = editPhone.trim();
    }
    if (editPassword.trim()) {
      updateData.password = editPassword.trim();
    }

    if (Object.keys(updateData).length === 0) {
      Alert.alert("Info", "No changes to update");
      return;
    }

    const success = await updateAdminProfile(updateData);

    if (success) {
      Alert.alert("Success", "Profile updated successfully");
      setShowEditModal(false);
    } else {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  // Real admin permissions
  const permissions = [
    "Create & delete Employees",
    "Create & delete Managers",
    "Create & delete Chiefs",
    "Create & delete Godown Incharges",
    "View all leads from all users",
    "Change lead status to any status",
    "Full control over the entire system",
  ];

  return (
    <>
      <ScrollView
        className="flex-1 bg-emerald-50 px-6"
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-emerald-900">
            Admin Account
          </Text>
          <Text className="text-slate-500 mt-1 text-sm">
            Manage your profile & view admin permissions.
          </Text>
        </View>

        {/* Profile card */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-emerald-50">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1">
              <View className="h-14 w-14 rounded-full bg-emerald-100 items-center justify-center mr-3">
                <UserCircle2 size={34} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-emerald-900">
                  Admin User
                </Text>
                <Text className="text-[12px] text-emerald-600 font-medium">
                  Super Admin • Full Access
                </Text>
              </View>
            </View>
            <Pressable
              onPress={openEditModal}
              className="h-9 w-9 rounded-full bg-emerald-50 items-center justify-center"
            >
              <Edit3 size={16} color="#059669" />
            </Pressable>
          </View>

          {/* Contact Info */}
          <View className="gap-y-2 mt-2">
            <View className="flex-row items-center">
              <Mail size={14} color="#059669" />
              <Text className="ml-2 text-[12px] text-slate-500">Email:</Text>
              <Text className="ml-1 text-[12px] font-semibold text-slate-800">
                {admin?.email || "—"}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Phone size={14} color="#059669" />
              <Text className="ml-2 text-[12px] text-slate-500">Phone:</Text>
              <Text className="ml-1 text-[12px] font-semibold text-slate-800">
                {admin?.phoneNumber || "—"}
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
                Admin Permissions
              </Text>
            </View>
            <Text className="text-[11px] text-emerald-600 font-medium">
              Super Admin
            </Text>
          </View>

          {permissions.map((perm, idx) => (
            <View key={idx} className="flex-row items-start mb-2">
              <View className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 mr-2" />
              <Text className="text-[12px] text-slate-700 flex-1">{perm}</Text>
            </View>
          ))}
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

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-5">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-slate-800">
                Edit Profile
              </Text>
              <Pressable
                onPress={() => setShowEditModal(false)}
                className="h-8 w-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <X size={20} color="#475569" />
              </Pressable>
            </View>

            <View className="gap-y-3">
              <View>
                <Text className="text-xs text-slate-500 mb-1">Email</Text>
                <TextInput
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter new email"
                  className="border border-emerald-100 rounded-xl px-3 py-2.5 text-sm text-slate-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View>
                <Text className="text-xs text-slate-500 mb-1">Phone Number</Text>
                <TextInput
                  value={editPhone}
                  onChangeText={setEditPhone}
                  keyboardType="phone-pad"
                  placeholder="Enter new phone number"
                  className="border border-emerald-100 rounded-xl px-3 py-2.5 text-sm text-slate-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View>
                <Text className="text-xs text-slate-500 mb-1">
                  New Password (optional)
                </Text>
                <TextInput
                  value={editPassword}
                  onChangeText={setEditPassword}
                  secureTextEntry
                  placeholder="Leave empty to keep current password"
                  className="border border-emerald-100 rounded-xl px-3 py-2.5 text-sm text-slate-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <Pressable
                onPress={handleUpdateProfile}
                disabled={loading}
                className={`mt-2 rounded-xl py-3 items-center justify-center ${loading ? "bg-emerald-300" : "bg-emerald-600"
                  }`}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-sm font-semibold">
                    Update Profile
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Account;
