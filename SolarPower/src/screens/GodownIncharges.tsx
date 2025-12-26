// src/screens/GodownIncharges.tsx
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    View,
    Text,
    ScrollView,
    TextInput,
    Pressable,
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
} from "react-native";
import {
    Users,
    Plus,
    Phone,
    MessageCircle,
    Edit,
    Trash2,
    Mail,
} from "lucide-react-native";

import { useAdminAuthStore } from "../stores/adminAuthStore";
import { useGodownInchargeAuthStore } from "../stores/godownInchargeAuthStore";
import {
    registerGodownInchargeService,
    updateGodownInchargeService,
    deleteGodownInchargeService,
} from "../services/godownInchargeAuthService";

const GodownIncharges: React.FC = () => {
    const insets = useSafeAreaInsets();

    // Admin token
    const { tokens: adminTokens } = useAdminAuthStore();
    const adminAccessToken = adminTokens?.accessToken || "";

    // Godown Incharge list from store (with caching)
    const {
        godownInchargeList,
        godownInchargeListLoading: loading,
        godownInchargeListError: error,
        initGodownInchargeListFromStorage,
        fetchGodownInchargeList,
    } = useGodownInchargeAuthStore();

    // Register form state
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(false);

    // Edit modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingGodownIncharge, setEditingGodownIncharge] = useState<{
        id: string;
        email: string;
        name: string;
        phoneNumber: string;
    } | null>(null);
    const [editEmail, setEditEmail] = useState("");
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);

    // Search filter
    const [searchQuery, setSearchQuery] = useState("");

    // Init from storage and fetch fresh data
    useEffect(() => {
        initGodownInchargeListFromStorage(); // Load cached data immediately
    }, []);

    useEffect(() => {
        if (adminAccessToken) {
            fetchGodownInchargeList(adminAccessToken); // Fetch fresh data
        }
    }, [adminAccessToken]);

    // Phone / Email helpers
    const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

    const handleCall = (phone: string) => {
        const num = normalizePhone(phone);
        if (!num) return;
        Linking.openURL(`tel:${num}`);
    };

    const handleWhatsApp = (phone: string) => {
        const num = normalizePhone(phone);
        if (!num) return;
        const full = num.startsWith("91") ? num : `91${num}`;
        Linking.openURL(`https://wa.me/${full}`);
    };

    const handleEmail = (email: string) => {
        if (!email) return;
        Linking.openURL(`mailto:${email}`);
    };

    // Register Godown Incharge
    const handleRegister = async () => {
        if (!email.trim() || !name.trim() || !phoneNumber.trim() || !password.trim()) {
            Alert.alert("Missing fields", "Please fill all fields to register godown incharge.");
            return;
        }

        if (!adminAccessToken) {
            Alert.alert("Not authorized", "Admin token missing. Please login again.");
            return;
        }

        setSubmitting(true);
        try {
            await registerGodownInchargeService(
                {
                    email: email.trim(),
                    name: name.trim(),
                    phoneNumber: phoneNumber.trim(),
                    password: password.trim(),
                },
                adminAccessToken
            );

            Alert.alert("Success", "Godown Incharge registered successfully.");

            // Reset form
            setEmail("");
            setName("");
            setPhoneNumber("");
            setPassword("");
            setShowRegisterForm(false);

            // Refresh list from store
            fetchGodownInchargeList(adminAccessToken);
        } catch (err: any) {
            Alert.alert("Error", err?.message || "Failed to register godown incharge.");
        } finally {
            setSubmitting(false);
        }
    };

    // Open edit modal
    const openEditModal = (godownIncharge: any) => {
        setEditingGodownIncharge({
            id: godownIncharge.id,
            email: godownIncharge.email,
            name: godownIncharge.name,
            phoneNumber: godownIncharge.phoneNumber,
        });
        setEditEmail(godownIncharge.email);
        setEditName(godownIncharge.name);
        setEditPhone(godownIncharge.phoneNumber);
        setEditPassword("");
        setShowEditModal(true);
    };

    // Handle update
    const handleUpdate = async () => {
        if (!editingGodownIncharge) return;
        if (!editEmail.trim() || !editName.trim() || !editPhone.trim()) {
            Alert.alert("Error", "Email, name, and phone number are required");
            return;
        }

        setUpdateLoading(true);
        try {
            const updateData: any = {
                email: editEmail.trim(),
                name: editName.trim(),
                phoneNumber: editPhone.trim(),
            };
            if (editPassword.trim()) {
                updateData.password = editPassword.trim();
            }

            await updateGodownInchargeService(
                editingGodownIncharge.id,
                updateData,
                adminAccessToken
            );

            Alert.alert("Success", "Godown Incharge updated successfully");
            setShowEditModal(false);
            setEditingGodownIncharge(null);

            // Refresh list from store
            fetchGodownInchargeList(adminAccessToken);
        } catch (err: any) {
            Alert.alert("Error", err?.message || "Failed to update godown incharge");
        } finally {
            setUpdateLoading(false);
        }
    };

    // Handle delete
    const handleDelete = (godownIncharge: any) => {
        Alert.alert(
            "Delete Godown Incharge",
            `Are you sure you want to delete ${godownIncharge.email}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteGodownInchargeService(godownIncharge.id, adminAccessToken);
                            Alert.alert("Success", "Godown Incharge deleted successfully");
                            fetchGodownInchargeList(adminAccessToken);
                        } catch (err: any) {
                            Alert.alert("Error", err?.message || "Failed to delete godown incharge");
                        }
                    },
                },
            ]
        );
    };

    // Filter godown incharges - use godownInchargeList from store
    const filteredGodownIncharges = godownInchargeList.filter((gi: any) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            gi.email.toLowerCase().includes(q) ||
            gi.phoneNumber.includes(q)
        );
    });

    // Skeleton loader component
    const SkeletonCard = () => (
        <View className="bg-white rounded-2xl border border-emerald-100 shadow-sm px-3 py-3 mb-2">
            <View className="mb-2">
                <View className="h-4 w-32 bg-slate-200 rounded mb-2" />
                <View className="h-3 w-40 bg-slate-100 rounded mb-1" />
                <View className="h-3 w-28 bg-slate-100 rounded" />
            </View>
            <View className="flex-row gap-x-1">
                <View className="h-7 w-7 bg-slate-100 rounded-full" />
                <View className="h-7 w-7 bg-slate-100 rounded-full" />
                <View className="h-7 w-7 bg-slate-100 rounded-full" />
                <View className="h-7 w-7 bg-slate-100 rounded-full" />
                <View className="h-7 w-7 bg-slate-100 rounded-full" />
            </View>
        </View>
    );

    return (
        <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View className="mb-4 flex-row items-center justify-between">
                <View>
                    <Text className="text-2xl font-bold text-emerald-900">
                        Godown Incharges
                    </Text>
                    <Text className="text-slate-500 mt-1 text-sm">
                        Manage godown incharges & their access credentials.
                    </Text>
                </View>

                <Pressable
                    onPress={() => setShowRegisterForm((prev) => !prev)}
                    className="flex-row items-center px-3 py-1.5 rounded-full bg-emerald-600"
                >
                    <Plus size={16} color="#FFFFFF" />
                    <Text className="ml-1 text-[12px] font-semibold text-white">
                        {showRegisterForm ? "Close" : "Add"}
                    </Text>
                </Pressable>
            </View>

            {/* Register Form */}
            {showRegisterForm && (
                <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-emerald-50">
                    <View className="flex-row items-center justify-between mb-3">
                        <View>
                            <Text className="text-sm font-semibold text-emerald-900">
                                Register New Godown Incharge
                            </Text>
                            <Text className="text-[11px] text-slate-400 mt-0.5">
                                Create a new godown incharge account with email & phone.
                            </Text>
                        </View>
                        <View className="h-8 w-8 rounded-full bg-emerald-50 items-center justify-center">
                            <Plus size={18} color="#059669" />
                        </View>
                    </View>

                    <View className="gap-y-2">
                        <TextInput
                            placeholder="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="border border-emerald-100 rounded-xl px-3 py-2 text-[12px] text-slate-800"
                            placeholderTextColor="#9CA3AF"
                        />
                        <TextInput
                            placeholder="Full Name"
                            value={name}
                            onChangeText={setName}
                            className="border border-emerald-100 rounded-xl px-3 py-2 text-[12px] text-slate-800"
                            placeholderTextColor="#9CA3AF"
                        />
                        <TextInput
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            className="border border-emerald-100 rounded-xl px-3 py-2 text-[12px] text-slate-800"
                            placeholderTextColor="#9CA3AF"
                        />
                        <TextInput
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            className="border border-emerald-100 rounded-xl px-3 py-2 text-[12px] text-slate-800"
                            placeholderTextColor="#9CA3AF"
                        />

                        <Pressable
                            onPress={handleRegister}
                            disabled={submitting}
                            className={`mt-2 rounded-xl py-2 items-center justify-center ${submitting ? "bg-emerald-300" : "bg-emerald-600"
                                }`}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text className="text-white text-[13px] font-semibold">
                                    Register Godown Incharge
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            )}

            {/* Search */}
            <View className="mb-2">
                <TextInput
                    placeholder="Search by email or phone"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="bg-white border border-emerald-100 rounded-2xl px-3 py-2 text-[12px] text-slate-800"
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            {/* Summary Card */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-emerald-50 flex-row justify-between items-center">
                <View>
                    <Text className="text-sm font-semibold text-emerald-900">
                        Team Overview
                    </Text>
                    <Text className="text-[11px] text-slate-400 mt-1">
                        Total registered godown incharges.
                    </Text>
                </View>
                <View className="flex-row items-center gap-x-3">
                    <View className="items-center">
                        <Text className="text-lg font-semibold text-emerald-700">
                            {filteredGodownIncharges.length}
                        </Text>
                        <Text className="text-[10px] text-slate-400">Incharges</Text>
                    </View>
                    <View className="items-center">
                        <View className="h-8 w-8 rounded-full bg-emerald-50 items-center justify-center">
                            <Users size={18} color="#059669" />
                        </View>
                    </View>
                </View>
            </View>

            {/* Loader - Show skeleton cards */}
            {loading && godownInchargeList.length === 0 && (
                <View className="gap-y-2 mb-3">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            )}

            {/* Godown Incharge Cards */}
            {filteredGodownIncharges.length === 0 && !loading ? (
                <View className="bg-white rounded-2xl border border-emerald-100 shadow-sm px-3 py-4">
                    <Text className="text-[12px] text-slate-500">
                        No godown incharges found. Register a new one to get started.
                    </Text>
                </View>
            ) : (
                <View className="gap-y-2">
                    {filteredGodownIncharges.map((gi) => (
                        <View
                            key={gi.id}
                            className="bg-white rounded-2xl border border-emerald-100 shadow-sm px-3 py-3"
                        >
                            {/* Name & Email */}
                            <View className="mb-2">
                                <Text className="text-[13px] font-semibold text-slate-800">
                                    {gi.name}
                                </Text>
                                <Text className="text-[11px] text-slate-500 mt-0.5">
                                    {gi.email}
                                </Text>
                                <Text className="text-[11px] text-slate-500 mt-0.5">
                                    {gi.phoneNumber}
                                </Text>
                            </View>

                            {/* Actions */}
                            <View className="flex-row items-center gap-x-1">
                                <Pressable
                                    onPress={() => handleEmail(gi.email)}
                                    className="h-7 w-7 rounded-full bg-blue-50 items-center justify-center"
                                >
                                    <Mail size={15} color="#2563EB" />
                                </Pressable>
                                <Pressable
                                    onPress={() => handleCall(gi.phoneNumber)}
                                    className="h-7 w-7 rounded-full bg-emerald-50 items-center justify-center"
                                >
                                    <Phone size={15} color="#047857" />
                                </Pressable>
                                <Pressable
                                    onPress={() => handleWhatsApp(gi.phoneNumber)}
                                    className="h-7 w-7 rounded-full bg-green-50 items-center justify-center"
                                >
                                    <MessageCircle size={15} color="#16A34A" />
                                </Pressable>
                                <Pressable
                                    onPress={() => openEditModal(gi)}
                                    className="h-7 w-7 rounded-full bg-blue-50 items-center justify-center"
                                >
                                    <Edit size={15} color="#2563EB" />
                                </Pressable>
                                <Pressable
                                    onPress={() => handleDelete(gi)}
                                    className="h-7 w-7 rounded-full bg-red-50 items-center justify-center"
                                >
                                    <Trash2 size={15} color="#DC2626" />
                                </Pressable>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Edit Modal */}
            <Modal
                visible={showEditModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowEditModal(false)}
            >
                <View className="flex-1 justify-end bg-black/40">
                    <View className="bg-white rounded-t-3xl p-5">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-bold text-slate-800">
                                Edit Godown Incharge
                            </Text>
                            <Pressable
                                onPress={() => setShowEditModal(false)}
                                className="h-8 w-8 rounded-full bg-slate-100 items-center justify-center"
                            >
                                <Text className="text-slate-600 font-bold">×</Text>
                            </Pressable>
                        </View>

                        {editingGodownIncharge && (
                            <View className="gap-y-3">
                                <View>
                                    <Text className="text-xs text-slate-500 mb-1">Email *</Text>
                                    <TextInput
                                        value={editEmail}
                                        onChangeText={setEditEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        className="border border-emerald-100 rounded-xl px-3 py-2 text-sm text-slate-800"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>

                                <View>
                                    <Text className="text-xs text-slate-500 mb-1">Name *</Text>
                                    <TextInput
                                        value={editName}
                                        onChangeText={setEditName}
                                        className="border border-emerald-100 rounded-xl px-3 py-2 text-sm text-slate-800"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>

                                <View>
                                    <Text className="text-xs text-slate-500 mb-1">
                                        Phone Number *
                                    </Text>
                                    <TextInput
                                        value={editPhone}
                                        onChangeText={setEditPhone}
                                        keyboardType="phone-pad"
                                        className="border border-emerald-100 rounded-xl px-3 py-2 text-sm text-slate-800"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>

                                <View>
                                    <Text className="text-xs text-slate-500 mb-1">
                                        New Password (optional)
                                    </Text>
                                    <TextInput
                                        value={editPassword}
                                        onChangeText={setEditPassword}
                                        secureTextEntry
                                        placeholder="Leave empty to keep current password"
                                        className="border border-emerald-100 rounded-xl px-3 py-2 text-sm text-slate-800"
                                        placeholderTextColor="#9CA3AF"
                                    />
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
                                            Update Godown Incharge
                                        </Text>
                                    )}
                                </Pressable>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

export default GodownIncharges;
