// src/screens/Employees.tsx
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Image,
} from "react-native";
import {
  Users,
  FileText,
  Plus,
  Phone,
  MessageCircle,
  Edit,
  Trash2,
  X,
} from "lucide-react-native";

import { useEmployeeAuthStore } from "../stores/employeeAuthStore";
import { useAdminAuthStore } from "../stores/adminAuthStore";
import {
  registerEmployeeService,
  updateEmployeeService,
  deleteEmployeeService,
  verifyEmployeeAadhaarService,
} from "../services/employeeAuthService";

const Employees: React.FC = () => {
  const insets = useSafeAreaInsets();

  // ✅ Admin employees list + filters from store
  const {
    adminEmployees,
    adminLoading,
    adminError,
    adminPage,
    adminTotalPages,
    adminSearch,
    setAdminSearch,
    setAdminPage,
    fetchAllEmployeesForAdmin,
  } = useEmployeeAuthStore();

  // ✅ Admin token
  const { tokens: adminTokens } = useAdminAuthStore();
  const adminAccessToken = adminTokens?.accessToken || "";

  // ✅ Local state for register form
  const [employeeCode, setEmployeeCode] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 🔽 Form visible / hidden
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // ✏️ Edit employee modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<{
    id: string;
    name: string;
    phoneNumber: string;
    employeeCode: string;
  } | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  // 🎯 Local filter by employee code
  const [employeeCodeFilter, setEmployeeCodeFilter] = useState("");

  // 📄 Aadhaar verification modal state
  const [showAadhaarModal, setShowAadhaarModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  // 🔁 Load employees when page / search change
  useEffect(() => {
    fetchAllEmployeesForAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminPage, adminSearch]);

  // 📞 Phone / WhatsApp helpers
  const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

  const handleCall = (phone: string) => {
    const num = normalizePhone(phone);
    if (!num) return;
    Linking.openURL(`tel:${num}`);
  };

  const handleWhatsApp = (phone: string) => {
    const num = normalizePhone(phone);
    if (!num) return;
    const full = num.startsWith("91") ? num : `91${num}`;
    Linking.openURL(`https://wa.me/${full}`);
  };

  const handleRegister = async () => {
    if (
      !employeeCode.trim() ||
      !name.trim() ||
      !phoneNumber.trim() ||
      !password.trim()
    ) {
      Alert.alert(
        "Missing fields",
        "Please fill all fields to register employee."
      );
      return;
    }

    if (!adminAccessToken) {
      Alert.alert(
        "Not authorized",
        "Admin token missing. Please login again as admin."
      );
      return;
    }

    setSubmitting(true);
    try {
      await registerEmployeeService(
        {
          employeeCode: employeeCode.trim(),
          name: name.trim(),
          phoneNumber: phoneNumber.trim(),
          password: password.trim(),
        },
        adminAccessToken
      );

      Alert.alert("Success", "Employee registered successfully.");

      // form reset
      setEmployeeCode("");
      setName("");
      setPhoneNumber("");
      setPassword("");

      // form close
      setShowRegisterForm(false);

      // list refresh
      fetchAllEmployeesForAdmin();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to register employee.");
    } finally {
      setSubmitting(false);
    }
  };

  // ✏️ Open edit modal
  const openEditModal = (emp: any) => {
    setEditingEmployee({
      id: emp._id,
      name: emp.name,
      phoneNumber: emp.phoneNumber,
      employeeCode: emp.employeeCode,
    });
    setEditName(emp.name);
    setEditPhone(emp.phoneNumber);
    setEditPassword(""); // password optional
    setShowEditModal(true);
  };

  // ✏️ Handle update
  const handleUpdate = async () => {
    if (!editingEmployee) return;
    if (!editName.trim() || !editPhone.trim()) {
      Alert.alert("Error", "Name and phone number are required");
      return;
    }

    setUpdateLoading(true);
    try {
      const updateData: any = {
        name: editName.trim(),
        phoneNumber: editPhone.trim(),
      };
      if (editPassword.trim()) {
        updateData.password = editPassword.trim();
      }

      await updateEmployeeService(
        editingEmployee.id,
        updateData,
        adminAccessToken
      );

      Alert.alert("Success", "Employee updated successfully");
      setShowEditModal(false);
      setEditingEmployee(null);
      fetchAllEmployeesForAdmin();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to update employee");
    } finally {
      setUpdateLoading(false);
    }
  };

  // 📄 Handle Aadhaar click
  const handleAadhaarClick = (emp: any) => {
    if (!emp.aadhaarUrl) {
      Alert.alert("No Aadhaar", "Employee hasn't uploaded Aadhaar yet");
      return;
    }
    setSelectedEmployee(emp);
    setShowAadhaarModal(true);
  };

  // ✅ Handle Aadhaar verify (approve/reject)
  const handleVerify = async (status: "approved" | "rejected") => {
    if (!selectedEmployee) return;

    setVerifying(true);
    try {
      await verifyEmployeeAadhaarService(
        selectedEmployee._id,
        status,
        adminAccessToken
      );

      Alert.alert("Success", `Aadhaar ${status} successfully`);
      setShowAadhaarModal(false);
      setSelectedEmployee(null);
      fetchAllEmployeesForAdmin(); // Refresh list
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  // 🗑️ Handle delete
  const handleDelete = (emp: any) => {
    Alert.alert(
      "Delete Employee",
      `Are you sure you want to delete ${emp.name} (${emp.employeeCode})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEmployeeService(emp._id, adminAccessToken);
              Alert.alert("Success", "Employee deleted successfully");
              fetchAllEmployeesForAdmin();
            } catch (err: any) {
              Alert.alert(
                "Error",
                err?.message || "Failed to delete employee"
              );
            }
          },
        },
      ]
    );
  };

  // 🧮 Client-side filter by employee code
  const filteredEmployees = adminEmployees.filter((emp) => {
    if (!employeeCodeFilter.trim()) return true;
    return emp.employeeCode
      .toLowerCase()
      .includes(employeeCodeFilter.trim().toLowerCase());
  });

  const totalEmployees = filteredEmployees.length;

  // Skeleton loader component
  const SkeletonCard = () => (
    <View className="bg-white rounded-2xl border border-emerald-100 shadow-sm px-3 py-3 mb-2">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <View className="h-4 w-32 bg-slate-200 rounded mb-2" />
          <View className="h-3 w-24 bg-slate-100 rounded" />
        </View>
        <View className="h-6 w-20 bg-slate-200 rounded-full" />
      </View>
      <View className="flex-row justify-between items-center">
        <View className="flex-1 mr-2">
          <View className="h-3 w-28 bg-slate-100 rounded mb-2" />
          <View className="flex-row gap-x-1">
            <View className="h-7 w-7 bg-slate-100 rounded-full" />
            <View className="h-7 w-7 bg-slate-100 rounded-full" />
            <View className="h-7 w-7 bg-slate-100 rounded-full" />
            <View className="h-7 w-7 bg-slate-100 rounded-full" />
          </View>
        </View>
        <View className="h-5 w-20 bg-slate-100 rounded" />
      </View>
    </View>
  );

  return (
    <ScrollView
      className="flex-1 px-6"
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-emerald-900">
            Employees
          </Text>
          <Text className="text-slate-500 mt-1 text-sm">
            Manage employees, register new staff & view Aadhaar status.
          </Text>
        </View>

        {/* 🔘 Add Employee button (form toggle) */}
        <Pressable
          onPress={() => setShowRegisterForm((prev) => !prev)}
          className="flex-row items-center px-3 py-1.5 rounded-full bg-emerald-600"
        >
          <Plus size={16} color="#FFFFFF" />
          <Text className="ml-1 text-[12px] font-semibold text-white">
            {showRegisterForm ? "Close" : "Add"}
          </Text>
        </Pressable>
      </View>

      {/* 🔹 Register Employee Card (collapsible) */}
      {showRegisterForm && (
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-emerald-50">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-sm font-semibold text-emerald-900">
                Register New Employee
              </Text>
              <Text className="text-[11px] text-slate-400 mt-0.5">
                Create a new employee account with code & phone.
              </Text>
            </View>
            <View className="h-8 w-8 rounded-full bg-emerald-50 items-center justify-center">
              <Plus size={18} color="#059669" />
            </View>
          </View>

          <View className="gap-y-2">
            <TextInput
              placeholder="Employee Code (e.g. EMP-001)"
              value={employeeCode}
              onChangeText={setEmployeeCode}
              className="border border-emerald-100 rounded-xl px-3 py-2 text-[12px] text-slate-800"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
            />
            <TextInput
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              className="border border-emerald-100 rounded-xl px-3 py-2 text-[12px] text-slate-800"
              placeholderTextColor="#9CA3AF"
            />
            <TextInput
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              className="border border-emerald-100 rounded-xl px-3 py-2 text-[12px] text-slate-800"
              placeholderTextColor="#9CA3AF"
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="border border-emerald-100 rounded-xl px-3 py-2 text-[12px] text-slate-800"
              placeholderTextColor="#9CA3AF"
            />

            <Pressable
              onPress={handleRegister}
              disabled={submitting}
              className={`mt-2 rounded-xl py-2 items-center justify-center ${submitting ? "bg-emerald-300" : "bg-emerald-600"
                }`}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-[13px] font-semibold">
                  Register Employee
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      )}

      {/* 🔍 Search + Code Filter */}
      <View className="mb-2">
        <TextInput
          placeholder="Search by name / code / phone (server)"
          value={adminSearch}
          onChangeText={setAdminSearch}
          className="bg-white border border-emerald-100 rounded-2xl px-3 py-2 text-[12px] text-slate-800 mb-2"
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          placeholder="Filter by Employee Code (local)"
          value={employeeCodeFilter}
          onChangeText={setEmployeeCodeFilter}
          className="bg-white border border-emerald-100 rounded-2xl px-3 py-2 text-[12px] text-slate-800"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Summary Card */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-emerald-50 flex-row justify-between items-center">
        <View>
          <Text className="text-sm font-semibold text-emerald-900">
            Team Snapshot
          </Text>
          <Text className="text-[11px] text-slate-400 mt-1">
            Showing employees from backend (live data).
          </Text>
          {employeeCodeFilter.trim().length > 0 && (
            <Text className="text-[11px] text-emerald-700 mt-0.5">
              Filter: {employeeCodeFilter.toUpperCase()}
            </Text>
          )}
          {adminError ? (
            <Text className="text-[11px] text-red-500 mt-1">
              {adminError}
            </Text>
          ) : null}
        </View>
        <View className="flex-row items-center gap-x-3">
          <View className="items-center">
            <Text className="text-lg font-semibold text-emerald-700">
              {totalEmployees}
            </Text>
            <Text className="text-[10px] text-slate-400">Employees</Text>
          </View>
          <View className="items-center">
            <View className="h-8 w-8 rounded-full bg-emerald-50 items-center justify-center">
              <Users size={18} color="#059669" />
            </View>
          </View>
        </View>
      </View>

      {/* Loader - Show skeleton cards */}
      {adminLoading && adminEmployees.length === 0 && (
        <View className="gap-y-2 mb-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      )}

      {/* 💳 Employee cards (no cramped table now) */}
      {filteredEmployees.length === 0 && !adminLoading ? (
        <View className="bg-white rounded-2xl border border-emerald-100 shadow-sm px-3 py-4">
          <Text className="text-[12px] text-slate-500">
            No employees found. Try changing search or register a new one.
          </Text>
        </View>
      ) : (
        <View className="gap-y-2">
          {filteredEmployees.map((emp) => (
            <View
              key={emp._id}
              className="bg-white rounded-2xl border border-emerald-100 shadow-sm px-3 py-3"
            >
              {/* Top row: Name + code/date + status */}
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                  <Text className="text-[13px] font-semibold text-slate-800">
                    {emp.name}
                  </Text>
                  <Text className="text-[10px] text-slate-400 mt-0.5">
                    {emp.employeeCode} • {emp.createdAt?.slice(0, 10)}
                  </Text>
                </View>

                <View>
                  <View
                    className={`px-2 py-0.5 rounded-full ${emp.isFilled ? "bg-emerald-50" : "bg-amber-50"
                      }`}
                  >
                    <Text
                      className={`text-[10px] font-medium ${emp.isFilled ? "text-emerald-700" : "text-amber-700"
                        }`}
                    >
                      {emp.isFilled ? "Profile Filled" : "Pending KYC"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Bottom row: Phone + actions + Aadhaar */}
              <View className="flex-row justify-between items-center">
                {/* Phone + actions */}
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="flex-1">
                    <Text className="text-[11px] text-slate-700">
                      {emp.phoneNumber}
                    </Text>
                    <View className="flex-row items-center mt-1 gap-x-1">
                      <Pressable
                        onPress={() => handleCall(emp.phoneNumber)}
                        className="h-7 w-7 rounded-full bg-emerald-50 items-center justify-center"
                      >
                        <Phone size={15} color="#047857" />
                      </Pressable>
                      <Pressable
                        onPress={() => handleWhatsApp(emp.phoneNumber)}
                        className="h-7 w-7 rounded-full bg-green-50 items-center justify-center"
                      >
                        <MessageCircle size={15} color="#16A34A" />
                      </Pressable>
                      <Pressable
                        onPress={() => openEditModal(emp)}
                        className="h-7 w-7 rounded-full bg-blue-50 items-center justify-center"
                      >
                        <Edit size={15} color="#2563EB" />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(emp)}
                        className="h-7 w-7 rounded-full bg-red-50 items-center justify-center"
                      >
                        <Trash2 size={15} color="#DC2626" />
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* Aadhaar status - Clickable */}
                <Pressable
                  onPress={() => handleAadhaarClick(emp)}
                  disabled={!emp.aadhaarUrl}
                  className="items-end"
                >
                  <View className="flex-row items-center">
                    <FileText
                      size={14}
                      color={
                        emp.aadhaarVerified === "approved"
                          ? "#059669"
                          : emp.aadhaarVerified === "rejected"
                            ? "#DC2626"
                            : emp.aadhaarUrl
                              ? "#F59E0B"
                              : "#9CA3AF"
                      }
                    />
                    <Text
                      className={`ml-1 text-[11px] font-semibold ${emp.aadhaarVerified === "approved"
                        ? "text-emerald-700"
                        : emp.aadhaarVerified === "rejected"
                          ? "text-red-700"
                          : emp.aadhaarUrl
                            ? "text-amber-700"
                            : "text-slate-500"
                        }`}
                    >
                      {emp.aadhaarVerified === "approved"
                        ? "✓ Verified"
                        : emp.aadhaarVerified === "rejected"
                          ? "✗ Rejected"
                          : emp.aadhaarUrl
                            ? "⏳ Pending"
                            : "Missing"}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Pagination */}
      {adminTotalPages > 1 && (
        <View className="flex-row items-center justify-between mt-3">
          <Pressable
            onPress={() => adminPage > 1 && setAdminPage(adminPage - 1)}
            disabled={adminPage <= 1}
            className={`px-3 py-1.5 rounded-full border ${adminPage <= 1
              ? "border-slate-200 bg-slate-100"
              : "border-emerald-200 bg-emerald-50"
              }`}
          >
            <Text
              className={`text-[11px] font-medium ${adminPage <= 1 ? "text-slate-400" : "text-emerald-700"
                }`}
            >
              Previous
            </Text>
          </Pressable>

          <Text className="text-[11px] text-slate-500">
            Page {adminPage} of {adminTotalPages}
          </Text>

          <Pressable
            onPress={() =>
              adminPage < adminTotalPages && setAdminPage(adminPage + 1)
            }
            disabled={adminPage >= adminTotalPages}
            className={`px-3 py-1.5 rounded-full border ${adminPage >= adminTotalPages
              ? "border-slate-200 bg-slate-100"
              : "border-emerald-200 bg-emerald-50"
              }`}
          >
            <Text
              className={`text-[11px] font-medium ${adminPage >= adminTotalPages
                ? "text-slate-400"
                : "text-emerald-700"
                }`}
            >
              Next
            </Text>
          </Pressable>
        </View>
      )}

      {/* ✏️ Edit Employee Modal */}
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
                Edit Employee
              </Text>
              <Pressable
                onPress={() => setShowEditModal(false)}
                className="h-8 w-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <Text className="text-slate-600 font-bold">×</Text>
              </Pressable>
            </View>

            {editingEmployee && (
              <View className="gap-y-3">
                <View>
                  <Text className="text-xs text-slate-500 mb-1">
                    Employee Code (read-only)
                  </Text>
                  <View className="bg-slate-100 rounded-xl px-3 py-2">
                    <Text className="text-sm text-slate-600">
                      {editingEmployee.employeeCode}
                    </Text>
                  </View>
                </View>

                <View>
                  <Text className="text-xs text-slate-500 mb-1">Name *</Text>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    className="border border-emerald-100 rounded-xl px-3 py-2 text-sm text-slate-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View>
                  <Text className="text-xs text-slate-500 mb-1">
                    Phone Number *
                  </Text>
                  <TextInput
                    value={editPhone}
                    onChangeText={setEditPhone}
                    keyboardType="phone-pad"
                    className="border border-emerald-100 rounded-xl px-3 py-2 text-sm text-slate-800"
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
                    className="border border-emerald-100 rounded-xl px-3 py-2 text-sm text-slate-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <Pressable
                  onPress={handleUpdate}
                  disabled={updateLoading}
                  className={`mt-2 rounded-xl py-3 items-center justify-center ${updateLoading ? "bg-emerald-300" : "bg-emerald-600"
                    }`}
                >
                  {updateLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white text-sm font-semibold">
                      Update Employee
                    </Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* 📄 Aadhaar Verification Modal */}
      <Modal
        visible={showAadhaarModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAadhaarModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-5 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-slate-800">
                Verify Aadhaar
              </Text>
              <Pressable
                onPress={() => setShowAadhaarModal(false)}
                className="h-8 w-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <X size={18} color="#475569" />
              </Pressable>
            </View>

            {selectedEmployee && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Employee Info */}
                <View className="bg-emerald-50 rounded-xl p-3 mb-4">
                  <Text className="text-sm font-semibold text-slate-800">
                    {selectedEmployee.name}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-1">
                    {selectedEmployee.employeeCode} • {selectedEmployee.phoneNumber}
                  </Text>
                  {selectedEmployee.aadhaarNumber && (
                    <Text className="text-xs text-emerald-700 mt-1">
                      Aadhaar: {selectedEmployee.aadhaarNumber}
                    </Text>
                  )}
                </View>

                {/* Aadhaar Image */}
                {selectedEmployee.aadhaarUrl && (
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-slate-700 mb-2">
                      Uploaded Document:
                    </Text>
                    <Image
                      source={{ uri: selectedEmployee.aadhaarUrl }}
                      className="w-full h-64 rounded-xl bg-slate-100"
                      resizeMode="contain"
                    />
                    <Pressable
                      onPress={() => Linking.openURL(selectedEmployee.aadhaarUrl)}
                      className="mt-2 py-2 px-3 bg-blue-50 rounded-xl"
                    >
                      <Text className="text-blue-700 text-xs text-center font-medium">
                        Open in Browser
                      </Text>
                    </Pressable>
                  </View>
                )}

                {/* Current Status */}
                <View className="mb-4">
                  <Text className="text-xs text-slate-500 mb-1">Current Status:</Text>
                  <View
                    className={`px-3 py-2 rounded-xl ${selectedEmployee.aadhaarVerified === "approved"
                      ? "bg-emerald-50"
                      : selectedEmployee.aadhaarVerified === "rejected"
                        ? "bg-red-50"
                        : "bg-amber-50"
                      }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${selectedEmployee.aadhaarVerified === "approved"
                        ? "text-emerald-700"
                        : selectedEmployee.aadhaarVerified === "rejected"
                          ? "text-red-700"
                          : "text-amber-700"
                        }`}
                    >
                      {selectedEmployee.aadhaarVerified === "approved"
                        ? "✓ Approved"
                        : selectedEmployee.aadhaarVerified === "rejected"
                          ? "✗ Rejected"
                          : "⏳ Pending Verification"}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-x-2">
                  <Pressable
                    onPress={() => handleVerify("approved")}
                    disabled={verifying}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 active:opacity-80"
                  >
                    {verifying ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white text-center font-semibold">
                        ✓ Approve
                      </Text>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() => handleVerify("rejected")}
                    disabled={verifying}
                    className="flex-1 py-3 rounded-xl bg-red-600 active:opacity-80"
                  >
                    {verifying ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white text-center font-semibold">
                        ✗ Reject
                      </Text>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Employees;
