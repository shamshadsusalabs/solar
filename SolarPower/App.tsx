// App.tsx
import "./global.css";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";

import AuthLoginScreen from "./src/auth/AuthLoginScreen";  // 👈 YEH HI SIRF
import AdminRootScreen from "./src/screens/AdminRootScreen";
import EmployeeRootScreen from "./src/screens/EmployeeRootScreen";

import { useAdminAuthStore } from "./src/stores/adminAuthStore";
import { useEmployeeAuthStore } from "./src/stores/employeeAuthStore";

function App() {
  const [bootstrapping, setBootstrapping] = useState(true);

  const initAdminAuthFromStorage = useAdminAuthStore(
    (s) => s.initAdminAuthFromStorage
  );
  const initEmployeeAuthFromStorage = useEmployeeAuthStore(
    (s) => s.initEmployeeAuthFromStorage
  );

  const adminRole = useAdminAuthStore((s) => s.role);
  const employeeRole = useEmployeeAuthStore((s) => s.role);

  useEffect(() => {
    (async () => {
      await Promise.all([
        initAdminAuthFromStorage(),
        initEmployeeAuthFromStorage(),
      ]);
      setBootstrapping(false);
    })();
  }, [initAdminAuthFromStorage, initEmployeeAuthFromStorage]);

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
      ) : (
        <AuthLoginScreen />
      )}
    </SafeAreaProvider>
  );
}

export default App;
