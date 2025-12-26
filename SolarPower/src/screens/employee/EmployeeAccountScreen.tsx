// src/screens/EmployeeAccountScreen.tsx
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { User, Phone, CreditCard, LogOut, Upload, X } from "lucide-react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { pick, types } from "@react-native-documents/picker";

import { useEmployeeAuthStore } from "../../stores/employeeAuthStore";

const EmployeeAccountScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    employee,
    profile,
    aadhaarStatus,
    loadingProfile,
    loadingAadhaar,
    fetchEmployeeProfile,
    fetchEmployeeAadhaarStatus,
    logoutEmployee,
    uploadEmployeeAadhaar,
  } = useEmployeeAuthStore();

  const [loggingOut, setLoggingOut] = useState(false);

  // Aadhaar Upload Modal
  const [showAadhaarModal, setShowAadhaarModal] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarFile, setAadhaarFile] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Profile / Aadhaar info load on mount
  useEffect(() => {
    if (!profile) {
      fetchEmployeeProfile();
    }
    if (!aadhaarStatus) {
      fetchEmployeeAadhaarStatus();
    }
  }, [profile, aadhaarStatus, fetchEmployeeProfile, fetchEmployeeAadhaarStatus]);

  // =======================
  // 📂 AADHAAR FILE PICKING
  // =======================
  const pickAadhaarFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: "photo",
        selectionLimit: 1,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const size = asset.fileSize ?? 0;
      const name = asset.fileName || "aadhaar.jpg";

      // Max 5MB validation
      const MAX_SIZE = 5 * 1024 * 1024;
      if (size && size > MAX_SIZE) {
        const sizeMB = (size / (1024 * 1024)).toFixed(2);
        Alert.alert(
          "File Too Large",
          `Selected file is ${sizeMB} MB. Maximum allowed size is 5 MB.`
        );
        return;
      }

      if (!asset.uri || !asset.type) return;

      setAadhaarFile({
        uri: asset.uri,
        type: asset.type,
        name,
      });
    } catch (err) {
      Alert.alert("Error", "Gallery se file pick nahi ho payi.");
    }
  };

  const pickAadhaarFromFiles = async () => {
    try {
      const [res] = await pick({
        type: [types.pdf, types.images],
      });

      const size = res.size ?? 0;
      const name = res.name || "aadhaar.pdf";

      // Max 5MB validation
      const MAX_SIZE = 5 * 1024 * 1024;
      if (size && size > MAX_SIZE) {
        const sizeMB = (size / (1024 * 1024)).toFixed(2);
        Alert.alert(
          "File Too Large",
          `Selected file is ${sizeMB} MB. Maximum allowed size is 5 MB.`
        );
        return;
      }

      setAadhaarFile({
        uri: res.uri,
        type: res.type || "application/pdf",
        name,
      });
    } catch (err) {
      // File picker cancelled or error - silent
    }
  };

  const removeAadhaarFile = () => {
    setAadhaarFile(null);
  };

  // =======================
  // 📤 UPLOAD AADHAAR
  // =======================
  const handleAadhaarUpload = async () => {
    setUploadError(null);

    // Validation
    if (!aadhaarNumber.trim() || aadhaarNumber.trim().length !== 12) {
      setUploadError("Aadhaar number must be exactly 12 digits");
      return;
    }

    if (!/^\d{12}$/.test(aadhaarNumber.trim())) {
      setUploadError("Aadhaar number must contain only digits");
      return;
    }

    if (!aadhaarFile) {
      setUploadError("Please select an Aadhaar file (photo or PDF)");
      return;
    }

    setUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("aadhaarNumber", aadhaarNumber.trim());
      formData.append("aadhaarFile", {
        uri: aadhaarFile.uri,
        type: aadhaarFile.type,
        name: aadhaarFile.name,
      } as any);

      const success = await uploadEmployeeAadhaar(formData);

      if (success) {
        Alert.alert(
          "Success",
          "Aadhaar uploaded successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                setShowAadhaarModal(false);
                setAadhaarNumber("");
                setAadhaarFile(null);
                setUploadError(null);
              },
            },
          ]
        );
      } else {
        setUploadError("Upload failed. Please try again.");
      }
    } catch (err) {
      setUploadError("Upload error. Please check your connection.");
    } finally {
      setUploading(false);
    }
  };

  const openAadhaarModal = () => {
    setShowAadhaarModal(true);
    setAadhaarNumber("");
    setAadhaarFile(null);
    setUploadError(null);
  };

  const closeAadhaarModal = () => {
    if (uploading) return;
    setShowAadhaarModal(false);
    setAadhaarNumber("");
    setAadhaarFile(null);
    setUploadError(null);
  };

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
    <>
      <ScrollView
        className="flex-1 bg-emerald-50"
        contentContainerStyle={{ paddingTop: insets.top + 12, padding: 16, paddingBottom: 32 }}
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
              (profile as any)?.aadhaarVerified === "approved" ? (
                <View className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                  <Text className="text-[10px] text-emerald-700 font-semibold">
                    ✓ Approved
                  </Text>
                </View>
              ) : (profile as any)?.aadhaarVerified === "rejected" ? (
                <View className="px-2 py-1 rounded-full bg-red-50 border border-red-100">
                  <Text className="text-[10px] text-red-700 font-semibold">
                    ✗ Rejected
                  </Text>
                </View>
              ) : (
                <View className="px-2 py-1 rounded-full bg-amber-50 border border-amber-100">
                  <Text className="text-[10px] text-amber-700 font-semibold">
                    ⏳ Under Review
                  </Text>
                </View>
              )
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

          {/* Rejection Message */}
          {profile?.aadhaarVerified === "rejected" && (
            <View className="mt-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2">
              <Text className="text-[11px] text-red-700 font-semibold">
                ⚠️ Your Aadhaar was rejected by admin. Please upload correct document.
              </Text>
            </View>
          )}

          {/* Upload/Update Button */}
          <Pressable
            onPress={openAadhaarModal}
            disabled={loadingAadhaar}
            className="mt-3 flex-row items-center justify-center rounded-2xl py-2.5 bg-emerald-500 active:opacity-85"
          >
            {loadingAadhaar ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Upload size={14} color="#ffffff" />
                <Text className="ml-2 text-white font-semibold text-xs">
                  {profile?.aadhaarVerified === "rejected"
                    ? "Re-upload Aadhaar"
                    : aadhaarStatus?.isFilled
                      ? "Update Aadhaar"
                      : "Upload Aadhaar"}
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Logout button */}
        <View className="mt-4">
          <Pressable
            onPress={onLogout}
            disabled={loggingOut}
            className={`flex-row items-center justify-center rounded-2xl py-3 ${loggingOut ? "bg-red-300" : "bg-red-500"
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

      {/* 📤 Aadhaar Upload Modal */}
      <Modal
        visible={showAadhaarModal}
        transparent
        animationType="slide"
        onRequestClose={closeAadhaarModal}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl px-5 py-5 max-h-[85%]">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-slate-900">
                Upload Aadhaar
              </Text>
              <Pressable
                onPress={closeAadhaarModal}
                disabled={uploading}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center active:opacity-70"
              >
                <X size={18} color="#475569" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Aadhaar Number Input */}
              <View className="mb-4">
                <Text className="text-slate-700 mb-1.5 text-xs font-medium">
                  Aadhaar Number (12 digits)
                </Text>
                <View className="rounded-2xl border border-emerald-100 bg-emerald-50/30 px-3">
                  <TextInput
                    value={aadhaarNumber}
                    onChangeText={setAadhaarNumber}
                    placeholder="Enter 12-digit Aadhaar number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    maxLength={12}
                    className="py-2.5 text-sm text-slate-900"
                  />
                </View>
              </View>

              {/* File Picker Buttons */}
              <View className="mb-4">
                <Text className="text-slate-700 mb-1.5 text-xs font-medium">
                  Upload Aadhaar Document (Photo or PDF, max 5MB)
                </Text>
                <View className="flex-row">
                  <Pressable
                    onPress={pickAadhaarFromGallery}
                    disabled={uploading}
                    className="flex-1 mr-2 bg-emerald-50 border border-emerald-100 rounded-2xl py-3 items-center active:opacity-80"
                  >
                    <Text className="text-emerald-700 font-semibold text-xs">
                      Gallery
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={pickAadhaarFromFiles}
                    disabled={uploading}
                    className="flex-1 bg-emerald-50 border border-emerald-100 rounded-2xl py-3 items-center active:opacity-80"
                  >
                    <Text className="text-emerald-700 font-semibold text-xs">
                      PDF / Files
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* File Preview */}
              {aadhaarFile && (
                <View className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 px-3 py-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-2">
                      <Text className="text-[10px] text-emerald-700 font-semibold mb-0.5">
                        Selected File:
                      </Text>
                      <Text
                        className="text-[11px] text-slate-700"
                        numberOfLines={1}
                      >
                        {aadhaarFile?.name}
                      </Text>
                    </View>
                    <Pressable
                      onPress={removeAadhaarFile}
                      disabled={uploading}
                      className="px-2.5 py-1.5 rounded-full bg-red-100 active:opacity-80"
                    >
                      <Text className="text-[10px] text-red-600 font-semibold">
                        Remove
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Error Message */}
              {uploadError && (
                <View className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-3 py-2">
                  <Text className="text-[11px] text-red-600">{uploadError}</Text>
                </View>
              )}

              {/* Upload Button */}
              <Pressable
                onPress={handleAadhaarUpload}
                disabled={uploading}
                className={`mt-2 rounded-2xl py-3.5 items-center active:opacity-85 ${uploading ? "bg-emerald-300" : "bg-emerald-500"
                  }`}
              >
                {uploading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View className="flex-row items-center">
                    <Upload size={16} color="#ffffff" />
                    <Text className="ml-2 text-white font-semibold text-sm">
                      Upload Aadhaar
                    </Text>
                  </View>
                )}
              </Pressable>

              {/* Cancel Button */}
              <Pressable
                onPress={closeAadhaarModal}
                disabled={uploading}
                className="mt-3 rounded-2xl py-3 items-center bg-slate-100 active:opacity-85"
              >
                <Text className="text-slate-700 font-medium text-sm">
                  Cancel
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default EmployeeAccountScreen;
