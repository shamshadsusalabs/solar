// src/screens/Approvals.tsx
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Linking,
  Modal,
} from "react-native";
import {
  ClipboardCheck,
  Users,
  Phone,
  MapPin,
  FileText,
  IndianRupee,
} from "lucide-react-native";

import { useAdminLeadsStore } from "../stores/leadStore";
import type { LeadStatus } from "../services/leadService";

// 🔁 Status flow – dropdown/modal me isi order me dikhayenge
const STATUS_FLOW: LeadStatus[] = [
  "UNDER_DISCUSSION",
  "DOCUMENT_RECEIVED",
  "DOCUMENT_UPLOAD_OVER_PORTAL",
  "FILE_SEND_TO_BANK",
  "FUNDS_DISBURSED_BY_BANK",
  "MERGED_DOCUMENT_UPLOAD",
  "MATERIAL_DELIVERED",
  "SYSTEM_INSTALLED",
  "SYSTEM_COMMISSIONED",
  "SUBSIDY_REDEEMED",
  "LEAD_CLOSED",
  "REFERRAL_RECEIVED",
];

const Approvals: React.FC = () => {
  const { leads, loading, error, fetchAllLeads, updateLeadStatus } =
    useAdminLeadsStore();

  // 🔽 kis lead ka status modal open hai (null = band)
  const [statusModalLeadId, setStatusModalLeadId] = useState<string | null>(
    null
  );

  // First load
  useEffect(() => {
    fetchAllLeads();
  }, [fetchAllLeads]);

  const onRefresh = () => {
    fetchAllLeads();
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

  const getStatusColorClasses = (status: LeadStatus) => {
    switch (status) {
      case "UNDER_DISCUSSION":
        return {
          bg: "bg-slate-100",
          border: "border-slate-200",
          text: "text-slate-700",
        };
      case "DOCUMENT_RECEIVED":
      case "DOCUMENT_UPLOAD_OVER_PORTAL":
      case "FILE_SEND_TO_BANK":
      case "FUNDS_DISBURSED_BY_BANK":
      case "MERGED_DOCUMENT_UPLOAD":
      case "MATERIAL_DELIVERED":
      case "SYSTEM_INSTALLED":
      case "SYSTEM_COMMISSIONED":
      case "SUBSIDY_REDEEMED":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          text: "text-emerald-700",
        };
      case "LEAD_CLOSED":
        return {
          bg: "bg-emerald-100",
          border: "border-emerald-200",
          text: "text-emerald-800",
        };
      case "REFERRAL_RECEIVED":
        return {
          bg: "bg-sky-50",
          border: "border-sky-100",
          text: "text-sky-700",
        };
      default:
        return {
          bg: "bg-slate-100",
          border: "border-slate-200",
          text: "text-slate-700",
        };
    }
  };

  // 🔘 chip pe tap → modal open
  const onStatusChipPress = (id: string) => {
    setStatusModalLeadId(id);
  };

  // ✅ modal se status choose
  const onSelectStatus = async (id: string, newStatus: LeadStatus) => {
    setStatusModalLeadId(null);
    await updateLeadStatus(id, newStatus);
  };

  // 🔍 currently selected lead (modal ke liye)
  const selectedLead =
    statusModalLeadId != null
      ? leads.find((l) => l._id === statusModalLeadId) || null
      : null;

  return (
    <>
      <ScrollView
        className="flex-1 bg-emerald-50"
        contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={loading && leads.length > 0}
            onRefresh={onRefresh}
          />
        }
      >
        {/* Header */}
        <View className="mb-4 px-1">
          <Text className="text-2xl font-bold text-emerald-900">
            Approvals
          </Text>
          <Text className="text-slate-500 mt-1 text-sm">
            Saare sales leads yahan se review & approve/update kar sakte ho.
          </Text>
        </View>

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
              Abhi tak koi lead create nahi hui hai.
            </Text>
          </View>
        ) : null}

        {/* ✅ Cards list – admin view */}
        {leads.map((lead) => {
          const statusClasses = getStatusColorClasses(lead.status);

          return (
            <View
              key={lead._id}
              className="mb-3 rounded-2xl bg-white border border-emerald-100 shadow-sm shadow-emerald-100 px-3 py-3"
            >
              {/* Top row: Customer + status + date */}
              <View className="flex-row items-start justify-between mb-2">
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
                  <Text className="text-[10px] text-slate-400 mt-0.5">
                    Salesman: {lead.salesManName} ({lead.salesManCode})
                  </Text>
                </View>

                <View className="items-end">
                  <Pressable
                    onPress={() => onStatusChipPress(lead._id)}
                    className={`px-2 py-1 rounded-full border mb-1 ${statusClasses.bg} ${statusClasses.border}`}
                  >
                    <Text
                      className={`text-[10px] font-semibold ${statusClasses.text}`}
                    >
                      {formatStatus(lead.status)}
                    </Text>
                  </Pressable>
                  <Text className="text-[9px] text-slate-400">
                    Tap to change status
                  </Text>
                  <Text className="text-[10px] text-slate-400 mt-1">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Phone + WhatsApp */}
              <View className="flex-row items-center mt-1 mb-1">
                <Text className="text-[11px] text-slate-500 mr-1">
                  Mobile:
                </Text>
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
                    <ClipboardCheck size={14} color="#16a34a" />
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
          );
        })}
      </ScrollView>

      {/* 🔽 CENTER MODAL FOR STATUS CHANGE */}
      <Modal
        transparent
        visible={statusModalLeadId !== null}
        animationType="fade"
        onRequestClose={() => setStatusModalLeadId(null)}
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-6">
          <View className="w-full rounded-2xl bg-white p-4">
            <Text className="text-sm font-semibold text-slate-900 mb-1">
              Change Status
            </Text>
            {selectedLead && (
              <Text className="text-[11px] text-slate-500 mb-3">
                {selectedLead.customerName} –{" "}
                <Text className="font-semibold">
                  {formatStatus(selectedLead.status)}
                </Text>
              </Text>
            )}

            <View className="max-h-64">
              <ScrollView>
                {STATUS_FLOW.map((st) => {
                  const stClasses = getStatusColorClasses(st);
                  const isActive =
                    selectedLead && st === selectedLead.status;

                  return (
                    <Pressable
                      key={st}
                      onPress={() =>
                        selectedLead &&
                        onSelectStatus(selectedLead._id, st)
                      }
                      className={`px-3 py-1.5 mb-1 rounded-xl flex-row items-center justify-between ${
                        isActive ? "bg-emerald-50" : "bg-slate-50"
                      }`}
                    >
                      <Text
                        className={`text-[11px] ${
                          isActive
                            ? "font-semibold " + stClasses.text
                            : "text-slate-700"
                        }`}
                      >
                        {formatStatus(st)}
                      </Text>
                      {isActive && (
                        <ClipboardCheck size={14} color="#059669" />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View className="mt-3 flex-row justify-end">
              <Pressable
                onPress={() => setStatusModalLeadId(null)}
                className="px-4 py-1.5 rounded-full bg-slate-100 active:opacity-80"
              >
                <Text className="text-[12px] text-slate-700">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Approvals;
