// src/screens/AdminRootScreen.tsx
import React, { useState } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";

import AdminHomeScreen from "./AdminHomeScreen";
import Employees from "./Employees";
import Approvals from "./Approvals";
import Account from "./Account";                       // 👈 NEW
import AdminBottomTabs from "../screens/AdminBottomTabs";

type TabKey = "dashboard" | "employees" | "approvals" | "account";

const AdminRootScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "employees":
        return <Employees />;

      case "approvals":
        return <Approvals />;

      case "account":
        return <Account />;      // 👈 yahan ab naya screen

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

        <AdminBottomTabs
          onDashboardPress={() => setActiveTab("dashboard")}
          onEmployeesPress={() => setActiveTab("employees")}
          onApprovalsPress={() => setActiveTab("approvals")}
          onAccountPress={() => setActiveTab("account")}
        />
      </View>
    </SafeAreaView>
  );
};

export default AdminRootScreen;
