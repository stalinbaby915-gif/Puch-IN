// The History tab — shows this week's total hours/earnings, then a full list of past
// shifts grouped by date. Pulls the same shift data as the Timer screen, just displayed
// differently (a full log instead of just today).

import { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { Colors } from "../constants/colors";
import { Shift } from "../types/types";
import { getShifts } from "../api/shifts";
import { SafeAreaView } from "react-native-safe-area-context";
import { parseUTC } from "../utils/dates";

export default function HistoryScreen() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getShifts()
        .then(setShifts)
        .finally(() => setLoading(false));
    }, [])
  );

  function isThisWeek(dateString: string) {
    const d = parseUTC(dateString);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return d >= startOfWeek;
  }

  const completedShifts = shifts.filter((s) => s.hours_worked !== null);

  const weekHours = completedShifts
    .filter((s) => isThisWeek(s.start_time))
    .reduce((sum, s) => sum + (s.hours_worked ?? 0), 0);

  const weekEarnings = completedShifts
    .filter((s) => isThisWeek(s.start_time))
    .reduce((sum, s) => sum + (s.hours_worked ?? 0) * s.location.hourly_rate, 0);

  // Group completed shifts by date (e.g. "Today, Oct 24") for section headers
  const grouped: { [dateLabel: string]: Shift[] } = {};
  for (const shift of completedShifts) {
    const d = parseUTC(shift.start_time);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let label: string;
    if (d.toDateString() === today.toDateString()) {
      label = "Today, " + d.toLocaleDateString([], { month: "short", day: "numeric" });
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = "Yesterday, " + d.toLocaleDateString([], { month: "short", day: "numeric" });
    } else {
      label = d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
    }

    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(shift);
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
        <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.header}>Work History</Text>
        <Text style={styles.subheader}>Review your logged hours and earnings.</Text>

        <View style={styles.statCard}>
            <Text style={styles.statLabel}>THIS WEEK</Text>
            <Text style={styles.statValue}>{weekHours.toFixed(1)}h</Text>
        </View>
        <View style={styles.statCard}>
            <Text style={styles.statLabel}>EARNINGS</Text>
            <Text style={styles.statValue}>${weekEarnings.toFixed(2)}</Text>
        </View>

        {Object.keys(grouped).length === 0 ? (
            <Text style={styles.emptyText}>No shifts logged yet</Text>
        ) : (
            Object.entries(grouped).map(([dateLabel, dayShifts]) => (
            <View key={dateLabel} style={{ marginTop: 20 }}>
                <Text style={styles.dateLabel}>{dateLabel.toUpperCase()}</Text>
                {dayShifts.map((shift) => (
                <View key={shift.id} style={styles.logRow}>
                    <View style={{ flex: 1 }}>
                    <Text style={styles.logTime}>
                        {parseUTC(shift.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {" - "}
                        {shift.end_time
                        ? parseUTC(shift.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </Text>
                    <Text style={styles.logLocation}>{shift.location.name}</Text>
                    </View>
                    <Text style={styles.logHours}>{shift.hours_worked?.toFixed(2)}</Text>
                </View>
                ))}
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
  header: { fontSize: 24, fontWeight: "800", color: Colors.textDark },
  subheader: { color: Colors.textMuted, marginTop: 4, marginBottom: 20 },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: "600" },
  statValue: { fontSize: 28, fontWeight: "800", color: Colors.primary, marginTop: 4 },
  emptyText: { color: Colors.textMuted, fontStyle: "italic", marginTop: 20 },
  dateLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: "700", marginBottom: 8 },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  logTime: { fontWeight: "600", color: Colors.textDark },
  logLocation: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  logHours: { fontWeight: "700", color: Colors.textDark, fontSize: 18 },
});
