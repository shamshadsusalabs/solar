// src/auth/EmployeeLoginForm.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useEmployeeAuthStore } from "../stores/employeeAuthStore";

const EmployeeLoginForm: React.FC = () => {
  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const { loginEmployee, loading, error } = useEmployeeAuthStore();

  const onLogin = async () => {
    setLocalError(null);

    if (!employeeCode || !password) {
      return setLocalError("Please enter employee code & password.");
    }

    await loginEmployee(employeeCode.trim(), password);
    // App.tsx role se redirect karega EmployeeRootScreen pe
  };

  const finalError = localError || error;

  return (
    <>
      {/* Employee Code */}
      <View className="mb-4">
        <Text className="text-slate-700 mb-1 font-medium text-sm">
          Employee Code
        </Text>
        <View className="flex-row items-center rounded-2xl border border-emerald-100 bg-emerald-50/60 px-3">
          <TextInput
            value={employeeCode}
            onChangeText={setEmployeeCode}
            placeholder="EMP-101 / EMP202"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            className="flex-1 py-3 text-slate-900 text-sm"
          />
        </View>
      </View>

      {/* Password */}
      <View className="mb-3">
        <Text className="text-slate-700 mb-1 font-medium text-sm">
          Password
        </Text>
        <View className="flex-row items-center rounded-2xl border border-emerald-100 bg-emerald-50/60 px-3">
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            className="flex-1 py-3 text-slate-900 text-sm"
          />
        </View>
      </View>

      {/* Error */}
      {finalError && (
        <View className="mb-3">
          <Text className="text-[11px] text-red-500">{finalError}</Text>
        </View>
      )}

      {/* Login button */}
      <Pressable
        onPress={onLogin}
        disabled={loading}
        className={`rounded-2xl py-3.5 items-center active:opacity-85 shadow-md shadow-emerald-300 ${loading ? "bg-emerald-300" : "bg-emerald-500"
          }`}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-white font-semibold text-base">
            Login as Employee
          </Text>
        )}
      </Pressable>

      {/* Helper */}
      <View className="mt-4 items-center">
        <Text className="text-[11px] text-slate-400">
          Secure access • Encrypted connection • Solar staff only
        </Text>
      </View>
    </>
  );
};

export default EmployeeLoginForm;
