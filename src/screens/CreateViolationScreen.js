import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  Image,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import { insertOfflineViolation, getOfflineViolations } from "../db/sqlite";
import { VIOLATION_CATEGORY_KEYS } from "../constants/categories";

export default function CreateViolationScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(VIOLATION_CATEGORY_KEYS[0]);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [photoMime, setPhotoMime] = useState(null);
  const [saving, setSaving] = useState(false);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("violation.takePhoto"), "Дозвіл камери потрібен для зйомки.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setPhotoBase64(asset.base64 ?? null);
      setPhotoMime(asset.mimeType ?? "image/jpeg");
    }
  };

  const save = async () => {
    if (!description.trim()) {
      Alert.alert("", "Введіть опис.");
      return;
    }
    if (!photoBase64) {
      Alert.alert("", "Зробіть фото.");
      return;
    }
    setSaving(true);
    try {
      const datetime = new Date().toISOString();
      await insertOfflineViolation({
        description: description.trim(),
        category,
        datetime,
        photoBase64,
        photoMime: photoMime ?? "image/jpeg",
      });
      const all = await getOfflineViolations();
      console.log("[SQLite] Збережені правопорушення:", all);
      Alert.alert("", t("violation.saved"));
      setDescription("");
      setCategory(VIOLATION_CATEGORY_KEYS[0]);
      setPhotoBase64(null);
      setPhotoMime(null);
    } catch (e) {
      console.warn("Save violation error:", e);
      Alert.alert("", "Помилка збереження.");
    } finally {
      setSaving(false);
    }
  };

  const { width } = useWindowDimensions();
  const thumbSize = Math.min(width - 32, 120);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        onPress={takePhoto}
        style={[styles.photoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        {photoBase64 ? (
          <Image
            source={{ uri: `data:${photoMime ?? "image/jpeg"};base64,${photoBase64}` }}
            style={{ width: thumbSize, height: thumbSize, borderRadius: 8 }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ color: colors.text }}>{t("violation.takePhoto")}</Text>
        )}
      </Pressable>

      <Text style={[styles.label, { color: colors.text }]}>{t("violation.description")}</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholderTextColor={colors.border}
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder="..."
        multiline
        numberOfLines={3}
      />

      <Text style={[styles.label, { color: colors.text }]}>{t("violation.category")}</Text>
      <View style={styles.categoryRow}>
        {VIOLATION_CATEGORY_KEYS.map((key) => (
          <Pressable
            key={key}
            onPress={() => setCategory(key)}
            style={[
              styles.categoryChip,
              { backgroundColor: category === key ? colors.primary : colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.categoryText, { color: category === key ? "#fff" : colors.text }]}>
              {t(`categories.${key}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={save}
        disabled={saving}
        style={[styles.saveBtn, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.saveBtnText}>{saving ? "..." : t("violation.save")}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  photoBox: {
    width: "100%",
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 16,
  },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: { fontSize: 14 },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
