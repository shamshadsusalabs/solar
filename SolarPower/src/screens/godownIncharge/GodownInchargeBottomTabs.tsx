// src/screens/godownIncharge/GodownInchargeBottomTabs.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { LayoutDashboard, ClipboardCheck, UserCircle } from "lucide-react-native";

type GodownInchargeBottomTabsProps = {
    onDashboardPress?: () => void;
    onApprovalsPress?: () => void;
    onAccountPress?: () => void;
};

const ICON_SIZE = 22;

const GodownInchargeBottomTabs: React.FC<GodownInchargeBottomTabsProps> = ({
    onDashboardPress,
    onApprovalsPress,
    onAccountPress,
}) => {
    return (
        <View className="flex-row justify-between pb-2 pt-3 px-4 bg-white border-t border-emerald-100 shadow-md">
            {/* Dashboard */}
            <Pressable onPress={onDashboardPress} className="flex-1 items-center">
                <LayoutDashboard size={ICON_SIZE} color="#059669" />
                <Text className="mt-1 text-[11px] font-medium text-emerald-700">
                    Dashboard
                </Text>
            </Pressable>

            {/* Approvals */}
            <Pressable onPress={onApprovalsPress} className="flex-1 items-center">
                <ClipboardCheck size={ICON_SIZE} color="#059669" />
                <Text className="mt-1 text-[11px] font-medium text-emerald-700">
                    Approvals
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

export default GodownInchargeBottomTabs;
