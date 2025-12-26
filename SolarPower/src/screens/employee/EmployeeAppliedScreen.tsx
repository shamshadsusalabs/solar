// src/screens/EmployeeAppliedScreen.tsx
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Pressable,
  Linking,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { pick, types } from "@react-native-documents/picker";
import {
  Phone,
  MessageCircle,
  MapPin,
  FileText,
  IndianRupee,
  Upload,
  Edit,
  Trash2,
  Download,
} from "lucide-react-native";

import { useEmployeeLeadsStore } from "../../stores/leadStore";
import { useEmployeeAuthStore } from "../../stores/employeeAuthStore";
import {
  updateLeadService,
  deleteLeadService,
  Lead,
  LeadStatus,
} from "../../services/leadService";

// Employee status options (limited to 3)
const EMPLOYEE_STATUS_FLOW: LeadStatus[] = [
  "INTERESTED_CUSTOMERS",
  "DOCUMENTS_RECEIVED",
  "FILE_SENT_TO_BANK",
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB per file

// Document type keys
type DocumentKind =
  | "AADHAAR_FRONT"
  | "AADHAAR_BACK"
  | "PAN"
  | "ELECTRICITY_BILL"
  | "BANK_STATEMENT"
  | "OTHER";

const KIND_LABELS: Record<DocumentKind, string> = {
  AADHAAR_FRONT: "Aadhaar Front",
  AADHAAR_BACK: "Aadhaar Back",
  PAN: "PAN Card",
  ELECTRICITY_BILL: "Electricity Bill",
  BANK_STATEMENT: "Bank Statement",
  OTHER: "Other Document",
};

type LocalDocument = {
  uri: string;
  type: string;
  name: string;
  kind: DocumentKind;
  customLabel?: string;
};

const EmployeeAppliedScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const {
    leads,
    loading,
    error,
    fetchFirstPage,
    fetchNextPage,
    refresh,
    hasMore,
    updateLeadStatus,
  } = useEmployeeLeadsStore();

  const { tokens } = useEmployeeAuthStore();
  const accessToken = tokens?.accessToken || "";

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editContactNumber, setEditContactNumber] = useState("");
  const [editAddressText, setEditAddressText] = useState("");
  const [editRequiredSystemCapacity, setEditRequiredSystemCapacity] = useState("");
  const [editSystemCostQuoted, setEditSystemCostQuoted] = useState("");
  const [editBankAccountName, setEditBankAccountName] = useState("");
  const [editIfscCode, setEditIfscCode] = useState("");
  const [editBranchDetails, setEditBranchDetails] = useState("");
  const [editTextInstructions, setEditTextInstructions] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [newDocuments, setNewDocuments] = useState<LocalDocument[]>([]);
  const [otherDocLabel, setOtherDocLabel] = useState("");

  // Status modal state
  const [statusModalLeadId, setStatusModalLeadId] = useState<string | null>(null);

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
    const num = phone.startsWith("+") ? phone : `91${phone}`;
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
    const [raw] = fileName.split("__");
    return raw.replace(/_/g, " ");
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setEditCustomerName(lead.customerName);
    setEditContactNumber(lead.contactNumber);
    setEditAddressText(lead.addressText);
    setEditRequiredSystemCapacity(lead.requiredSystemCapacity || "");
    setEditSystemCostQuoted(lead.systemCostQuoted?.toString() || "");
    setEditBankAccountName(lead.bankAccountName || "");
    setEditIfscCode(lead.ifscCode || "");
    setEditBranchDetails(lead.branchDetails || "");
    setEditTextInstructions(lead.textInstructions || "");
    setNewDocuments([]); // Reset new documents
    setOtherDocLabel("");
    setShowEditModal(true);
  };

  // Helper: Upsert document by kind
  const upsertDocument = (kind: DocumentKind, file: { uri: string; type: string; name: string }) => {
    setNewDocuments((prev) => {
      const idx = prev.findIndex((d) => d.kind === kind);

      const newDoc: LocalDocument = {
        uri: file.uri,
        type: file.type,
        name: file.name,
        kind,
        customLabel:
          kind === "OTHER"
            ? (otherDocLabel || KIND_LABELS.OTHER).trim()
            : undefined,
      };

      if (idx >= 0) {
        const clone = [...prev];
        clone[idx] = newDoc;
        return clone;
      }
      return [...prev, newDoc];
    });
  };

  const removeDocumentByKind = (kind: DocumentKind) => {
    setNewDocuments((prev) => prev.filter((d) => d.kind !== kind));
  };

  const validateFileSize = (size: number | undefined, name: string) => {
    if (!size) return true;
    if (size > MAX_FILE_SIZE) {
      Alert.alert(
        "File too large",
        `${name} 2MB se bada hai. Har file max 2MB allowed hai.`
      );
      return false;
    }
    return true;
  };

  // Gallery picker
  const pickFromGallery = async (kind: DocumentKind) => {
    try {
      const result = await launchImageLibrary({
        mediaType: "photo",
        selectionLimit: 1,
      });

      if (result.didCancel) return;
      if (!result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      const size = asset.fileSize ?? 0;
      const name = asset.fileName || "image.jpg";

      if (!validateFileSize(size, name)) return;
      if (!asset.uri || !asset.type) return;

      upsertDocument(kind, {
        uri: asset.uri as string,
        type: asset.type as string,
        name,
      });
    } catch (err) {
      Alert.alert("Error", "Gallery se file pick nahi ho payi.");
    }
  };

  // Camera picker
  const pickFromCamera = async (kind: DocumentKind) => {
    try {
      const result = await launchCamera({
        mediaType: "photo",
        saveToPhotos: true,
      });

      if (!result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      const size = asset.fileSize ?? 0;
      const name = asset.fileName || "camera-photo.jpg";

      if (!validateFileSize(size, name)) return;
      if (!asset.uri || !asset.type) return;

      upsertDocument(kind, {
        uri: asset.uri as string,
        type: asset.type as string,
        name,
      });
    } catch (err) {
      Alert.alert("Error", "Camera open nahi ho paya.");
    }
  };

  // PDF/File picker
  const pickFromFiles = async (kind: DocumentKind) => {
    try {
      const [res] = await pick({
        type: [types.pdf],
      });

      const size = res.size ?? 0;
      const name = res.name || "document.pdf";

      if (!validateFileSize(size, name)) return;

      upsertDocument(kind, {
        uri: res.uri,
        type: res.type || "application/pdf",
        name,
      });
    } catch (err) {
      // File picker cancelled or error - silent
    }
  };

  // Helper to get doc by kind
  const getDoc = (kind: DocumentKind) =>
    newDocuments.find((d) => d.kind === kind);

  const handleUpdate = async () => {
    if (!editingLead) return;
    if (!editCustomerName.trim() || !editContactNumber.trim() || !editAddressText.trim()) {
      Alert.alert("Error", "Customer name, contact, and address are required");
      return;
    }

    setUpdateLoading(true);
    try {
      // If there are new documents, use FormData
      if (newDocuments.length > 0) {
        const formData = new FormData();

        formData.append("customerName", editCustomerName.trim());
        formData.append("contactNumber", editContactNumber.trim());
        formData.append("addressText", editAddressText.trim());

        if (editRequiredSystemCapacity) formData.append("requiredSystemCapacity", editRequiredSystemCapacity.trim());
        if (editSystemCostQuoted) formData.append("systemCostQuoted", editSystemCostQuoted);
        if (editBankAccountName) formData.append("bankAccountName", editBankAccountName.trim());
        if (editIfscCode) formData.append("ifscCode", editIfscCode.trim());
        if (editBranchDetails) formData.append("branchDetails", editBranchDetails.trim());
        if (editTextInstructions) formData.append("textInstructions", editTextInstructions.trim());

        // Append new documents with proper naming
        newDocuments.forEach((doc) => {
          const base =
            doc.kind === "OTHER"
              ? (doc.customLabel || KIND_LABELS.OTHER)
              : KIND_LABELS[doc.kind];

          const cleanBase = base.replace(/\s+/g, "_");
          const finalName = `${cleanBase}__${doc.name}`;

          formData.append("documents", {
            uri: doc.uri,
            type: doc.type,
            name: finalName,
          } as any);
        });

        await updateLeadService(editingLead._id, formData, accessToken);
      } else {
        // No new documents, use JSON
        const updateData: any = {
          customerName: editCustomerName.trim(),
          contactNumber: editContactNumber.trim(),
          addressText: editAddressText.trim(),
        };

        if (editRequiredSystemCapacity) updateData.requiredSystemCapacity = editRequiredSystemCapacity.trim();
        if (editSystemCostQuoted) updateData.systemCostQuoted = parseFloat(editSystemCostQuoted);
        if (editBankAccountName) updateData.bankAccountName = editBankAccountName.trim();
        if (editIfscCode) updateData.ifscCode = editIfscCode.trim();
        if (editBranchDetails) updateData.branchDetails = editBranchDetails.trim();
        if (editTextInstructions) updateData.textInstructions = editTextInstructions.trim();

        await updateLeadService(editingLead._id, updateData, accessToken);
      }

      Alert.alert("Success", "Lead updated successfully");
      setShowEditModal(false);
      setEditingLead(null);
      setNewDocuments([]);
      setOtherDocLabel("");
      refresh();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to update lead");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = (lead: Lead) => {
    Alert.alert(
      "Delete Lead",
      `Are you sure you want to delete lead for ${lead.customerName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLeadService(lead._id, accessToken);
              Alert.alert("Success", "Lead deleted successfully");
              refresh();
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Failed to delete lead");
            }
          },
        },
      ]
    );
  };

  // Skeleton loader component
  const SkeletonCard = () => (
    <View className="mb-3 rounded-2xl bg-white border border-emerald-100 shadow-sm px-3 py-3">
      <View className="flex-row justify-between mb-2">
        <View className="flex-1 pr-2">
          <View className="h-4 w-32 bg-slate-200 rounded mb-2" />
          <View className="h-3 w-24 bg-slate-100 rounded" />
        </View>
        <View className="items-end">
          <View className="h-6 w-20 bg-slate-200 rounded-full mb-1" />
          <View className="h-3 w-16 bg-slate-100 rounded" />
        </View>
      </View>
      <View className="flex-row items-center mt-2 mb-2">
        <View className="h-3 w-28 bg-slate-100 rounded mr-2" />
        <View className="h-7 w-7 bg-slate-100 rounded-full ml-auto mr-2" />
        <View className="h-7 w-7 bg-slate-100 rounded-full" />
      </View>
      <View className="h-3 w-full bg-slate-100 rounded mb-1" />
      <View className="h-3 w-3/4 bg-slate-100 rounded" />
      <View className="flex-row gap-x-2 mt-3">
        <View className="flex-1 h-8 bg-slate-100 rounded-xl" />
        <View className="flex-1 h-8 bg-slate-100 rounded-xl" />
      </View>
    </View>
  );

  return (
    <ScrollView
      className="flex-1 bg-emerald-50"
      contentContainerStyle={{ paddingTop: insets.top + 12, padding: 12, paddingBottom: 32 }}
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

      {leads.length === 0 && !loading && !error ? (
        <View className="mt-10 items-center">
          <Text className="text-slate-500 text-sm text-center px-6">
            Abhi tak koi lead apply nahi ki hai.
          </Text>
        </View>
      ) : null}

      {leads.map((lead) => (
        <View
          key={lead._id}
          className="mb-3 rounded-2xl bg-white border border-emerald-100 shadow-sm shadow-emerald-100 px-3 py-3"
        >
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
              <Pressable
                onPress={() => setStatusModalLeadId(lead._id)}
                className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-1"
              >
                <Text className="text-[10px] text-emerald-700 font-semibold">
                  {formatStatus(lead.status)}
                </Text>
              </Pressable>
              <Text className="text-[9px] text-slate-400">Tap to change</Text>
              <Text className="text-[10px] text-slate-400 mt-1">
                {new Date(lead.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

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

          <View className="mt-1">
            <Text className="text-[11px] text-slate-500 mb-0.5">
              Address
            </Text>
            <Text className="text-[11px] text-slate-800">
              {lead.addressText}
            </Text>

          </View>

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
                        const docName = getDocLabel(doc.fileName).replace(/\s+/g, '_');
                        const downloadName = `${lead.contactNumber}_${docName}`;
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

          {/* Compiled File Section - Read Only for Employee */}
          {lead.compiledFile && (
            <View className="mt-2 pt-2 border-t border-dashed border-blue-100">
              <View className="flex-row items-center mb-2">
                <FileText size={13} color="#2563eb" />
                <Text className="ml-1 text-[11px] font-semibold text-blue-700">
                  Compiled File
                </Text>
              </View>

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
              </View>
            </View>
          )}

          <View className="mt-2 pt-2 border-t border-dashed border-emerald-100 flex-row gap-x-2">
            <Pressable
              onPress={() => openEditModal(lead)}
              className="flex-1 flex-row items-center justify-center py-2 rounded-xl bg-blue-50 border border-blue-100"
            >
              <Edit size={14} color="#2563EB" />
              <Text className="ml-1 text-xs font-semibold text-blue-700">
                Edit
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleDelete(lead)}
              className="flex-1 flex-row items-center justify-center py-2 rounded-xl bg-red-50 border border-red-100"
            >
              <Trash2 size={14} color="#DC2626" />
              <Text className="ml-1 text-xs font-semibold text-red-700">
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      ))}

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

      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <ScrollView
            className="bg-white rounded-t-3xl p-5 max-h-[80%]"
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-slate-800">
                Edit Lead
              </Text>
              <Pressable
                onPress={() => setShowEditModal(false)}
                className="h-8 w-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <Text className="text-slate-600 font-bold">×</Text>
              </Pressable>
            </View>

            {editingLead && (
              <View className="gap-y-3">
                <View>
                  <Text className="text-xs text-slate-500 mb-1">
                    Customer Name *
                  </Text>
                  <TextInput
                    value={editCustomerName}
                    onChangeText={setEditCustomerName}
                    className="border border-emerald-100 rounded-xl px-3 py-2 text-sm text-slate-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View>
                  <Text className="text-xs text-slate-500 mb-1">
                    Contact Number *
                  </Text>
                  <TextInput
                    value={editContactNumber}
                    onChangeText={setEditContactNumber}
                    keyboardType="phone-pad"
                    className="border border-emerald-100 rounded-xl px-3 py-2 text-sm text-slate-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View>
                  <Text className="text-xs text-slate-500 mb-1">
                    Address *
                  </Text>
                  <TextInput
                    value={editAddressText}
                    onChangeText={setEditAddressText}
                    multiline
                    numberOfLines={3}
                    className="border border-emerald-100 rounded-xl px-3 py-2 text-sm text-slate-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View>
                  <Text className="text-xs text-slate-500 mb-1">
                    Required System Capacity (e.g., "20 kw")
                  </Text>
                  <TextInput
                    value={editRequiredSystemCapacity}
                    onChangeText={setEditRequiredSystemCapacity}
                    placeholder="e.g. 20 kw, 15 KW"
                    className="border border-emerald-100 rounded-xl px-3 py-2 text-sm text-slate-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View>
                  <Text className="text-xs text-slate-500 mb-1">
                    System Cost Quoted (₹)
                  </Text>
                  <TextInput
                    value={editSystemCostQuoted}
                    onChangeText={setEditSystemCostQuoted}
                    keyboardType="numeric"
                    placeholder="e.g. 120000"
                    className="border border-emerald-100 rounded-xl px-3 py-2 text-sm text-slate-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View>
                  <Text className="text-xs text-slate-500 mb-1">
                    Bank Account Name
                  </Text>
                  <TextInput
                    value={editBankAccountName}
                    onChangeText={setEditBankAccountName}
                    placeholder="Account holder name"
                    className="border border-emerald-100 rounded-xl px-3 py-2 text-sm text-slate-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View>
                  <Text className="text-xs text-slate-500 mb-1">
                    IFSC Code
                  </Text>
                  <TextInput
                    value={editIfscCode}
                    onChangeText={setEditIfscCode}
                    placeholder="e.g. SBIN0001234"
                    autoCapitalize="characters"
                    className="border border-emerald-100 rounded-xl px-3 py-2 text-sm text-slate-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View>
                  <Text className="text-xs text-slate-500 mb-1">
                    Branch Details (City/Area)
                  </Text>
                  <TextInput
                    value={editBranchDetails}
                    onChangeText={setEditBranchDetails}
                    placeholder="Branch name, city..."
                    className="border border-emerald-100 rounded-xl px-3 py-2 text-sm text-slate-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View>
                  <Text className="text-xs text-slate-500 mb-1">
                    Instructions / Notes
                  </Text>
                  <TextInput
                    value={editTextInstructions}
                    onChangeText={setEditTextInstructions}
                    multiline
                    numberOfLines={2}
                    placeholder="Any special instructions..."
                    className="border border-emerald-100 rounded-xl px-3 py-2 text-sm text-slate-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* Structured Documents - Same as Create Form */}
                <View>
                  <Text className="text-xs text-slate-500 mb-2 font-semibold">
                    Upload/Replace Documents (max 2MB each)
                  </Text>

                  {/* Aadhaar Front */}
                  <View className="mb-2 rounded-xl bg-slate-50 border border-emerald-100 px-2 py-2">
                    <Text className="text-[10px] text-slate-700 mb-1 font-semibold">
                      {KIND_LABELS.AADHAAR_FRONT}
                    </Text>
                    <View className="flex-row mb-1">
                      <Pressable
                        onPress={() => pickFromGallery("AADHAAR_FRONT")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg mr-1 active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">Gallery</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => pickFromCamera("AADHAAR_FRONT")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg mr-1 active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">Camera</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => pickFromFiles("AADHAAR_FRONT")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">PDF</Text>
                      </Pressable>
                    </View>
                    {getDoc("AADHAAR_FRONT") && (
                      <View className="flex-row items-center justify-between mt-1">
                        <Text className="text-[9px] text-slate-700 flex-1" numberOfLines={1}>
                          • {getDoc("AADHAAR_FRONT")?.name}
                        </Text>
                        <Pressable
                          onPress={() => removeDocumentByKind("AADHAAR_FRONT")}
                          className="ml-1 px-1.5 py-0.5 rounded-full bg-red-100"
                        >
                          <Text className="text-[8px] text-red-600">Remove</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>

                  {/* Aadhaar Back */}
                  <View className="mb-2 rounded-xl bg-slate-50 border border-emerald-100 px-2 py-2">
                    <Text className="text-[10px] text-slate-700 mb-1 font-semibold">
                      {KIND_LABELS.AADHAAR_BACK}
                    </Text>
                    <View className="flex-row mb-1">
                      <Pressable
                        onPress={() => pickFromGallery("AADHAAR_BACK")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg mr-1 active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">Gallery</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => pickFromCamera("AADHAAR_BACK")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg mr-1 active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">Camera</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => pickFromFiles("AADHAAR_BACK")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">PDF</Text>
                      </Pressable>
                    </View>
                    {getDoc("AADHAAR_BACK") && (
                      <View className="flex-row items-center justify-between mt-1">
                        <Text className="text-[9px] text-slate-700 flex-1" numberOfLines={1}>
                          • {getDoc("AADHAAR_BACK")?.name}
                        </Text>
                        <Pressable
                          onPress={() => removeDocumentByKind("AADHAAR_BACK")}
                          className="ml-1 px-1.5 py-0.5 rounded-full bg-red-100"
                        >
                          <Text className="text-[8px] text-red-600">Remove</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>

                  {/* PAN */}
                  <View className="mb-2 rounded-xl bg-slate-50 border border-emerald-100 px-2 py-2">
                    <Text className="text-[10px] text-slate-700 mb-1 font-semibold">
                      {KIND_LABELS.PAN}
                    </Text>
                    <View className="flex-row mb-1">
                      <Pressable
                        onPress={() => pickFromGallery("PAN")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg mr-1 active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">Gallery</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => pickFromCamera("PAN")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg mr-1 active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">Camera</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => pickFromFiles("PAN")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">PDF</Text>
                      </Pressable>
                    </View>
                    {getDoc("PAN") && (
                      <View className="flex-row items-center justify-between mt-1">
                        <Text className="text-[9px] text-slate-700 flex-1" numberOfLines={1}>
                          • {getDoc("PAN")?.name}
                        </Text>
                        <Pressable
                          onPress={() => removeDocumentByKind("PAN")}
                          className="ml-1 px-1.5 py-0.5 rounded-full bg-red-100"
                        >
                          <Text className="text-[8px] text-red-600">Remove</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>

                  {/* Electricity Bill */}
                  <View className="mb-2 rounded-xl bg-slate-50 border border-emerald-100 px-2 py-2">
                    <Text className="text-[10px] text-slate-700 mb-1 font-semibold">
                      {KIND_LABELS.ELECTRICITY_BILL}
                    </Text>
                    <View className="flex-row mb-1">
                      <Pressable
                        onPress={() => pickFromGallery("ELECTRICITY_BILL")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg mr-1 active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">Gallery</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => pickFromCamera("ELECTRICITY_BILL")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg mr-1 active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">Camera</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => pickFromFiles("ELECTRICITY_BILL")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">PDF</Text>
                      </Pressable>
                    </View>
                    {getDoc("ELECTRICITY_BILL") && (
                      <View className="flex-row items-center justify-between mt-1">
                        <Text className="text-[9px] text-slate-700 flex-1" numberOfLines={1}>
                          • {getDoc("ELECTRICITY_BILL")?.name}
                        </Text>
                        <Pressable
                          onPress={() => removeDocumentByKind("ELECTRICITY_BILL")}
                          className="ml-1 px-1.5 py-0.5 rounded-full bg-red-100"
                        >
                          <Text className="text-[8px] text-red-600">Remove</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>

                  {/* Bank Statement */}
                  <View className="mb-2 rounded-xl bg-slate-50 border border-emerald-100 px-2 py-2">
                    <Text className="text-[10px] text-slate-700 mb-1 font-semibold">
                      {KIND_LABELS.BANK_STATEMENT}
                    </Text>
                    <View className="flex-row mb-1">
                      <Pressable
                        onPress={() => pickFromGallery("BANK_STATEMENT")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg mr-1 active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">Gallery</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => pickFromCamera("BANK_STATEMENT")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg mr-1 active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">Camera</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => pickFromFiles("BANK_STATEMENT")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">PDF</Text>
                      </Pressable>
                    </View>
                    {getDoc("BANK_STATEMENT") && (
                      <View className="flex-row items-center justify-between mt-1">
                        <Text className="text-[9px] text-slate-700 flex-1" numberOfLines={1}>
                          • {getDoc("BANK_STATEMENT")?.name}
                        </Text>
                        <Pressable
                          onPress={() => removeDocumentByKind("BANK_STATEMENT")}
                          className="ml-1 px-1.5 py-0.5 rounded-full bg-red-100"
                        >
                          <Text className="text-[8px] text-red-600">Remove</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>

                  {/* Other */}
                  <View className="mb-2 rounded-xl bg-slate-50 border border-emerald-100 px-2 py-2">
                    <Text className="text-[10px] text-slate-700 mb-1 font-semibold">
                      {KIND_LABELS.OTHER}
                    </Text>
                    <View className="mb-1 rounded-lg border border-emerald-100 bg-white px-2">
                      <TextInput
                        value={otherDocLabel}
                        onChangeText={setOtherDocLabel}
                        placeholder="e.g. Property Papers..."
                        placeholderTextColor="#9CA3AF"
                        className="py-1 text-[9px] text-slate-900"
                      />
                    </View>
                    <View className="flex-row mb-1">
                      <Pressable
                        onPress={() => pickFromGallery("OTHER")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg mr-1 active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">Gallery</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => pickFromCamera("OTHER")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg mr-1 active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">Camera</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => pickFromFiles("OTHER")}
                        className="bg-emerald-50 px-2 py-1.5 rounded-lg active:opacity-80"
                      >
                        <Text className="text-[9px] text-emerald-700 font-semibold">PDF</Text>
                      </Pressable>
                    </View>
                    {getDoc("OTHER") && (
                      <View className="flex-row items-center justify-between mt-1">
                        <Text className="text-[9px] text-slate-700 flex-1" numberOfLines={1}>
                          • {getDoc("OTHER")?.name}
                        </Text>
                        <Pressable
                          onPress={() => removeDocumentByKind("OTHER")}
                          className="ml-1 px-1.5 py-0.5 rounded-full bg-red-100"
                        >
                          <Text className="text-[8px] text-red-600">Remove</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>

                  {/* Show existing documents */}
                  {editingLead && editingLead.documents && editingLead.documents.length > 0 && (
                    <View className="mt-2 rounded-lg bg-blue-50 px-2 py-2">
                      <Text className="text-[9px] text-blue-700 mb-1 font-semibold">
                        Currently Uploaded ({editingLead.documents.length}):
                      </Text>
                      {editingLead.documents.map((doc, idx) => (
                        <View
                          key={idx}
                          className="flex-row items-center justify-between py-0.5"
                        >
                          <Text
                            className="text-[8px] text-slate-600 flex-1"
                            numberOfLines={1}
                          >
                            📎 {getDocLabel(doc.fileName)}
                          </Text>
                          <Pressable onPress={() => openUrl(doc.fileUrl)}>
                            <Text className="text-blue-600 text-[8px] underline ml-1">
                              View
                            </Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <Pressable
                  onPress={handleUpdate}
                  disabled={updateLoading}
                  className={`mt-2 rounded-xl py-3 items-center justify-center ${updateLoading ? "bg-emerald-300" : "bg-emerald-600"
                    }`}
                >
                  {updateLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white text-sm font-semibold">
                      Update Lead
                    </Text>
                  )}
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        transparent
        visible={statusModalLeadId !== null}
        animationType="fade"
        onRequestClose={() => setStatusModalLeadId(null)}
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-6">
          <View className="w-full rounded-2xl bg-white p-4">
            <Text className="text-sm font-semibold text-slate-900 mb-1">
              Update Status
            </Text>
            {statusModalLeadId && (
              <Text className="text-[11px] text-slate-500 mb-3">
                Select new status for this lead
              </Text>
            )}

            <View>
              {EMPLOYEE_STATUS_FLOW.map((status) => {
                const currentLead = leads.find((l) => l._id === statusModalLeadId);
                const isActive = currentLead && status === currentLead.status;

                return (
                  <Pressable
                    key={status}
                    onPress={async () => {
                      if (statusModalLeadId) {
                        try {
                          await updateLeadStatus(statusModalLeadId, status);
                          setStatusModalLeadId(null);
                          Alert.alert("Success", "Status updated successfully");
                        } catch (err: any) {
                          Alert.alert("Error", err?.message || "Failed to update status");
                        }
                      }
                    }}
                    className={`px-3 py-2 mb-2 rounded-xl ${isActive ? "bg-emerald-50 border border-emerald-200" : "bg-slate-50"
                      }`}
                  >
                    <Text
                      className={`text-[12px] ${isActive ? "font-semibold text-emerald-700" : "text-slate-700"
                        }`}
                    >
                      {formatStatus(status)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() => setStatusModalLeadId(null)}
              className="mt-3 px-4 py-2 rounded-full bg-slate-100 items-center active:opacity-80"
            >
              <Text className="text-[12px] text-slate-700">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default EmployeeAppliedScreen;
