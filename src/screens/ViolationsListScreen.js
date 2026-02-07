import { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Image, useWindowDimensions } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { getOfflineViolations } from "../db/sqlite";

export default function ViolationsListScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const { width } = useWindowDimensions();
  const thumbSize = 80;

  const load = useCallback(async () => {
    try {
      const data = await getOfflineViolations();
      setList(data);
      console.log("[SQLite] Список правопорушень у консолі:", data);
    } catch (e) {
      console.warn("Load violations error:", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const renderItem = ({ item }) => (
    <View style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Image
        source={{
          uri: `data:${item.photo_mime ?? "image/jpeg"};base64,${item.photo_base64}`,
        }}
        style={[styles.thumb, { width: thumbSize, height: thumbSize }]}
        resizeMode="cover"
      />
      <View style={styles.itemBody}>
        <Text style={[styles.itemDesc, { color: colors.text }]} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={[styles.itemMeta, { color: colors.primary }]}>
          {t(`categories.${item.category}`)} • {formatDatetime(item.datetime)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {list.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ color: colors.text }}>{t("list.empty")}</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

function formatDatetime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 32 },
  item: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  thumb: { borderRadius: 8 },
  itemBody: { flex: 1, marginLeft: 12, justifyContent: "center" },
  itemDesc: { fontSize: 16, marginBottom: 4 },
  itemMeta: { fontSize: 12 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
});
