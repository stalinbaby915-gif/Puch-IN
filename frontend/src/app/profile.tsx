// The Profile tab — manage work locations (add new ones) and view/edit each location's
// hourly rate. Since there's no auth yet, this screen has no login/logout logic at all.

import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Colors } from "../constants/colors";
import { Location } from "../types/types";
import { getLocations, createLocation } from "../api/locations";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../api/supabase";

const PRESET_COLORS = ["#1E40AF", "#DC2626", "#059669", "#D97706", "#7C3AED"];

export default function ProfileScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  function loadLocations() {
    getLocations()
      .then(setLocations)
      .finally(() => setLoading(false));
  }

  useFocusEffect(
    useCallback(() => {
      loadLocations();
    }, [])
  );



  async function handleSignOut() {
    await supabase.auth.signOut();
    // AuthContext's onAuthStateChange listener picks this up automatically —
    // the app will switch back to the login screen without any extra code here
    }

  async function handleAddLocation() {
    if (!newName.trim() || !newRate.trim()) {
      Alert.alert("Missing info", "Enter a name and hourly rate.");
      return;
    }
    const rate = parseFloat(newRate);
    if (isNaN(rate)) {
      Alert.alert("Invalid rate", "Hourly rate must be a number.");
      return;
    }
    try {
      await createLocation({ name: newName.trim(), color: newColor, hourly_rate: rate });
      setNewName("");
      setNewRate("");
      setAdding(false);
      loadLocations();
    } catch (error) {
      Alert.alert("Error", "Could not add location.");
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.header}>Profile & Settings</Text>

        <Text style={styles.sectionTitle}>WORK LOCATIONS</Text>
        {locations.map((loc) => (
            <View key={loc.id} style={styles.locationRow}>
            <View style={[styles.colorDot, { backgroundColor: loc.color }]} />
            <Text style={styles.locationName}>{loc.name}</Text>
            <Text style={styles.locationRate}>${loc.hourly_rate.toFixed(2)}/hr</Text>
            </View>
        ))}

        {adding ? (
            <View style={styles.addForm}>
            <TextInput
                style={styles.input}
                placeholder="Location name"
                value={newName}
                onChangeText={setNewName}
            />
            <TextInput
                style={styles.input}
                placeholder="Hourly rate"
                value={newRate}
                onChangeText={setNewRate}
                keyboardType="decimal-pad"
            />
            <View style={styles.colorRow}>
                {PRESET_COLORS.map((c) => (
                <TouchableOpacity
                    key={c}
                    style={[
                    styles.colorOption,
                    { backgroundColor: c },
                    newColor === c && styles.colorOptionSelected,
                    ]}
                    onPress={() => setNewColor(c)}
                />
                ))}
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity style={styles.saveButton} onPress={handleAddLocation}>
                <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setAdding(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
            </View>
        ) : (
            <TouchableOpacity style={styles.addButton} onPress={() => setAdding(true)}>
            <Text style={styles.addButtonText}>+ Add Location</Text>
            </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background },
  header: { fontSize: 24, fontWeight: "800", color: Colors.textDark, marginBottom: 20 },
  sectionTitle: { fontSize: 12, color: Colors.textMuted, fontWeight: "700", marginBottom: 8 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  locationName: { flex: 1, fontWeight: "600", color: Colors.textDark },
  locationRate: { color: Colors.primary, fontWeight: "700" },
  addButton: {
    marginTop: 12,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  signOutButton: {
    marginTop: 24,
    backgroundColor: "#DCE3F7",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  signOutButtonText: { color: Colors.primary, fontWeight: "700" },
  addButtonText: { color: Colors.primary, fontWeight: "700" },
  addForm: { backgroundColor: Colors.card, borderRadius: 10, padding: 14, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: Colors.textDark,
  },
  colorRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  colorOption: { width: 28, height: 28, borderRadius: 14 },
  colorOptionSelected: { borderWidth: 3, borderColor: Colors.textDark },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "700" },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: { color: Colors.textDark, fontWeight: "700" },
});
