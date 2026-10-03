// This is the Timer screen — PunchTrack's home tab. It shows today/week stats, the big
// punch in/out button, a location picker, and today's shift log. All data comes from our
// FastAPI backend via the functions in src/api/ — this file just displays it and reacts
// to button taps.

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Colors } from "../constants/colors";
import { Shift, Location } from "../types/types";
import { getShifts } from "../api/shifts";
import { getLocations } from "../api/locations";
import { punchIn, punchOut } from "../api/shifts";
import { SafeAreaView } from "react-native-safe-area-context";
import { parseUTC } from "../utils/dates";

export default function TimerScreen() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tick, setTick] = useState(0); // forces a re-render every 30s to refresh the elapsed timer

  // The shift currently in progress, if any — newest shift in the list with no end_time yet
  const openShift = shifts.find((s) => s.end_time === null) ?? null;

  async function loadData() {
    try {
      const [shiftsData, locationsData] = await Promise.all([getShifts(), getLocations()]);
      setShifts(shiftsData);
      setLocations(locationsData);
      if (!selectedLocationId && locationsData.length > 0) {
        setSelectedLocationId(locationsData[0].id);
      }
    } catch (error) {
      Alert.alert("Error", "Could not load data. Check your backend is running.");
    } finally {
      setLoading(false);
    }
  }

  // Reload data every time this screen comes into focus (e.g. switching back from another tab)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Refresh the on-screen elapsed timer every 30 seconds while punched in — not every second,
  // to avoid a constant per-second re-render loop (see earlier battery concern discussion)
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  async function handlePunchIn() {
    if (!selectedLocationId) {
      Alert.alert("Pick a location first");
      return;
    }
    setActionLoading(true);
    try {
      await punchIn(selectedLocationId);
      await loadData();
    } catch (error) {
      Alert.alert("Error", "Could not punch in.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePunchOut() {
    setActionLoading(true);
    try {
      await punchOut();
      await loadData();
    } catch (error) {
      Alert.alert("Error", "Could not punch out.");
    } finally {
      setActionLoading(false);
    }
  }

  // ---- Stats calculations ----

  function isToday(dateString: string) {
    const d = parseUTC(dateString);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }

  function isThisWeek(dateString: string) {
    const d = parseUTC(dateString);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return d >= startOfWeek;
  }

  const completedShifts = shifts.filter((s) => s.hours_worked !== null);

  const todayHours = completedShifts
    .filter((s) => isToday(s.start_time))
    .reduce((sum, s) => sum + (s.hours_worked ?? 0), 0);

  const weekHours = completedShifts
    .filter((s) => isThisWeek(s.start_time))
    .reduce((sum, s) => sum + (s.hours_worked ?? 0), 0);

  const weekPay = completedShifts
    .filter((s) => isThisWeek(s.start_time))
    .reduce((sum, s) => sum + (s.hours_worked ?? 0) * s.location.hourly_rate, 0);

  const todaysShifts = shifts.filter((s) => isToday(s.start_time));

  // Live elapsed time for the open shift (recalculated from start_time, not a constant tick)
  function getElapsed(): string {
    if (!openShift) return "00:00:00";
    const start = parseUTC(openShift.start_time).getTime();
    const now = Date.now();
    const diffSeconds = Math.floor((now - start) / 1000);
    const h = Math.floor(diffSeconds / 3600);
    const m = Math.floor((diffSeconds % 3600) / 60);
    const s = diffSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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
          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TODAY</Text>
              <Text style={styles.statValue}>{todayHours.toFixed(1)}h</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>WEEK</Text>
              <Text style={styles.statValue}>{weekHours.toFixed(1)}h</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxHighlight]}>
              <Text style={styles.statLabel}>EST PAY</Text>
              <Text style={styles.statValue}>${weekPay.toFixed(0)}</Text>
            </View>
          </View>

          {/* Big timer */}
          <View style={styles.timerSection}>
            <Text style={styles.timerText}>{getElapsed()}</Text>
            <Text style={styles.timerSubtext}>
              {openShift ? "CURRENTLY ON CLOCK" : "CURRENTLY OFF CLOCK"}
            </Text>

            <TouchableOpacity
              style={styles.punchButton}
              onPress={openShift ? handlePunchOut : handlePunchIn}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.punchButtonText}>
                  {openShift ? "PUNCH OUT" : "PUNCH IN"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Location picker */}
          <View style={styles.locationPicker}>
            {locations.map((loc) => (
              <TouchableOpacity
                key={loc.id}
                style={[
                  styles.locationChip,
                  selectedLocationId === loc.id && { borderColor: Colors.primary, borderWidth: 2 },
                ]}
                onPress={() => setSelectedLocationId(loc.id)}
              >
                <View style={[styles.colorDot, { backgroundColor: loc.color }]} />
                <Text style={styles.locationChipText}>{loc.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Today's log */}
          <Text style={styles.sectionTitle}>TODAY'S LOG</Text>
          {todaysShifts.length === 0 ? (
            <Text style={styles.emptyText}>No shifts yet today</Text>
          ) : (
            todaysShifts.map((shift) => (
              <View key={shift.id} style={styles.logRow}>
                <View style={[styles.colorBar, { backgroundColor: shift.location.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.logTime}>
                    {parseUTC(shift.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" - "}
                    {shift.end_time
                      ? parseUTC(shift.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "now"}
                  </Text>
                  <Text style={styles.logLocation}>{shift.location.name}</Text>
                </View>
                <Text style={styles.logHours}>
                  {shift.hours_worked !== null ? `${shift.hours_worked.toFixed(1)}h` : "—"}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  statBox: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statBoxHighlight: { backgroundColor: "#DCE3F7" },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: "600" },
  statValue: { fontSize: 20, fontWeight: "700", color: Colors.textDark, marginTop: 4 },
  timerSection: { alignItems: "center", marginBottom: 24 },
  timerText: { fontSize: 44, fontWeight: "800", color: Colors.primary, letterSpacing: 2 },
  timerSubtext: { fontSize: 12, color: Colors.textMuted, fontWeight: "600", marginTop: 4, marginBottom: 24 },
  punchButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  punchButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  locationPicker: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  locationChipText: { color: Colors.textDark, fontWeight: "500" },
  sectionTitle: { fontSize: 12, color: Colors.textMuted, fontWeight: "700", marginBottom: 8 },
  emptyText: { color: Colors.textMuted, fontStyle: "italic" },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  colorBar: { width: 4, height: 32, borderRadius: 2, marginRight: 12 },
  logTime: { fontWeight: "600", color: Colors.textDark },
  logLocation: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  logHours: { fontWeight: "700", color: Colors.textDark, fontSize: 16 },
});
