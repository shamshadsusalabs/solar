// src/screens/Employees.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import {
  Users,
  FileText,
  Plus,
  Phone,
  MessageCircle,
} from "lucide-react-native";

import { useEmployeeAuthStore } from "../stores/employeeAuthStore";
import { useAdminAuthStore } from "../stores/adminAuthStore";
import { registerEmployeeService } from "../services/employeeAuthService";

const Employees: React.FC = () => {
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

  // 🎯 Local filter by employee code
  const [employeeCodeFilter, setEmployeeCodeFilter] = useState("");

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

  // 🧮 Client-side filter by employee code
  const filteredEmployees = adminEmployees.filter((emp) => {
    if (!employeeCodeFilter.trim()) return true;
    return emp.employeeCode
      .toLowerCase()
      .includes(employeeCodeFilter.trim().toLowerCase());
  });

  const totalEmployees = filteredEmployees.length;

  return (
    <ScrollView
      className="flex-1 px-6 pt-6"
      contentContainerStyle={{ paddingBottom: 16 }}
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
              className={`mt-2 rounded-xl py-2 items-center justify-center ${
                submitting ? "bg-emerald-300" : "bg-emerald-600"
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

      {/* Loader */}
      {adminLoading && (
        <View className="mb-3">
          <ActivityIndicator />
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
                    className={`px-2 py-0.5 rounded-full ${
                      emp.isFilled ? "bg-emerald-50" : "bg-amber-50"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-medium ${
                        emp.isFilled ? "text-emerald-700" : "text-amber-700"
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
                    <View className="flex-row items-center mt-1">
                      <Pressable
                        onPress={() => handleCall(emp.phoneNumber)}
                        className="mr-2 h-7 w-7 rounded-full bg-emerald-50 items-center justify-center"
                      >
                        <Phone size={15} color="#047857" />
                      </Pressable>
                      <Pressable
                        onPress={() => handleWhatsApp(emp.phoneNumber)}
                        className="h-7 w-7 rounded-full bg-green-50 items-center justify-center"
                      >
                        <MessageCircle size={15} color="#16A34A" />
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* Aadhaar status */}
                <View className="items-end">
                  <View className="flex-row items-center">
                    <FileText
                      size={14}
                      color={emp.aadhaarUrl ? "#059669" : "#9CA3AF"}
                    />
                    <Text
                      className={`ml-1 text-[11px] font-semibold ${
                        emp.aadhaarUrl ? "text-emerald-700" : "text-slate-500"
                      }`}
                    >
                      {emp.aadhaarUrl ? "Aadhaar Uploaded" : "Aadhaar Missing"}
                    </Text>
                  </View>
                </View>
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
            className={`px-3 py-1.5 rounded-full border ${
              adminPage <= 1
                ? "border-slate-200 bg-slate-100"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <Text
              className={`text-[11px] font-medium ${
                adminPage <= 1 ? "text-slate-400" : "text-emerald-700"
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
            className={`px-3 py-1.5 rounded-full border ${
              adminPage >= adminTotalPages
                ? "border-slate-200 bg-slate-100"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <Text
              className={`text-[11px] font-medium ${
                adminPage >= adminTotalPages
                  ? "text-slate-400"
                  : "text-emerald-700"
              }`}
            >
              Next
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
};

export default Employees;
