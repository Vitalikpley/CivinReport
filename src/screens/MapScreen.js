import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function MapScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={{ color: colors.text }}>{t("screens.mapTitle")}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});