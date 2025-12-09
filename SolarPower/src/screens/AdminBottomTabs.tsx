// src/components/AdminBottomTabs.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Home, Users, UserCircle, ClipboardCheck } from "lucide-react-native";

type AdminBottomTabsProps = {
  onDashboardPress?: () => void;
  onEmployeesPress?: () => void;
  onApprovalsPress?: () => void;   // 👈 NEW
  onAccountPress?: () => void;
};

const ICON_SIZE = 22;

const AdminBottomTabs: React.FC<AdminBottomTabsProps> = ({
  onDashboardPress,
  onEmployeesPress,
  onApprovalsPress,
  onAccountPress,
}) => {
  return (
    <View className="flex-row justify-between pb-2 pt-3 px-4 bg-white border-t border-emerald-100 shadow-md">
      {/* Dashboard */}
      <Pressable onPress={onDashboardPress} className="flex-1 items-center">
        <Home size={ICON_SIZE} color="#059669" />
        <Text className="mt-1 text-[11px] font-medium text-emerald-700">
          Dashboard
        </Text>
      </Pressable>

      {/* Employees */}
      <Pressable onPress={onEmployeesPress} className="flex-1 items-center">
        <Users size={ICON_SIZE} color="#059669" />
        <Text className="mt-1 text-[11px] font-medium text-emerald-700">
          Employees
        </Text>
      </Pressable>

      {/* Approvals – NEW TAB */}
      <Pressable onPress={onApprovalsPress} className="flex-1 items-center">
        <ClipboardCheck size={ICON_SIZE} color="#059669" />
        <Text className="mt-1 text-[11px] font-medium text-emerald-700">
          Approvals
        </Text>
      </Pressable>

      {/* Admin Account */}
      <Pressable onPress={onAccountPress} className="flex-1 items-center">
        <UserCircle size={ICON_SIZE} color="#059669" />
        <Text className="mt-1 text-[11px] font-medium text-emerald-700">
          Account
        </Text>
      </Pressable>
    </View>
  );
};

export default AdminBottomTabs;
