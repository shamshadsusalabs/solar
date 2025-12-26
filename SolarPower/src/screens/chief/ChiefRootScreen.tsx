// src/screens/chief/ChiefRootScreen.tsx
import React, { useState } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChiefDashboard from "./ChiefDashboard";
import ChiefApprovals from "./ChiefApprovals";
import ChiefAccount from "./ChiefAccount";
import ChiefBottomTabs from "./ChiefBottomTabs";

type TabKey = "dashboard" | "approvals" | "account";

const ChiefRootScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
    const insets = useSafeAreaInsets();

    const renderContent = () => {
        switch (activeTab) {
            case "approvals":
                return <ChiefApprovals />;

            case "account":
                return <ChiefAccount />;

            case "dashboard":
            default:
                return <ChiefDashboard />;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-emerald-50">
            <StatusBar barStyle="dark-content" />
            <View className="flex-1">
                <View className="flex-1">{renderContent()}</View>

                {/* Bottom padding to prevent overlap with navigation buttons */}
                <View style={{ paddingBottom: insets.bottom }}>
                    <ChiefBottomTabs
                        onDashboardPress={() => setActiveTab("dashboard")}
                        onApprovalsPress={() => setActiveTab("approvals")}
                        onAccountPress={() => setActiveTab("account")}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

export default ChiefRootScreen;
