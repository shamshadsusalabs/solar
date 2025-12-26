// src/screens/EmployeeRootScreen.tsx
import React, { useState } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EmployeeDashboardScreen from "./EmployeeDashboardScreen";
import EmployeeApplyScreen from "./EmployeeApplyScreen";
import EmployeeAppliedScreen from "./EmployeeAppliedScreen";
import EmployeeAccountScreen from "./EmployeeAccountScreen";
import EmployeeBottomTabs from "./EmployeeBottomTabs";

type EmployeeTabKey = "dashboard" | "apply" | "applied" | "account";

const EmployeeRootScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EmployeeTabKey>("dashboard");
  const insets = useSafeAreaInsets(); // 👈 Safe area insets for bottom padding

  const renderContent = () => {
    switch (activeTab) {
      case "apply":
        return <EmployeeApplyScreen />;

      case "applied":
        return <EmployeeAppliedScreen />;

      case "account":
        return <EmployeeAccountScreen />;

      case "dashboard":
      default:
        return <EmployeeDashboardScreen />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-emerald-50">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1">
        {/* Upar ka main content */}
        <View className="flex-1">{renderContent()}</View>

        {/* 👇 Bottom padding added to prevent overlap with navigation buttons */}
        <View style={{ paddingBottom: insets.bottom }}>
          <EmployeeBottomTabs
            onDashboardPress={() => setActiveTab("dashboard")}
            onApplyPress={() => setActiveTab("apply")}
            onAppliedPress={() => setActiveTab("applied")}
            onAccountPress={() => setActiveTab("account")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EmployeeRootScreen;
