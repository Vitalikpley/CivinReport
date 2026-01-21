import { useContext } from "react";
import { View, Text, Pressable } from "react-native";
import { ThemeContext } from "../Theme/ThemeProvider";

export default function ThemeScreen() {
    const { themeKey, toggleTheme, theme } = useContext(ThemeContext);

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: theme.colors.background }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, marginBottom: 12 }}>
                Current theme: {themeKey}
            </Text>

            <Pressable
                onPress={toggleTheme}
                style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: theme.colors.primary,
                    borderRadius: 12,
                    alignSelf: "flex-start",
                }}
            >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Toggle theme</Text>
            </Pressable>
        </View>
    );
}