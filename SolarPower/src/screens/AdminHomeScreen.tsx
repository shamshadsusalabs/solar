// src/screens/AdminHomeScreen.tsx
import React, { useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Users,
  Building2,
  Store,
  Warehouse,
  FileText,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react-native";

import { useAdminAuthStore } from "../stores/adminAuthStore";
import { useDashboardStore } from "../stores/dashboardStore";

const AdminHomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const adminTokens = useAdminAuthStore((s) => s.tokens);

  // Dashboard data from store (with caching)
  const {
    cards,
    statusBreakdown,
    recentLeads,
    topEmployees,
    loading,
    error,
    initDashboardFromStorage,
    fetchDashboard,
  } = useDashboardStore();

  // Init from storage and fetch fresh data
  useEffect(() => {
    initDashboardFromStorage(); // Load cached data immediately
  }, []);

  useEffect(() => {
    if (adminTokens?.accessToken) {
      fetchDashboard(adminTokens.accessToken); // Fetch fresh data
    }
  }, [adminTokens?.accessToken]);

  const formatStatus = (status: string) =>
    status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <ScrollView
      className="flex-1 px-6 bg-emerald-50"
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-emerald-900">
          Admin Dashboard
        </Text>
        <Text className="text-slate-500 mt-1 text-sm">
          Live overview of team, leads & system activity.
        </Text>
      </View>

      {/* Error */}
      {error && (
        <View className="mb-3 rounded-2xl bg-red-50 px-3 py-2 border border-red-100">
          <Text className="text-[11px] text-red-600">{error}</Text>
        </View>
      )}

      {/* User Type Stats - 4 cards */}
      <View className="mb-3">
        <Text className="text-xs font-semibold text-slate-600 mb-2 ml-1">
          Team Overview
        </Text>
        <View className="flex-row flex-wrap -mx-1">
          <View className="w-1/2 px-1 mb-2">
            <View className="bg-white rounded-xl p-3 shadow-sm border border-emerald-50">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-[10px] text-slate-500 font-medium">
                  Employees
                </Text>
                <View className="h-6 w-6 rounded-full bg-blue-50 items-center justify-center">
                  <Users size={13} color="#3B82F6" />
                </View>
              </View>
              {loading && !cards ? (
                <View className="h-7 w-16 bg-slate-100 rounded-md" />
              ) : (
                <Text className="text-lg font-bold text-slate-900">
                  {cards?.totalEmployees ?? 0}
                </Text>
              )}
            </View>
          </View>

          <View className="w-1/2 px-1 mb-2">
            <View className="bg-white rounded-xl p-3 shadow-sm border border-emerald-50">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-[10px] text-slate-500 font-medium">
                  Managers
                </Text>
                <View className="h-6 w-6 rounded-full bg-emerald-50 items-center justify-center">
                  <Building2 size={13} color="#059669" />
                </View>
              </View>
              {loading && !cards ? (
                <View className="h-7 w-16 bg-slate-100 rounded-md" />
              ) : (
                <Text className="text-lg font-bold text-slate-900">
                  {cards?.totalManagers ?? 0}
                </Text>
              )}
            </View>
          </View>

          <View className="w-1/2 px-1 mb-2">
            <View className="bg-white rounded-xl p-3 shadow-sm border border-emerald-50">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-[10px] text-slate-500 font-medium">
                  Chiefs
                </Text>
                <View className="h-6 w-6 rounded-full bg-purple-50 items-center justify-center">
                  <Store size={13} color="#9333EA" />
                </View>
              </View>
              {loading && !cards ? (
                <View className="h-7 w-16 bg-slate-100 rounded-md" />
              ) : (
                <Text className="text-lg font-bold text-slate-900">
                  {cards?.totalChiefs ?? 0}
                </Text>
              )}
            </View>
          </View>

          <View className="w-1/2 px-1 mb-2">
            <View className="bg-white rounded-xl p-3 shadow-sm border border-emerald-50">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-[10px] text-slate-500 font-medium">
                  Godown
                </Text>
                <View className="h-6 w-6 rounded-full bg-orange-50 items-center justify-center">
                  <Warehouse size={13} color="#EA580C" />
                </View>
              </View>
              {loading && !cards ? (
                <View className="h-7 w-16 bg-slate-100 rounded-md" />
              ) : (
                <Text className="text-lg font-bold text-slate-900">
                  {cards?.totalGodownIncharges ?? 0}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Lead Summary - 3 cards */}
      <View className="mb-3">
        <Text className="text-xs font-semibold text-slate-600 mb-2 ml-1">
          Lead Summary
        </Text>
        <View className="flex-row flex-wrap -mx-1">
          <View className="w-1/3 px-1 mb-2">
            <View className="bg-white rounded-xl p-2.5 shadow-sm border border-emerald-50 items-center">
              <FileText size={16} color="#059669" />
              {loading && !cards ? (
                <View className="h-6 w-12 bg-slate-100 rounded-md mt-1" />
              ) : (
                <Text className="text-base font-bold text-slate-900 mt-1">
                  {cards?.totalLeads ?? 0}
                </Text>
              )}
              <Text className="text-[9px] text-slate-500 text-center">
                Total
              </Text>
            </View>
          </View>

          <View className="w-1/3 px-1 mb-2">
            <View className="bg-white rounded-xl p-2.5 shadow-sm border border-emerald-50 items-center">
              <Clock size={16} color="#F59E0B" />
              {loading && !cards ? (
                <View className="h-6 w-12 bg-slate-100 rounded-md mt-1" />
              ) : (
                <Text className="text-base font-bold text-slate-900 mt-1">
                  {cards?.activeLeads ?? 0}
                </Text>
              )}
              <Text className="text-[9px] text-slate-500 text-center">
                Active
              </Text>
            </View>
          </View>

          <View className="w-1/3 px-1 mb-2">
            <View className="bg-white rounded-xl p-2.5 shadow-sm border border-emerald-50 items-center">
              <CheckCircle2 size={16} color="#10B981" />
              {loading && !cards ? (
                <View className="h-6 w-12 bg-slate-100 rounded-md mt-1" />
              ) : (
                <Text className="text-base font-bold text-slate-900 mt-1">
                  {cards?.completedLeads ?? 0}
                </Text>
              )}
              <Text className="text-[9px] text-slate-500 text-center">
                Paid
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Lead Status Breakdown */}
      <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-emerald-50">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-semibold text-emerald-900">
            Lead Status Breakdown
          </Text>
          <TrendingUp size={16} color="#059669" />
        </View>

        {statusBreakdown.length === 0 ? (
          <Text className="text-[11px] text-slate-400">No leads yet.</Text>
        ) : (
          statusBreakdown.map((item, idx) => (
            <View
              key={item.status}
              className={`flex-row items-center justify-between py-2 ${idx !== statusBreakdown.length - 1
                ? "border-b border-emerald-50"
                : ""
                }`}
            >
              <Text className="text-[11px] text-slate-700 flex-1">
                {formatStatus(item.status)}
              </Text>
              <View className="flex-row items-center">
                <View className="h-5 px-2 rounded-full bg-emerald-50 items-center justify-center">
                  <Text className="text-[10px] font-semibold text-emerald-700">
                    {item.count}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Top Employees */}
      <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-emerald-50">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-semibold text-emerald-900">
            Top Performers
          </Text>
          <Text className="text-[10px] text-emerald-600 font-medium">
            By Lead Count
          </Text>
        </View>

        {topEmployees.length === 0 ? (
          <Text className="text-[11px] text-slate-400">
            No employee activity yet.
          </Text>
        ) : (
          topEmployees.map((emp, idx) => (
            <View
              key={emp.employeeId}
              className={`flex-row items-center justify-between py-2 ${idx !== topEmployees.length - 1
                ? "border-b border-emerald-50"
                : ""
                }`}
            >
              <View className="flex-1">
                <Text className="text-[12px] font-semibold text-slate-800">
                  {emp.name}
                </Text>
                <Text className="text-[10px] text-slate-400">
                  {emp.employeeCode}
                </Text>
              </View>
              <Text className="text-[11px] font-semibold text-emerald-700">
                {emp.leadCount} leads
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Recent Leads */}
      <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-emerald-50">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-semibold text-emerald-900">
            Recent Activity
          </Text>
          <Text className="text-[10px] text-emerald-600 font-medium">
            Last 10 Leads
          </Text>
        </View>

        {recentLeads.length === 0 ? (
          <Text className="text-[11px] text-slate-400">No recent leads.</Text>
        ) : (
          recentLeads.map((lead, idx) => (
            <View
              key={lead._id}
              className={`py-2 ${idx !== recentLeads.length - 1
                ? "border-b border-emerald-50"
                : ""
                }`}
            >
              <View className="flex-row items-start justify-between mb-1">
                <Text
                  className="text-[12px] font-semibold text-slate-800 flex-1"
                  numberOfLines={1}
                >
                  {lead.customerName}
                </Text>
                <Text className="text-[10px] text-slate-400 ml-2">
                  {formatDate(lead.createdAt)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-[10px] text-slate-500">
                  By {lead.salesManName}
                </Text>
                <View className="px-2 py-0.5 rounded-full bg-emerald-50">
                  <Text className="text-[9px] text-emerald-700 font-medium">
                    {formatStatus(lead.status)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default AdminHomeScreen;
