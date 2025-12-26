// src/screens/Approvals.tsx
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Linking,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { pick, types } from "@react-native-documents/picker";
import {
  ClipboardCheck,
  Users,
  Phone,
  MapPin,
  FileText,
  Upload,
  IndianRupee,
  Search,
  X,
  Trash2,
  Download,
} from "lucide-react-native";

import { useAdminLeadsStore } from "../stores/leadStore";
import { useCompiledFileStore } from "../stores/compiledFileStore";
import { useAdminAuthStore } from "../stores/adminAuthStore";
import type { LeadStatus } from "../services/leadService";

// 🔁 Status flow – dropdown/modal me isi order me dikhायेंगे
const STATUS_FLOW: LeadStatus[] = [
  "INTERESTED_CUSTOMERS",
  "DOCUMENTS_RECEIVED",
  "DOCUMENTS_UPLOADED_ON_PORTAL",
  "FILE_SENT_TO_BANK",
  "PAYMENT_RECEIVED",
  "SYSTEM_DELIVERED",
  "SYSTEM_INSTALLED",
  "SYSTEM_COMMISSIONED",
  "SUBSIDY_REDEEMED",
  "SUBSIDY_DISBURSED",
  "LEAD_CLOSE",
];

const Approvals: React.FC = () => {
  const insets = useSafeAreaInsets();

  const { leads, loading, error, fetchAllLeads, updateLeadStatus } =
    useAdminLeadsStore();

  const { tokens } = useAdminAuthStore();

  const {
    uploadCompiledFile,
    deleteCompiledFile,
    uploading,
    deleting,
  } = useCompiledFileStore();

  // 🔽 kis lead ka status modal open hai (null = band)
  const [statusModalLeadId, setStatusModalLeadId] = useState<string | null>(
    null
  );
  const [searchText, setSearchText] = useState("");

  // First load
  useEffect(() => {
    fetchAllLeads();
  }, [fetchAllLeads]);

  const onRefresh = () => {
    fetchAllLeads(searchText || undefined);
  };

  const handleSearch = () => {
    fetchAllLeads(searchText.trim());
  };

  const handleClearSearch = () => {
    setSearchText("");
    fetchAllLeads("");
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

  const downloadUrl = (url?: string, customFileName?: string) => {
    if (!url) return;

    // ☁️ Cloudinary Force Download Logic
    let downloadLink = url;
    if (url.includes("cloudinary.com") && url.includes("/upload/")) {
      if (customFileName) {
        // Sanitize filename: remove spaces/special chars
        const safeName = customFileName.replace(/[^a-zA-Z0-9-_]/g, "_");
        downloadLink = url.replace("/upload/", `/upload/fl_attachment:${safeName}/`);
      } else {
        downloadLink = url.replace("/upload/", "/upload/fl_attachment/");
      }
    }

    Linking.openURL(downloadLink);
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
      case "INTERESTED_CUSTOMERS":
        return {
          bg: "bg-slate-100",
          border: "border-slate-200",
          text: "text-slate-700",
        };
      case "DOCUMENTS_RECEIVED":
      case "DOCUMENTS_UPLOADED_ON_PORTAL":
      case "FILE_SENT_TO_BANK":
      case "PAYMENT_RECEIVED":
      case "SYSTEM_DELIVERED":
      case "SYSTEM_INSTALLED":
      case "SYSTEM_COMMISSIONED":
      case "SUBSIDY_REDEEMED":
      case "SUBSIDY_DISBURSED":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          text: "text-emerald-700",
        };
      case "LEAD_CLOSE":
        return {
          bg: "bg-emerald-100",
          border: "border-emerald-200",
          text: "text-emerald-800",
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

  // 📄 Handle PDF upload
  const handleUploadCompiledFile = async (leadId: string) => {
    try {
      const result = await pick({
        type: [types.pdf],
        copyTo: "cachesDirectory",
      });

      const file = result[0];

      // Validate file size (5MB max)
      if (file.size && file.size > 5 * 1024 * 1024) {
        Alert.alert("File Too Large", "Please select a PDF file smaller than 5MB");
        return;
      }

      if (!tokens?.accessToken) {
        Alert.alert("Error", "Please login again");
        return;
      }

      await uploadCompiledFile(
        leadId,
        {
          uri: file.uri,
          name: file.name || "compiled.pdf",
          type: file.type || "application/pdf",
        },
        tokens.accessToken
      );

      Alert.alert("Success", "Compiled file uploaded successfully");
      // Refresh leads to show updated compiledFile
      fetchAllLeads();
    } catch (err: any) {
      if (err && err.message) {
        Alert.alert("Error", err.message || "Failed to upload file");
      }
      // User cancelled - do nothing
    }
  };

  // 🗑️ Handle PDF delete
  const handleDeleteCompiledFile = (leadId: string) => {
    Alert.alert(
      "Delete Compiled File",
      "Are you sure you want to delete this file?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!tokens?.accessToken) return;
            await deleteCompiledFile(leadId, tokens.accessToken);
            Alert.alert("Success", "Compiled file deleted");
            fetchAllLeads();
          },
        },
      ]
    );
  };

  // Skeleton loader component
  const SkeletonCard = () => (
    <View className="mb-3 rounded-2xl bg-white border border-emerald-100 shadow-sm px-3 py-3">
      <View className="flex-row justify-between mb-2">
        <View className="flex-1">
          <View className="h-4 w-32 bg-slate-200 rounded mb-2" />
          <View className="h-3 w-24 bg-slate-100 rounded mb-1" />
          <View className="h-3 w-40 bg-slate-100 rounded" />
        </View>
        <View className="items-end">
          <View className="h-6 w-20 bg-slate-200 rounded-full mb-1" />
          <View className="h-3 w-16 bg-slate-100 rounded" />
        </View>
      </View>
      <View className="flex-row items-center mt-2">
        <View className="h-3 w-28 bg-slate-100 rounded mr-2" />
        <View className="h-7 w-7 bg-slate-100 rounded-full ml-auto" />
        <View className="h-7 w-7 bg-slate-100 rounded-full ml-2" />
      </View>
    </View>
  );

  return (
    <>
      <ScrollView
        className="flex-1 bg-emerald-50"
        contentContainerStyle={{ paddingTop: insets.top + 12, padding: 12, paddingBottom: 32 }}
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

        {/* Search Box */}
        <View className="mb-3 px-1">
          <View className="flex-row items-center bg-white rounded-xl border border-emerald-100 px-3 py-2.5">
            <Search size={18} color="#6b7280" />
            <TextInput
              className="flex-1 ml-2 text-sm text-slate-900"
              placeholder="Search by contact number..."
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
              keyboardType="phone-pad"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searchText.length > 0 && (
              <Pressable onPress={handleClearSearch} className="p-1">
                <X size={16} color="#6b7280" />
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={handleSearch}
            className="mt-2 bg-emerald-600 rounded-xl py-2.5 items-center active:opacity-80"
          >
            <Text className="text-white text-sm font-semibold">Search</Text>
          </Pressable>
        </View>

        {/* Error */}
        {error && (
          <View className="mb-3 rounded-xl bg-red-50 px-3 py-2">
            <Text className="text-[11px] text-red-600">{error}</Text>
          </View>
        )}

        {/* Skeleton Loading */}
        {loading && leads.length === 0 ? (
          <View>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
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

              {/* Address */}
              <View className="mt-1">
                <Text className="text-[11px] text-slate-500 mb-0.5">
                  Address
                </Text>
                <Text className="text-[11px] text-slate-800">
                  {lead.addressText}
                </Text>
              </View>

              {/* Capacity + Amount chips */}
              <View className="mt-2 flex-row flex-wrap">
                {lead.requiredSystemCapacity && (
                  <View className="mr-2 mb-1 px-2 py-1 rounded-full bg-emerald-50">
                    <Text className="text-[10px] text-emerald-800">
                      Capacity: {lead.requiredSystemCapacity}
                    </Text>
                  </View>
                )}
                {lead.systemCostQuoted !== undefined && (
                  <View className="mr-2 mb-1 px-2 py-1 rounded-full bg-emerald-50 flex-row items-center">
                    <IndianRupee size={10} color="#047857" />
                    <Text className="text-[10px] text-emerald-800 ml-0.5">
                      {lead.systemCostQuoted}
                    </Text>
                  </View>
                )}
              </View>

              {/* Bank details */}
              {(lead.bankAccountName || lead.ifscCode || lead.branchDetails) && (
                <View className="mt-2">
                  <Text className="text-[11px] text-slate-500 mb-0.5">
                    Bank Details
                  </Text>
                  {lead.bankAccountName && (
                    <Text className="text-[11px] text-slate-800">
                      Account: {lead.bankAccountName}
                    </Text>
                  )}
                  {lead.ifscCode && (
                    <Text className="text-[11px] text-slate-800">
                      IFSC: {lead.ifscCode}
                    </Text>
                  )}
                  {lead.branchDetails && (
                    <Text className="text-[11px] text-slate-800">
                      Branch: {lead.branchDetails}
                    </Text>
                  )}
                </View>
              )}

              {/* Instructions */}
              {lead.textInstructions && (
                <View className="mt-2">
                  <Text className="text-[11px] text-slate-500 mb-0.5">
                    Instructions
                  </Text>
                  <Text className="text-[11px] text-slate-800 italic">
                    {lead.textInstructions}
                  </Text>
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
                      className="flex-row items-center justify-between py-1 my-0.5"
                    >
                      <View className="flex-row items-center flex-1 pr-2">
                        <Text
                          className="text-[10px] text-slate-700 flex-1"
                          numberOfLines={1}
                        >
                          • {getDocLabel(doc.fileName)}
                        </Text>
                      </View>

                      <View className="flex-row items-center">
                        <Text className="text-[10px] text-emerald-700 underline mr-3">
                          View
                        </Text>
                        <Pressable
                          onPress={() => {
                            const extension = doc.fileUrl.split('.').pop();
                            const docName = getDocLabel(doc.fileName).replace(/\s+/g, '_');
                            // Create clean filename: 9876543210_Aadhaar_Card
                            const downloadName = `${lead.contactNumber}_${docName}`; // Cloudinary adds extension automatically if not in name, but safest to just name it properly
                            downloadUrl(doc.fileUrl, downloadName);
                          }}
                          className="p-1 rounded-full bg-emerald-50"
                        >
                          <Download size={10} color="#059669" />
                        </Pressable>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Compiled File Section */}
              <View className="mt-2 pt-2 border-t border-dashed border-blue-100">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <FileText size={13} color="#2563eb" />
                    <Text className="ml-1 text-[11px] font-semibold text-blue-700">
                      Compiled File
                    </Text>
                  </View>
                </View>

                {lead.compiledFile ? (
                  <View className="flex-row items-center justify-between bg-blue-50 rounded-lg px-2 py-2">
                    <Pressable
                      onPress={() => openUrl(lead.compiledFile)}
                      className="flex-1 flex-row items-center"
                    >
                      <FileText size={12} color="#2563eb" />
                      <Text className="text-[10px] text-blue-700 ml-1 flex-1" numberOfLines={1}>
                        View Compiled PDF
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => downloadUrl(lead.compiledFile)}
                      className="ml-2 p-1 rounded bg-blue-100"
                    >
                      <Download size={12} color="#2563eb" />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteCompiledFile(lead._id)}
                      disabled={deleting}
                      className="ml-2 p-1 rounded bg-red-50"
                    >
                      {deleting ? (
                        <ActivityIndicator size="small" color="#dc2626" />
                      ) : (
                        <Trash2 size={12} color="#dc2626" />
                      )}
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => handleUploadCompiledFile(lead._id)}
                    disabled={uploading}
                    className="flex-row items-center justify-center bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 active:opacity-70"
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color="#2563eb" />
                    ) : (
                      <>
                        <Upload size={12} color="#2563eb" />
                        <Text className="text-[10px] text-blue-700 ml-1 font-medium">
                          Upload Compiled PDF (Max 5MB)
                        </Text>
                      </>
                    )}
                  </Pressable>
                )}
              </View>
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
                      className={`px-3 py-1.5 mb-1 rounded-xl flex-row items-center justify-between ${isActive ? "bg-emerald-50" : "bg-slate-50"
                        }`}
                    >
                      <Text
                        className={`text-[11px] ${isActive
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
