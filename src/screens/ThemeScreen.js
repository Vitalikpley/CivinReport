import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function ThemeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вибір теми</Text>
      <View style={styles.options}>
        <TouchableOpacity style={[styles.option, styles.light]}>
          <Text style={styles.optionText}>Світла</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.option, styles.dark]}>
          <Text style={[styles.optionText, styles.darkText]}>Темна</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    borderColor: "#e0e0e0",
  },
  light: {
    backgroundColor: "#f5f5f5",
  },
  dark: {
    backgroundColor: "#1a1a1a",
  },
  optionText: {
    fontSize: 16,
  },
  darkText: {
    color: "#fff",
  },
});
