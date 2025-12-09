// src/screens/EmployeeRootScreen.tsx
import React, { useState } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";

import EmployeeDashboardScreen from "./EmployeeDashboardScreen";
import EmployeeApplyScreen from "./EmployeeApplyScreen";
import EmployeeAppliedScreen from "./EmployeeAppliedScreen";
import EmployeeAccountScreen from "./EmployeeAccountScreen";
import EmployeeBottomTabs from "../screens/EmployeeBottomTabs";

type EmployeeTabKey = "dashboard" | "apply" | "applied" | "account";

const EmployeeRootScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EmployeeTabKey>("dashboard");

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

        {/* Niche bottom tabs */}
        <EmployeeBottomTabs
          onDashboardPress={() => setActiveTab("dashboard")}
          onApplyPress={() => setActiveTab("apply")}
          onAppliedPress={() => setActiveTab("applied")}
          onAccountPress={() => setActiveTab("account")}
        />
      </View>
    </SafeAreaView>
  );
};

export default EmployeeRootScreen;
