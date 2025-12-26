// App.tsx
import "./global.css";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";

import AuthLoginScreen from "./src/auth/AuthLoginScreen";
import AdminRootScreen from "./src/screens/AdminRootScreen";
import EmployeeRootScreen from "./src/screens/employee/EmployeeRootScreen";
import ManagerRootScreen from "./src/screens/manager/ManagerRootScreen";
import ChiefRootScreen from "./src/screens/chief/ChiefRootScreen";
import GodownInchargeRootScreen from "./src/screens/godownIncharge/GodownInchargeRootScreen";

import { useAdminAuthStore } from "./src/stores/adminAuthStore";
import { useEmployeeAuthStore } from "./src/stores/employeeAuthStore";
import { useManagerAuthStore } from "./src/stores/managerAuthStore";
import { useChiefAuthStore } from "./src/stores/chiefAuthStore";
import { useGodownInchargeAuthStore } from "./src/stores/godownInchargeAuthStore";

function App() {
  const [bootstrapping, setBootstrapping] = useState(true);

  const initAdminAuthFromStorage = useAdminAuthStore(
    (s) => s.initAdminAuthFromStorage
  );
  const initEmployeeAuthFromStorage = useEmployeeAuthStore(
    (s) => s.initEmployeeAuthFromStorage
  );
  const initManagerAuthFromStorage = useManagerAuthStore(
    (s) => s.initManagerAuthFromStorage
  );
  const initChiefAuthFromStorage = useChiefAuthStore(
    (s) => s.initChiefAuthFromStorage
  );
  const initGodownInchargeAuthFromStorage = useGodownInchargeAuthStore(
    (s) => s.initGodownInchargeAuthFromStorage
  );

  const adminRole = useAdminAuthStore((s) => s.role);
  const employeeRole = useEmployeeAuthStore((s) => s.role);
  const managerRole = useManagerAuthStore((s) => s.role);
  const chiefRole = useChiefAuthStore((s) => s.role);
  const godownInchargeRole = useGodownInchargeAuthStore((s) => s.role);

  useEffect(() => {
    (async () => {
      await Promise.all([
        initAdminAuthFromStorage(),
        initEmployeeAuthFromStorage(),
        initManagerAuthFromStorage(),
        initChiefAuthFromStorage(),
        initGodownInchargeAuthFromStorage(),
      ]);
      setBootstrapping(false);
    })();
  }, [
    initAdminAuthFromStorage,
    initEmployeeAuthFromStorage,
    initManagerAuthFromStorage,
    initChiefAuthFromStorage,
    initGodownInchargeAuthFromStorage,
  ]);

  if (bootstrapping) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 items-center justify-center bg-emerald-50">
          <ActivityIndicator />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      {adminRole === "admin" ? (
        <AdminRootScreen />
      ) : employeeRole === "employee" ? (
        <EmployeeRootScreen />
      ) : managerRole === "manager" ? (
        <ManagerRootScreen />
      ) : chiefRole === "chief" ? (
        <ChiefRootScreen />
      ) : godownInchargeRole === "godown_incharge" ? (
        <GodownInchargeRootScreen />
      ) : (
        <AuthLoginScreen />
      )}
    </SafeAreaProvider>
  );
}

export default App;
