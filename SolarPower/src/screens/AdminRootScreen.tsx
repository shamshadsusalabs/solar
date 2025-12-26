// src/screens/AdminRootScreen.tsx
import React, { useState } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AdminHomeScreen from "./AdminHomeScreen";
import Employees from "./Employees";
import Managers from "./Managers";
import Chiefs from "./Chiefs";
import GodownIncharges from "./GodownIncharges";    // 👈 NEW
import Approvals from "./Approvals";
import Account from "./Account";
import AdminBottomTabs from "../screens/AdminBottomTabs";

type TabKey = "dashboard" | "employees" | "managers" | "chiefs" | "godownincharges" | "approvals" | "account";

const AdminRootScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const insets = useSafeAreaInsets(); // 👈 Safe area insets for bottom padding

  const renderContent = () => {
    switch (activeTab) {
      case "employees":
        return <Employees />;

      case "managers":
        return <Managers />;

      case "chiefs":
        return <Chiefs />;

      case "godownincharges":
        return <GodownIncharges />;  // 👈 NEW

      case "approvals":
        return <Approvals />;

      case "account":
        return <Account />;

      case "dashboard":
      default:
        return <AdminHomeScreen />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-emerald-50">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1">
        <View className="flex-1">{renderContent()}</View>

        {/* 👇 Bottom padding added to prevent overlap with navigation buttons */}
        <View style={{ paddingBottom: insets.bottom }}>
          <AdminBottomTabs
            onDashboardPress={() => setActiveTab("dashboard")}
            onEmployeesPress={() => setActiveTab("employees")}
            onManagersPress={() => setActiveTab("managers")}
            onChiefsPress={() => setActiveTab("chiefs")}
            onGodownInchargesPress={() => setActiveTab("godownincharges")}
            onApprovalsPress={() => setActiveTab("approvals")}
            onAccountPress={() => setActiveTab("account")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AdminRootScreen;
