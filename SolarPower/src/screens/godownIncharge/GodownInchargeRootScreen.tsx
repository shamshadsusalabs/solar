// src/screens/godownIncharge/GodownInchargeRootScreen.tsx
import React, { useState } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GodownInchargeDashboard from "./GodownInchargeDashboard";
import GodownInchargeApprovals from "./GodownInchargeApprovals";
import GodownInchargeAccount from "./GodownInchargeAccount";
import GodownInchargeBottomTabs from "./GodownInchargeBottomTabs";

type TabKey = "dashboard" | "approvals" | "account";

const GodownInchargeRootScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
    const insets = useSafeAreaInsets();

    const renderContent = () => {
        switch (activeTab) {
            case "approvals":
                return <GodownInchargeApprovals />;

            case "account":
                return <GodownInchargeAccount />;

            case "dashboard":
            default:
                return <GodownInchargeDashboard />;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-emerald-50">
            <StatusBar barStyle="dark-content" />
            <View className="flex-1">
                <View className="flex-1">{renderContent()}</View>

                {/* Bottom padding to prevent overlap with navigation buttons */}
                <View style={{ paddingBottom: insets.bottom }}>
                    <GodownInchargeBottomTabs
                        onDashboardPress={() => setActiveTab("dashboard")}
                        onApprovalsPress={() => setActiveTab("approvals")}
                        onAccountPress={() => setActiveTab("account")}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

export default GodownInchargeRootScreen;
