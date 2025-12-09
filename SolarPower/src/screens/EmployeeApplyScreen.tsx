// src/screens/EmployeeApplyScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { pick, types } from "@react-native-documents/picker";


import { useLeadStore } from "../stores/leadStore";
import { useEmployeeAuthStore } from "../stores/employeeAuthStore";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // ✅ 2MB per file

// 👇 Document type keys
type DocumentKind =
  | "AADHAAR"
  | "PAN"
  | "ELECTRICITY_BILL"
  | "BANK_STATEMENT"
  | "OTHER";

const KIND_LABELS: Record<DocumentKind, string> = {
  AADHAAR: "Aadhaar Card",
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
  customLabel?: string; // sirf OTHER ke liye
};

const EmployeeApplyScreen: React.FC = () => {
  const employee = useEmployeeAuthStore((s) => s.employee);
  const { createLead, creating, error } = useLeadStore();

  const [customerName, setCustomerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [addressText, setAddressText] = useState("");
  const [gpsLocation, setGpsLocation] = useState("");
  const [rtsCapacityKw, setRtsCapacityKw] = useState("");
  const [roofTopCapacityKw, setRoofTopCapacityKw] = useState("");
  const [tropositeAmount, setTropositeAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankDetails, setBankDetails] = useState("");

  // 📂 Ab har type ka document structured hai
  const [documents, setDocuments] = useState<LocalDocument[]>([]);
  const [otherDocLabel, setOtherDocLabel] = useState(""); // "Others" ka naam

  const [localError, setLocalError] = useState<string | null>(null);

  // =======================
  // 🔁 HELPER: UPSERT DOC
  // =======================
  const upsertDocument = (kind: DocumentKind, file: { uri: string; type: string; name: string }) => {
    setDocuments((prev) => {
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
    setDocuments((prev) => prev.filter((d) => d.kind !== kind));
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

  // =======================
  // 📂 GALLERY (per doc type)
  // =======================
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
      console.log("pickFromGallery error:", err);
      Alert.alert("Error", "Gallery se file pick nahi ho payi.");
    }
  };

  // =======================
  // 📷 CAMERA (per doc type)
  // =======================
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
      console.log("pickFromCamera error:", err);
      Alert.alert("Error", "Camera open nahi ho paya.");
    }
  };

  // =======================
  // 📄 PDF / FILE PICKER
  // =======================
  const pickFromFiles = async (kind: DocumentKind) => {
  try {
    const [res] = await pick({
      type: [types.pdf],    // only pdf
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
    console.log("File pick cancelled / error", err);
  }
};


  // =======================
  // 🚀 SUBMIT
  // =======================
  const onSubmit = async () => {
    setLocalError(null);

    if (!customerName.trim() || !contactNumber.trim() || !addressText.trim()) {
      setLocalError(
        "Customer name, contact number aur address required hai."
      );
      return;
    }

    if (!employee) {
      setLocalError("Employee info missing. Please login again.");
      return;
    }

    // 👇 yahan documents ka readable name bana ke bhej rahe hain
    const docsForApi = documents.map((d) => {
      const base =
        d.kind === "OTHER"
          ? (d.customLabel || KIND_LABELS.OTHER)
          : KIND_LABELS[d.kind];

      // final fileName jo backend me dikhega
      const cleanBase = base.replace(/\s+/g, "_");
      const finalName = `${cleanBase}__${d.name}`;

      return {
        uri: d.uri,
        type: d.type,
        name: finalName,
      };
    });

    const ok = await createLead({
      customerName,
      contactNumber,
      addressText,
      gpsLocation,
      rtsCapacityKw,
      roofTopCapacityKw,
      tropositeAmount,
      bankName,
      bankDetails,
      documents: docsForApi,
    });

    if (ok) {
      Alert.alert("Success", "Lead submitted successfully");

      setCustomerName("");
      setContactNumber("");
      setAddressText("");
      setGpsLocation("");
      setRtsCapacityKw("");
      setRoofTopCapacityKw("");
      setTropositeAmount("");
      setBankName("");
      setBankDetails("");
      setDocuments([]);
      setOtherDocLabel("");
    }
  };

  const finalError = localError || error;

  // helper to get doc by kind
  const getDoc = (kind: DocumentKind) =>
    documents.find((d) => d.kind === kind);

  return (
    <View className="flex-1 bg-emerald-50">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-xl font-semibold text-emerald-900 mb-1">
          New Lead / Application
        </Text>
        <Text className="text-[11px] text-slate-500 mb-4">
          Customer details & project info yahan fill karein.
        </Text>

        {/* Salesman info chip */}
        {employee && (
          <View className="mb-4 rounded-2xl bg-emerald-100/80 px-3 py-2">
            <Text className="text-[11px] text-emerald-800">
              Salesman:{" "}
              <Text className="font-semibold">{employee.name}</Text>{" "}
              (
              {(employee as any).employeeCode ||
                (employee as any).code ||
                "EMP"}
              )
            </Text>
          </View>
        )}

        {/* Customer Name */}
        <View className="mb-3">
          <Text className="text-slate-700 mb-1 text-xs font-medium">
            Customer Name
          </Text>
          <View className="rounded-2xl border border-emerald-100 bg-white px-3">
            <TextInput
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Customer full name"
              placeholderTextColor="#9CA3AF"
              className="py-2.5 text-sm text-slate-900"
            />
          </View>
        </View>

        {/* Contact Number */}
        <View className="mb-3">
          <Text className="text-slate-700 mb-1 text-xs font-medium">
            Contact Number
          </Text>
          <View className="rounded-2xl border border-emerald-100 bg-white px-3">
            <TextInput
              value={contactNumber}
              onChangeText={setContactNumber}
              placeholder="10 digit mobile"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              maxLength={10}
              className="py-2.5 text-sm text-slate-900"
            />
          </View>
        </View>

        {/* Address */}
        <View className="mb-3">
          <Text className="text-slate-700 mb-1 text-xs font-medium">
            Address
          </Text>
          <View className="rounded-2xl border border-emerald-100 bg-white px-3">
            <TextInput
              value={addressText}
              onChangeText={setAddressText}
              placeholder="House no, street, city, pincode"
              placeholderTextColor="#9CA3AF"
              multiline
              className="py-2.5 text-sm text-slate-900"
            />
          </View>
        </View>

        {/* GPS Location */}
        <View className="mb-3">
          <Text className="text-slate-700 mb-1 text-xs font-medium">
            GPS Location (optional)
          </Text>
          <View className="rounded-2xl border border-emerald-100 bg-white px-3">
            <TextInput
              value={gpsLocation}
              onChangeText={setGpsLocation}
              placeholder="Google Maps link / lat,long"
              placeholderTextColor="#9CA3AF"
              className="py-2.5 text-sm text-slate-900"
            />
          </View>
        </View>

        {/* RTS Capacity */}
        <View className="mb-3">
          <Text className="text-slate-700 mb-1 text-xs font-medium">
            RTS Capacity (kW)
          </Text>
          <View className="rounded-2xl border border-emerald-100 bg-white px-3">
            <TextInput
              value={rtsCapacityKw}
              onChangeText={setRtsCapacityKw}
              placeholder="e.g. 3"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
              className="py-2.5 text-sm text-slate-900"
            />
          </View>
        </View>

        {/* Roof Top Capacity */}
        <View className="mb-3">
          <Text className="text-slate-700 mb-1 text-xs font-medium">
            Roof Top Capacity (kW)
          </Text>
          <View className="rounded-2xl border border-emerald-100 bg-white px-3">
            <TextInput
              value={roofTopCapacityKw}
              onChangeText={setRoofTopCapacityKw}
              placeholder="e.g. 4"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
              className="py-2.5 text-sm text-slate-900"
            />
          </View>
        </View>

        {/* Troposite Amount */}
        <View className="mb-3">
          <Text className="text-slate-700 mb-1 text-xs font-medium">
            Troposite Amount (₹)
          </Text>
          <View className="rounded-2xl border border-emerald-100 bg-white px-3">
            <TextInput
              value={tropositeAmount}
              onChangeText={setTropositeAmount}
              placeholder="e.g. 120000"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
              className="py-2.5 text-sm text-slate-900"
            />
          </View>
        </View>

        {/* Bank Name */}
        <View className="mb-3">
          <Text className="text-slate-700 mb-1 text-xs font-medium">
            Bank Name
          </Text>
          <View className="rounded-2xl border border-emerald-100 bg-white px-3">
            <TextInput
              value={bankName}
              onChangeText={setBankName}
              placeholder="SBI / HDFC / ICICI..."
              placeholderTextColor="#9CA3AF"
              className="py-2.5 text-sm text-slate-900"
            />
          </View>
        </View>

        {/* Bank Details */}
        <View className="mb-4">
          <Text className="text-slate-700 mb-1 text-xs font-medium">
            Bank Details / Branch
          </Text>
          <View className="rounded-2xl border border-emerald-100 bg-white px-3">
            <TextInput
              value={bankDetails}
              onChangeText={setBankDetails}
              placeholder="Branch, manager, remarks..."
              placeholderTextColor="#9CA3AF"
              multiline
              className="py-2.5 text-sm text-slate-900"
            />
          </View>
        </View>

        {/* 📂 Structured Documents */}
        <View className="mb-4">
          <Text className="text-slate-700 mb-1 text-xs font-medium">
            Documents – Aadhaar / PAN / Bill / Bank Statement (max 2MB each)
          </Text>

          {/* Aadhaar */}
          <View className="mt-2 mb-2 rounded-2xl bg-white border border-emerald-100 px-3 py-2">
            <Text className="text-[11px] text-slate-700 mb-1 font-semibold">
              {KIND_LABELS.AADHAAR}
            </Text>
            <View className="flex-row mb-1">
              <Pressable
                onPress={() => pickFromGallery("AADHAAR")}
                className="bg-emerald-50 px-3 py-2 rounded-2xl mr-2 active:opacity-80"
              >
                <Text className="text-[11px] text-emerald-700 font-semibold">
                  Gallery
                </Text>
              </Pressable>
              <Pressable
                onPress={() => pickFromCamera("AADHAAR")}
                className="bg-emerald-50 px-3 py-2 rounded-2xl mr-2 active:opacity-80"
              >
                <Text className="text-[11px] text-emerald-700 font-semibold">
                  Camera
                </Text>
              </Pressable>
              <Pressable
                onPress={() => pickFromFiles("AADHAAR")}
                className="bg-emerald-50 px-3 py-2 rounded-2xl active:opacity-80"
              >
                <Text className="text-[11px] text-emerald-700 font-semibold">
                  PDF / File
                </Text>
              </Pressable>
            </View>
            {getDoc("AADHAAR") && (
              <View className="flex-row items-center justify-between mt-1">
                <Text
                  className="text-[11px] text-slate-700 flex-1"
                  numberOfLines={1}
                >
                  • {getDoc("AADHAAR")?.name}
                </Text>
                <Pressable
                  onPress={() => removeDocumentByKind("AADHAAR")}
                  className="ml-2 px-2 py-1 rounded-full bg-red-100"
                >
                  <Text className="text-[10px] text-red-600">Remove</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* PAN */}
          <View className="mb-2 rounded-2xl bg-white border border-emerald-100 px-3 py-2">
            <Text className="text-[11px] text-slate-700 mb-1 font-semibold">
              {KIND_LABELS.PAN}
            </Text>
            <View className="flex-row mb-1">
              <Pressable
                onPress={() => pickFromGallery("PAN")}
                className="bg-emerald-50 px-3 py-2 rounded-2xl mr-2 active:opacity-80"
              >
                <Text className="text-[11px] text-emerald-700 font-semibold">
                  Gallery
                </Text>
              </Pressable>
              <Pressable
                onPress={() => pickFromCamera("PAN")}
                className="bg-emerald-50 px-3 py-2 rounded-2xl mr-2 active:opacity-80"
              >
                <Text className="text-[11px] text-emerald-700 font-semibold">
                  Camera
                </Text>
              </Pressable>
              <Pressable
                onPress={() => pickFromFiles("PAN")}
                className="bg-emerald-50 px-3 py-2 rounded-2xl active:opacity-80"
              >
                <Text className="text-[11px] text-emerald-700 font-semibold">
                  PDF / File
                </Text>
              </Pressable>
            </View>
            {getDoc("PAN") && (
              <View className="flex-row items-center justify-between mt-1">
                <Text
                  className="text-[11px] text-slate-700 flex-1"
                  numberOfLines={1}
                >
                  • {getDoc("PAN")?.name}
                </Text>
                <Pressable
                  onPress={() => removeDocumentByKind("PAN")}
                  className="ml-2 px-2 py-1 rounded-full bg-red-100"
                >
                  <Text className="text-[10px] text-red-600">Remove</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Electricity Bill */}
          <View className="mb-2 rounded-2xl bg-white border border-emerald-100 px-3 py-2">
            <Text className="text-[11px] text-slate-700 mb-1 font-semibold">
              {KIND_LABELS.ELECTRICITY_BILL}
            </Text>
            <View className="flex-row mb-1">
              <Pressable
                onPress={() => pickFromGallery("ELECTRICITY_BILL")}
                className="bg-emerald-50 px-3 py-2 rounded-2xl mr-2 active:opacity-80"
              >
                <Text className="text-[11px] text-emerald-700 font-semibold">
                  Gallery
                </Text>
              </Pressable>
              <Pressable
                onPress={() => pickFromCamera("ELECTRICITY_BILL")}
                className="bg-emerald-50 px-3 py-2 rounded-2xl mr-2 active:opacity-80"
              >
                <Text className="text-[11px] text-emerald-700 font-semibold">
                  Camera
                </Text>
              </Pressable>
              <Pressable
                onPress={() => pickFromFiles("ELECTRICITY_BILL")}
                className="bg-emerald-50 px-3 py-2 rounded-2xl active:opacity-80"
              >
                <Text className="text-[11px] text-emerald-700 font-semibold">
                  PDF / File
                </Text>
              </Pressable>
            </View>
            {getDoc("ELECTRICITY_BILL") && (
              <View className="flex-row items-center justify-between mt-1">
                <Text
                  className="text-[11px] text-slate-700 flex-1"
                  numberOfLines={1}
                >
                  • {getDoc("ELECTRICITY_BILL")?.name}
                </Text>
                <Pressable
                  onPress={() => removeDocumentByKind("ELECTRICITY_BILL")}
                  className="ml-2 px-2 py-1 rounded-full bg-red-100"
                >
                  <Text className="text-[10px] text-red-600">Remove</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Bank Statement */}
          <View className="mb-2 rounded-2xl bg-white border border-emerald-100 px-3 py-2">
            <Text className="text-[11px] text-slate-700 mb-1 font-semibold">
              {KIND_LABELS.BANK_STATEMENT}
            </Text>
            <View className="flex-row mb-1">
              <Pressable
                onPress={() => pickFromGallery("BANK_STATEMENT")}
                className="bg-emerald-50 px-3 py-2 rounded-2xl mr-2 active:opacity-80"
              >
                <Text className="text-[11px] text-emerald-700 font-semibold">
                  Gallery
                </Text>
              </Pressable>
              <Pressable
                onPress={() => pickFromCamera("BANK_STATEMENT")}
                className="bg-emerald-50 px-3 py-2 rounded-2xl mr-2 active:opacity-80"
              >
                <Text className="text-[11px] text-emerald-700 font-semibold">
                  Camera
                </Text>
              </Pressable>
              <Pressable
                onPress={() => pickFromFiles("BANK_STATEMENT")}
                className="bg-emerald-50 px-3 py-2 rounded-2xl active:opacity-80"
              >
                <Text className="text-[11px] text-emerald-700 font-semibold">
                  PDF / File
                </Text>
              </Pressable>
            </View>
            {getDoc("BANK_STATEMENT") && (
              <View className="flex-row items-center justify-between mt-1">
                <Text
                  className="text-[11px] text-slate-700 flex-1"
                  numberOfLines={1}
                >
                  • {getDoc("BANK_STATEMENT")?.name}
                </Text>
                <Pressable
                  onPress={() => removeDocumentByKind("BANK_STATEMENT")}
                  className="ml-2 px-2 py-1 rounded-full bg-red-100"
                >
                  <Text className="text-[10px] text-red-600">Remove</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Others */}
          <View className="mb-2 rounded-2xl bg-white border border-emerald-100 px-3 py-2">
            <Text className="text-[11px] text-slate-700 mb-1 font-semibold">
              {KIND_LABELS.OTHER}
            </Text>

            <View className="mb-1 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-2">
              <TextInput
                value={otherDocLabel}
                onChangeText={setOtherDocLabel}
                placeholder="e.g. Property Papers, Photo ID..."
                placeholderTextColor="#9CA3AF"
                className="py-1.5 text-[11px] text-slate-900"
              />
            </View>

            <View className="flex-row mb-1">
              <Pressable
                onPress={() => pickFromGallery("OTHER")}
                className="bg-emerald-50 px-3 py-2 rounded-2xl mr-2 active:opacity-80"
              >
                <Text className="text-[11px] text-emerald-700 font-semibold">
                  Gallery
                </Text>
              </Pressable>
              <Pressable
                onPress={() => pickFromCamera("OTHER")}
                className="bg-emerald-50 px-3 py-2 rounded-2xl mr-2 active:opacity-80"
              >
                <Text className="text-[11px] text-emerald-700 font-semibold">
                  Camera
                </Text>
              </Pressable>
              <Pressable
                onPress={() => pickFromFiles("OTHER")}
                className="bg-emerald-50 px-3 py-2 rounded-2xl active:opacity-80"
              >
                <Text className="text-[11px] text-emerald-700 font-semibold">
                  PDF / File
                </Text>
              </Pressable>
            </View>
            {getDoc("OTHER") && (
              <View className="flex-row items-center justify-between mt-1">
                <Text
                  className="text-[11px] text-slate-700 flex-1"
                  numberOfLines={1}
                >
                  • {getDoc("OTHER")?.name}
                </Text>
                <Pressable
                  onPress={() => removeDocumentByKind("OTHER")}
                  className="ml-2 px-2 py-1 rounded-full bg-red-100"
                >
                  <Text className="text-[10px] text-red-600">Remove</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Error */}
        {finalError && (
          <View className="mb-3">
            <Text className="text-[11px] text-red-500">{finalError}</Text>
          </View>
        )}

        {/* Submit button */}
        <Pressable
          onPress={onSubmit}
          disabled={creating}
          className={`rounded-2xl py-3.5 items-center active:opacity-85 shadow-md shadow-emerald-300 ${
            creating ? "bg-emerald-300" : "bg-emerald-500"
          }`}
        >
          {creating ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Submit Lead
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default EmployeeApplyScreen;
