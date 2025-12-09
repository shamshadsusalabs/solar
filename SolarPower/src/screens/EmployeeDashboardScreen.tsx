import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SunMedium, FileText, Users, IndianRupee } from "lucide-react-native";

import { useEmployeeAuthStore } from "../stores/employeeAuthStore";
import {
  getEmployeeDashboardService,
  EmployeeDashboardTotals,
  EmployeeStatusSummaryItem,
  EmployeeRecentLead,
} from "../services/employeeDashboardService";

const EmployeeDashboardScreen: React.FC = () => {
  const { tokens, employee } = useEmployeeAuthStore();
  const [totals, setTotals] = useState<EmployeeDashboardTotals | null>(null);
  const [statusSummary, setStatusSummary] = useState<
    EmployeeStatusSummaryItem[]
  >([]);
  const [recentLeads, setRecentLeads] = useState<EmployeeRecentLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    if (!tokens?.accessToken) {
      setError("Employee not logged in");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await getEmployeeDashboardService(tokens.accessToken);
      setTotals(res.data.totals);
      setStatusSummary(res.data.statusSummary);
      setRecentLeads(res.data.recentLeads);
    } catch (err: any) {
      console.log("employee dashboard error:", err);
      setError(err?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatStatus = (status: string) =>
    status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <ScrollView
      className="flex-1 bg-emerald-50 px-4 pt-4"
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="mb-3">
        <Text className="text-xl font-bold text-emerald-900">
          Hi, {employee?.name || "Employee"}
        </Text>
        <Text className="text-[12px] text-slate-500 mt-1">
          Yeh tumhara sales dashboard hai – saare leads ka summary yahan milega.
        </Text>
      </View>

      {/* Error */}
      {error && (
        <View className="mb-3 rounded-2xl bg-red-50 px-3 py-2 border border-red-100">
          <Text className="text-[11px] text-red-600">{error}</Text>
        </View>
      )}

      {/* Loader */}
      {loading && !totals && (
        <View className="mt-6 items-center">
          <ActivityIndicator size="small" color="#059669" />
          <Text className="mt-2 text-[12px] text-slate-500">
            Loading dashboard...
          </Text>
        </View>
      )}

      {/* Top Cards */}
      <View className="flex-row flex-wrap -mx-1 mb-4 mt-1">
        {/* Total Leads */}
        <View className="w-1/2 px-1 mb-3">
          <View className="bg-white rounded-2xl p-3.5 shadow-sm border border-emerald-50">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-[11px] text-slate-500 font-medium">
                Total Leads
              </Text>
              <View className="h-7 w-7 rounded-full bg-emerald-50 items-center justify-center">
                <SunMedium size={16} color="#059669" />
              </View>
            </View>
            <Text className="text-xl font-semibold text-emerald-900">
              {totals?.totalLeads ?? 0}
            </Text>
            <Text className="text-[11px] text-slate-400 mt-1">
              Tumne jitne leads banaye
            </Text>
          </View>
        </View>

        {/* Active Leads */}
        <View className="w-1/2 px-1 mb-3">
          <View className="bg-white rounded-2xl p-3.5 shadow-sm border border-emerald-50">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-[11px] text-slate-500 font-medium">
                Active Leads
              </Text>
              <View className="h-7 w-7 rounded-full bg-emerald-50 items-center justify-center">
                <Users size={16} color="#059669" />
              </View>
            </View>
            <Text className="text-xl font-semibold text-emerald-900">
              {totals?.activeLeads ?? 0}
            </Text>
            <Text className="text-[11px] text-slate-400 mt-1">
              Jo abhi work in progress hai
            </Text>
          </View>
        </View>

        {/* Closed Leads */}
        <View className="w-1/2 px-1 mb-3">
          <View className="bg-white rounded-2xl p-3.5 shadow-sm border border-emerald-50">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-[11px] text-slate-500 font-medium">
                Closed Leads
              </Text>
              <View className="h-7 w-7 rounded-full bg-emerald-50 items-center justify-center">
                <FileText size={16} color="#059669" />
              </View>
            </View>
            <Text className="text-xl font-semibold text-emerald-900">
              {totals?.closedLeads ?? 0}
            </Text>
            <Text className="text-[11px] text-slate-400 mt-1">
              Jo close ho chuke hain
            </Text>
          </View>
        </View>

        {/* Total Amount */}
        <View className="w-1/2 px-1 mb-3">
          <View className="bg-white rounded-2xl p-3.5 shadow-sm border border-emerald-50">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-[11px] text-slate-500 font-medium">
                Total Amount
              </Text>
              <View className="h-7 w-7 rounded-full bg-emerald-50 items-center justify-center">
                <IndianRupee size={16} color="#059669" />
              </View>
            </View>
            <Text className="text-xl font-semibold text-emerald-900">
              ₹ {totals?.totalTropositeAmount ?? 0}
            </Text>
            <Text className="text-[11px] text-slate-400 mt-1">
              Sabhi leads ka combined amount
            </Text>
          </View>
        </View>
      </View>

      {/* Status Summary */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-emerald-50">
        <Text className="text-sm font-semibold text-emerald-900 mb-2">
          Status Summary
        </Text>
        {statusSummary.length === 0 ? (
          <Text className="text-[11px] text-slate-400">
            Abhi tak koi leads nahi hain.
          </Text>
        ) : (
          statusSummary.map((item) => (
            <View
              key={item.status}
              className="flex-row items-center justify-between py-1.5"
            >
              <Text className="text-[11px] text-slate-600 flex-1">
                {formatStatus(item.status)}
              </Text>
              <Text className="text-[11px] font-semibold text-emerald-700">
                {item.count}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Recent Leads */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-emerald-50">
        <Text className="text-sm font-semibold text-emerald-900 mb-2">
          Recent Leads
        </Text>

        {recentLeads.length === 0 ? (
          <Text className="text-[11px] text-slate-400">
            Abhi tak koi recent lead nahi hai.
          </Text>
        ) : (
          recentLeads.map((lead, index) => (
            <View
              key={index}
              className={`py-2 ${
                index !== recentLeads.length - 1
                  ? "border-b border-emerald-50"
                  : ""
              }`}
            >
              <View className="flex-row justify-between mb-1">
                <Text className="text-[12px] font-semibold text-slate-800">
                  {lead.customerName}
                </Text>
                <Text className="text-[10px] text-slate-400">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text className="text-[11px] text-slate-500">
                {lead.contactNumber}
              </Text>
              <Text
                className="text-[10px] text-slate-400 mt-0.5"
                numberOfLines={1}
              >
                {lead.addressText}
              </Text>
              <Text className="text-[10px] text-emerald-700 mt-0.5">
                {formatStatus(lead.status)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default EmployeeDashboardScreen;
