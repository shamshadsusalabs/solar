// src/screens/EmployeeAppliedScreen.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Pressable,
  Linking,
} from "react-native";
import {
  Phone,
  MessageCircle,
  MapPin,
  FileText,
  IndianRupee,
} from "lucide-react-native";

import { useEmployeeLeadsStore } from "../stores/leadStore";

const EmployeeAppliedScreen: React.FC = () => {
  const {
    leads,
    loading,
    error,
    fetchFirstPage,
    fetchNextPage,
    refresh,
    hasMore,
  } = useEmployeeLeadsStore();

  useEffect(() => {
    fetchFirstPage();
  }, []);

  const onRefresh = () => {
    refresh();
  };

  const openCall = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const openWhatsApp = (phone: string) => {
    if (!phone) return;
    const num = phone.startsWith("+") ? phone : `91${phone}`; // India default
    const url = `whatsapp://send?phone=${num}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`sms:${phone}`);
    });
  };

  // 👇 yahan optional rakha hai (string | undefined handle karega)
  const openUrl = (url?: string) => {
    if (!url) return;
    Linking.openURL(url);
  };

  const formatStatus = (status: string) =>
    status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());

  const getDocLabel = (fileName: string) => {
    if (!fileName) return "Document";
    const [raw] = fileName.split("__"); // Aadhaar_Card__xyz → Aadhaar_Card
    return raw.replace(/_/g, " "); // Aadhaar Card
  };

  return (
    <ScrollView
      className="flex-1 bg-emerald-50"
      contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={loading && leads.length === 0}
          onRefresh={onRefresh}
        />
      }
    >
      <Text className="text-lg font-semibold text-emerald-900 mb-3">
        My Applied Leads
      </Text>

      {/* Error */}
      {error && (
        <View className="mb-3 rounded-xl bg-red-50 px-3 py-2">
          <Text className="text-[11px] text-red-600">{error}</Text>
        </View>
      )}

      {/* First load loader */}
      {loading && leads.length === 0 ? (
        <View className="mt-10 items-center">
          <ActivityIndicator size="small" color="#059669" />
          <Text className="mt-2 text-slate-500 text-xs">
            Loading leads...
          </Text>
        </View>
      ) : null}

      {/* Empty state */}
      {leads.length === 0 && !loading && !error ? (
        <View className="mt-10 items-center">
          <Text className="text-slate-500 text-sm text-center px-6">
            Abhi tak koi lead apply nahi ki hai.
          </Text>
        </View>
      ) : null}

      {/* ✅ Cards list with full details */}
      {leads.map((lead) => (
        <View
          key={lead._id}
          className="mb-3 rounded-2xl bg-white border border-emerald-100 shadow-sm shadow-emerald-100 px-3 py-3"
        >
          {/* Top row: Customer + status + date */}
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-1 pr-2">
              <Text
                className="text-[13px] font-semibold text-slate-900"
                numberOfLines={1}
              >
                {lead.customerName}
              </Text>
              <Text className="text-[11px] text-slate-500">
                Lead ID: {lead._id.slice(-6).toUpperCase()}
              </Text>
            </View>

            <View className="items-end">
              <View className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-1">
                <Text className="text-[10px] text-emerald-700 font-semibold">
                  {formatStatus(lead.status)}
                </Text>
              </View>
              <Text className="text-[10px] text-slate-400">
                {new Date(lead.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Phone + WhatsApp */}
          <View className="flex-row items-center mt-2 mb-1">
            <Text className="text-[11px] text-slate-500 mr-1">Mobile:</Text>
            <Text className="text-[12px] text-slate-900 font-medium">
              {lead.contactNumber}
            </Text>

            <View className="flex-row ml-auto">
              <Pressable
                onPress={() => openCall(lead.contactNumber)}
                className="ml-2 p-1.5 rounded-full bg-emerald-50 border border-emerald-100"
              >
                <Phone size={14} color="#047857" />
              </Pressable>
              <Pressable
                onPress={() => openWhatsApp(lead.contactNumber)}
                className="ml-2 p-1.5 rounded-full bg-emerald-50 border border-emerald-100"
              >
                <MessageCircle size={14} color="#16a34a" />
              </Pressable>
            </View>
          </View>

          {/* Address + GPS */}
          <View className="mt-1">
            <Text className="text-[11px] text-slate-500 mb-0.5">
              Address
            </Text>
            <Text className="text-[11px] text-slate-800">
              {lead.addressText}
            </Text>

            {lead.gpsLocation ? (
              <Pressable
                onPress={() => openUrl(lead.gpsLocation)}
                className="mt-1 flex-row items-center"
              >
                <MapPin size={12} color="#0369a1" />
                <Text className="ml-1 text-[10px] text-sky-700 underline">
                  Open location
                </Text>
              </Pressable>
            ) : null}
          </View>

          {/* Capacity + Amount chips */}
          <View className="mt-2 flex-row flex-wrap">
            {lead.rtsCapacityKw !== undefined && (
              <View className="mr-2 mb-1 px-2 py-1 rounded-full bg-emerald-50">
                <Text className="text-[10px] text-emerald-800">
                  RTS: {lead.rtsCapacityKw} kW
                </Text>
              </View>
            )}
            {lead.roofTopCapacityKw !== undefined && (
              <View className="mr-2 mb-1 px-2 py-1 rounded-full bg-emerald-50">
                <Text className="text-[10px] text-emerald-800">
                  Roof Top: {lead.roofTopCapacityKw} kW
                </Text>
              </View>
            )}
            {lead.tropositeAmount !== undefined && (
              <View className="mr-2 mb-1 px-2 py-1 rounded-full bg-emerald-50 flex-row items-center">
                <IndianRupee size={10} color="#047857" />
                <Text className="text-[10px] text-emerald-800 ml-0.5">
                  {lead.tropositeAmount}
                </Text>
              </View>
            )}
          </View>

          {/* Bank details */}
          {(lead.bankName || lead.bankDetails) && (
            <View className="mt-2">
              <Text className="text-[11px] text-slate-500 mb-0.5">
                Bank Details
              </Text>
              {lead.bankName && (
                <Text className="text-[11px] text-slate-800">
                  Bank: {lead.bankName}
                </Text>
              )}
              {lead.bankDetails && (
                <Text className="text-[11px] text-slate-800">
                  {lead.bankDetails}
                </Text>
              )}
            </View>
          )}

          {/* Documents */}
          {lead.documents && lead.documents.length > 0 && (
            <View className="mt-2 pt-2 border-t border-dashed border-emerald-100">
              <View className="flex-row items-center mb-1">
                <FileText size={13} color="#4b5563" />
                <Text className="ml-1 text-[11px] font-semibold text-slate-700">
                  Documents ({lead.documents.length})
                </Text>
              </View>

              {lead.documents.map((doc, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => openUrl(doc.fileUrl)}
                  className="flex-row items-center justify-between py-1"
                >
                  <View className="flex-row items-center flex-1 pr-2">
                    <Text
                      className="text-[10px] text-slate-700 flex-1"
                      numberOfLines={1}
                    >
                      • {getDocLabel(doc.fileName)}
                    </Text>
                  </View>

                  <Text className="text-[10px] text-emerald-700 underline">
                    View
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ))}

      {/* NEXT / LOAD MORE button */}
      {hasMore && leads.length > 0 && (
        <View className="mt-4 items-center">
          <Pressable
            onPress={fetchNextPage}
            className="px-5 py-2.5 rounded-full bg-emerald-600 active:opacity-85 shadow-md shadow-emerald-300"
          >
            <Text className="text-white text-xs font-semibold">
              Load more
            </Text>
          </Pressable>
          {loading && (
            <ActivityIndicator
              size="small"
              color="#059669"
              style={{ marginTop: 6 }}
            />
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default EmployeeAppliedScreen;
