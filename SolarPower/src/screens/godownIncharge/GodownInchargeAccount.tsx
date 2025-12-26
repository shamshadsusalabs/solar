// src/screens/godownIncharge/GodownInchargeAccount.tsx
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Warehouse, Mail, Phone, LogOut } from "lucide-react-native";
import { useGodownInchargeAuthStore } from "../../stores/godownInchargeAuthStore";

const GodownInchargeAccount: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { godownIncharge, logoutGodownIncharge } = useGodownInchargeAuthStore();

    const handleLogout = () => {
        logoutGodownIncharge();
        // App.tsx will handle redirect to login
    };

    return (
        <ScrollView
            className="flex-1 bg-emerald-50 px-6"
            contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 20 }}
        >
            {/* Header */}
            <View className="mb-6">
                <Text className="text-2xl font-bold text-emerald-900">
                    Godown Incharge Account
                </Text>
                <Text className="text-slate-500 mt-1 text-sm">
                    Manage your profile and warehouse settings
                </Text>
            </View>

            {/* Profile Card */}
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 mb-4">
                <View className="items-center mb-4">
                    <View className="h-20 w-20 rounded-full bg-emerald-100 items-center justify-center mb-3">
                        <Warehouse size={40} color="#059669" />
                    </View>
                    <Text className="text-lg font-bold text-slate-800">
                        {godownIncharge?.name || "Godown Incharge Name"}
                    </Text>
                    <View className="bg-emerald-100 px-3 py-1 rounded-full mt-2">
                        <Text className="text-xs font-medium text-emerald-700">
                            Godown Incharge
                        </Text>
                    </View>
                </View>

                <View className="gap-y-3">
                    <View className="flex-row items-center gap-x-3">
                        <View className="h-10 w-10 rounded-full bg-blue-50 items-center justify-center">
                            <Mail size={18} color="#2563EB" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs text-slate-500">Email</Text>
                            <Text className="text-sm text-slate-800 font-medium">
                                {godownIncharge?.email || "godown@example.com"}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-x-3">
                        <View className="h-10 w-10 rounded-full bg-emerald-50 items-center justify-center">
                            <Phone size={18} color="#059669" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs text-slate-500">Phone Number</Text>
                            <Text className="text-sm text-slate-800 font-medium">
                                {godownIncharge?.phoneNumber || "+91 98765 43210"}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Logout Button */}
            <Pressable
                onPress={handleLogout}
                className="bg-red-500 rounded-2xl py-3.5 items-center shadow-md active:opacity-80 mb-6"
            >
                <View className="flex-row items-center gap-x-2">
                    <LogOut size={20} color="#FFFFFF" />
                    <Text className="text-white font-semibold text-base">
                        Logout
                    </Text>
                </View>
            </Pressable>
        </ScrollView>
    );
};

export default GodownInchargeAccount;
