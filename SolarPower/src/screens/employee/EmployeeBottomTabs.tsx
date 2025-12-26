// src/screens/EmployeeBottomTabs.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import {
  Home,
  FilePlus2,
  ClipboardList,
  UserCircle,
} from "lucide-react-native";

type EmployeeBottomTabsProps = {
  onDashboardPress?: () => void;
  onApplyPress?: () => void;
  onAppliedPress?: () => void;
  onAccountPress?: () => void;
};

const ICON_SIZE = 22;

const EmployeeBottomTabs: React.FC<EmployeeBottomTabsProps> = ({
  onDashboardPress,
  onApplyPress,
  onAppliedPress,
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

      {/* Apply */}
      <Pressable onPress={onApplyPress} className="flex-1 items-center">
        <FilePlus2 size={ICON_SIZE} color="#059669" />
        <Text className="mt-1 text-[11px] font-medium text-emerald-700">
          Apply
        </Text>
      </Pressable>

      {/* Applied */}
      <Pressable onPress={onAppliedPress} className="flex-1 items-center">
        <ClipboardList size={ICON_SIZE} color="#059669" />
        <Text className="mt-1 text-[11px] font-medium text-emerald-700">
          Applied
        </Text>
      </Pressable>

      {/* Account */}
      <Pressable onPress={onAccountPress} className="flex-1 items-center">
        <UserCircle size={ICON_SIZE} color="#059669" />
        <Text className="mt-1 text-[11px] font-medium text-emerald-700">
          Account
        </Text>
      </Pressable>
    </View>
  );
};

export default EmployeeBottomTabs;
