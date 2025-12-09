// src/screens/AdminHomeScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SunMedium, Users, FileText, TrendingUp } from "lucide-react-native";

import { getAdminDashboardService } from "../services/dashboardService";
import { useAdminAuthStore } from "../stores/adminAuthStore";
import type {
  DashboardCardStats,
  DashboardDailyInstall,
  DashboardEmployeeStat,
} from "../services/dashboardService";

const AdminHomeScreen: React.FC = () => {
  const [cards, setCards] = useState<DashboardCardStats | null>(null);
  const [dailyInstalls, setDailyInstalls] = useState<DashboardDailyInstall[]>(
    []
  );
  const [employeeStats, setEmployeeStats] = useState<DashboardEmployeeStat[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const adminTokens = useAdminAuthStore((s) => s.tokens);

  const fetchDashboard = async () => {
    if (!adminTokens?.accessToken) {
      setError("Admin not logged in");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await getAdminDashboardService(adminTokens.accessToken);

      setCards(res.data.cards);
      setDailyInstalls(res.data.dailyInstalls);
      setEmployeeStats(res.data.employees);
    } catch (err: any) {
      console.log("fetchDashboard error:", err);
      setError(err?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // agar cards null hai to default 0 show karenge
  const totalInstallations = cards?.totalInstallations ?? 0;
  const activeEmployees = cards?.activeEmployees ?? 0;
  const totalFormsSubmitted = cards?.totalFormsSubmitted ?? 0;

  return (
    <ScrollView
      className="flex-1 px-6 pt-6 bg-emerald-50"
      contentContainerStyle={{ paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-emerald-900">
          Admin Dashboard
        </Text>
        <Text className="text-slate-500 mt-1 text-sm">
          Live overview of solar installations, employees & forms.
        </Text>
      </View>

      {/* Error */}
      {error && (
        <View className="mb-3 rounded-2xl bg-red-50 px-3 py-2 border border-red-100">
          <Text className="text-[11px] text-red-600">{error}</Text>
        </View>
      )}

      {/* Loading state */}
      {loading && !cards && (
        <View className="mt-8 items-center">
          <ActivityIndicator size="small" color="#059669" />
          <Text className="mt-2 text-[12px] text-slate-500">
            Loading dashboard...
          </Text>
        </View>
      )}

      {/* Top stats cards */}
      <View className="flex-row flex-wrap -mx-1 mb-4">
        {/* Total Installations */}
        <View className="w-1/2 px-1 mb-3">
          <View className="bg-white rounded-2xl p-3.5 shadow-sm border border-emerald-50">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[11px] text-slate-500 font-medium">
                Total Installations
              </Text>
              <View className="h-7 w-7 rounded-full bg-emerald-50 items-center justify-center">
                <SunMedium size={16} color="#059669" />
              </View>
            </View>
            <Text className="text-xl font-semibold text-emerald-900">
              {totalInstallations}
            </Text>
            <Text className="text-[11px] text-slate-400 mt-1">
              Completed this year
            </Text>
          </View>
        </View>

        {/* Active Employees */}
        <View className="w-1/2 px-1 mb-3">
          <View className="bg-white rounded-2xl p-3.5 shadow-sm border border-emerald-50">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[11px] text-slate-500 font-medium">
                Active Employees
              </Text>
              <View className="h-7 w-7 rounded-full bg-emerald-50 items-center justify-center">
                <Users size={16} color="#059669" />
              </View>
            </View>
            <Text className="text-xl font-semibold text-emerald-900">
              {activeEmployees}
            </Text>
            <Text className="text-[11px] text-slate-400 mt-1">
              On-site & field
            </Text>
          </View>
        </View>

        {/* Forms Submitted */}
        <View className="w-1/2 px-1 mb-3">
          <View className="bg-white rounded-2xl p-3.5 shadow-sm border border-emerald-50">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[11px] text-slate-500 font-medium">
                Forms Submitted
              </Text>
              <View className="h-7 w-7 rounded-full bg-emerald-50 items-center justify-center">
                <FileText size={16} color="#059669" />
              </View>
            </View>
            <Text className="text-xl font-semibold text-emerald-900">
              {totalFormsSubmitted}
            </Text>
            <Text className="text-[11px] text-slate-400 mt-1">
              Site survey & reports
            </Text>
          </View>
        </View>
      </View>

      {/* Mini graph card */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-emerald-50">
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="text-sm font-semibold text-emerald-900">
              Weekly Installations
            </Text>
            <Text className="text-[11px] text-slate-400">
              Number of sites installed per day
            </Text>
          </View>
          <View className="flex-row items-center">
            <TrendingUp size={18} color="#059669" />
            {/* abhi ke liye static text, baad me % change bhi API se nikal sakte ho */}
            <Text className="ml-1 text-[11px] text-emerald-600 font-medium">
              Last 7 days
            </Text>
          </View>
        </View>

        {/* Simple bar chart */}
        <View className="h-36 flex-row items-end justify-between mt-2">
          {dailyInstalls.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-[11px] text-slate-400">
                No installations in last 7 days
              </Text>
            </View>
          ) : (
            dailyInstalls.map((d) => (
              <View key={d.date} className="items-center flex-1">
                <View
                  className="w-4 rounded-full bg-emerald-400/80"
                  style={{
                    height: 10 + d.count * 10,
                  }}
                />
                <Text className="text-[10px] text-slate-500 mt-1">
                  {d.day}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Employee stats / list */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-emerald-50">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-semibold text-emerald-900">
            Employee Form Activity
          </Text>
          <Text className="text-[11px] text-emerald-600 font-medium">
            Top performers
          </Text>
        </View>

        {employeeStats.length === 0 ? (
          <Text className="text-[11px] text-slate-400">
            No employee activity yet.
          </Text>
        ) : (
          employeeStats.map((emp, index) => (
            <View
              key={emp.employeeId}
              className={`flex-row items-center justify-between py-2 ${
                index !== employeeStats.length - 1
                  ? "border-b border-emerald-50"
                  : ""
              }`}
            >
              <View className="flex-1">
                <Text className="text-[12px] font-semibold text-slate-800">
                  {emp.name}
                </Text>
                <Text className="text-[11px] text-slate-400">
                  {emp.employeeCode}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-[12px] font-semibold text-emerald-700">
                  {emp.forms} forms
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default AdminHomeScreen;
