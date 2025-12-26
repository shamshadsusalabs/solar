// src/components/AdminBottomTabs.tsx
import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Home, Users, UserCircle, ClipboardCheck, Building2, Store, Warehouse } from "lucide-react-native";

type AdminBottomTabsProps = {
  onDashboardPress?: () => void;
  onEmployeesPress?: () => void;
  onManagersPress?: () => void;
  onChiefsPress?: () => void;
  onGodownInchargesPress?: () => void;
  onApprovalsPress?: () => void;
  onAccountPress?: () => void;
};

// Smaller icon size for 7 tabs
const ICON_SIZE = 18;

const AdminBottomTabs: React.FC<AdminBottomTabsProps> = ({
  onDashboardPress,
  onEmployeesPress,
  onManagersPress,
  onChiefsPress,
  onGodownInchargesPress,
  onApprovalsPress,
  onAccountPress,
}) => {
  return (
    <View className="bg-white border-t border-emerald-100 shadow-md">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 8 }}
      >
        <View className="flex-row gap-x-1">
          {/* Dashboard */}
          <Pressable onPress={onDashboardPress} className="items-center px-2.5 py-1">
            <Home size={ICON_SIZE} color="#059669" />
            <Text className="mt-0.5 text-[9px] font-medium text-emerald-700">
              Home
            </Text>
          </Pressable>

          {/* Employees */}
          <Pressable onPress={onEmployeesPress} className="items-center px-2.5 py-1">
            <Users size={ICON_SIZE} color="#059669" />
            <Text className="mt-0.5 text-[9px] font-medium text-emerald-700">
              Employees
            </Text>
          </Pressable>

          {/* Managers */}
          <Pressable onPress={onManagersPress} className="items-center px-2.5 py-1">
            <Building2 size={ICON_SIZE} color="#059669" />
            <Text className="mt-0.5 text-[9px] font-medium text-emerald-700">
              Managers
            </Text>
          </Pressable>

          {/* Chiefs */}
          <Pressable onPress={onChiefsPress} className="items-center px-2.5 py-1">
            <Store size={ICON_SIZE} color="#059669" />
            <Text className="mt-0.5 text-[9px] font-medium text-emerald-700">
              Chiefs
            </Text>
          </Pressable>

          {/* Godown Incharges */}
          <Pressable onPress={onGodownInchargesPress} className="items-center px-2.5 py-1">
            <Warehouse size={ICON_SIZE} color="#059669" />
            <Text className="mt-0.5 text-[9px] font-medium text-emerald-700">
              Godown
            </Text>
          </Pressable>

          {/* Approvals */}
          <Pressable onPress={onApprovalsPress} className="items-center px-2.5 py-1">
            <ClipboardCheck size={ICON_SIZE} color="#059669" />
            <Text className="mt-0.5 text-[9px] font-medium text-emerald-700">
              Approvals
            </Text>
          </Pressable>

          {/* Admin Account */}
          <Pressable onPress={onAccountPress} className="items-center px-2.5 py-1">
            <UserCircle size={ICON_SIZE} color="#059669" />
            <Text className="mt-0.5 text-[9px] font-medium text-emerald-700">
              Account
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminBottomTabs;
