import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";

export default function LanguageScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Вибір мови</Text>
      <View style={styles.options}>
        <TouchableOpacity style={[styles.option, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.optionText, { color: colors.text }]}>Українська</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.option, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.optionText, { color: colors.text }]}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.option, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.optionText, { color: colors.text }]}>Русский</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 24,
  },
  options: {
    gap: 12,
  },
  option: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
});
