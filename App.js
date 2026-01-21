import { useContext } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { ThemeProvider, ThemeContext } from "./src/Theme/ThemeProvider";
import { LanguageProvider, LanguageContext } from "./src/i18n/languageProvider";
import DrawerNavigator from "./src/navigation/DrawersNavigator";

function AppInner() {
    const { theme, isReady } = useContext(ThemeContext);
    const { isReady: isLangReady } = useContext(LanguageContext);
    if (!isReady || !isLangReady) return null;

    const navTheme =
        theme.mode === "dark"
            ? { ...DarkTheme, colors: { ...DarkTheme.colors, ...theme.colors } }
            : { ...DefaultTheme, colors: { ...DefaultTheme.colors, ...theme.colors } };

    const isDark = theme.mode === "dark";

    return (
        <>
            <StatusBar style={isDark ? "light" : "dark"} />
            <NavigationContainer theme={navTheme}>
                <DrawerNavigator />
            </NavigationContainer>
        </>
    );
}

export default function App() {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <AppInner />
            </ThemeProvider>
        </LanguageProvider>
    );
}
