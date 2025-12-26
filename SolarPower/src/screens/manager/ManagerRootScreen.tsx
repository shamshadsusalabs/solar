// src/screens/manager/ManagerRootScreen.tsx
import React, { useState } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ManagerDashboard from "./ManagerDashboard";
import ManagerApprovals from "./ManagerApprovals";
import ManagerAccount from "./ManagerAccount";
import ManagerBottomTabs from "./ManagerBottomTabs";

type TabKey = "dashboard" | "approvals" | "account";

const ManagerRootScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
    const insets = useSafeAreaInsets();

    const renderContent = () => {
        switch (activeTab) {
            case "approvals":
                return <ManagerApprovals />;

            case "account":
                return <ManagerAccount />;

            case "dashboard":
            default:
                return <ManagerDashboard />;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-emerald-50">
            <StatusBar barStyle="dark-content" />
            <View className="flex-1">
                <View className="flex-1">{renderContent()}</View>

                {/* Bottom padding to prevent overlap with navigation buttons */}
                <View style={{ paddingBottom: insets.bottom }}>
                    <ManagerBottomTabs
                        onDashboardPress={() => setActiveTab("dashboard")}
                        onApprovalsPress={() => setActiveTab("approvals")}
                        onAccountPress={() => setActiveTab("account")}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

export default ManagerRootScreen;
