import { createContext, useContext, useEffect, useState, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "auth_token";
const USER_DATA_KEY = "user_data";

export const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    login: async () => {},
    register: async () => {},
    logout: async () => {},
    isReady: false,
});

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
                const userData = await AsyncStorage.getItem(USER_DATA_KEY);
                if (token && userData) {
                    setIsAuthenticated(true);
                    setUser(JSON.parse(userData));
                }
            } catch (e) {
                console.warn("Auth init error:", e);
            } finally {
                setIsReady(true);
            }
        })();
    }, []);

    const login = async (email, password) => {
        // TODO: замінити на реальний запит до бекенду
        console.log("[Auth] Login attempt:", { email, password });
        
        // Заглушка: зберігаємо токен і дані користувача
        const mockToken = `token_${Date.now()}`;
        const mockUser = { email, firstName: "User", lastName: "Test" };
        
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, mockToken);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(mockUser));
        
        setIsAuthenticated(true);
        setUser(mockUser);
        
        return { success: true };
    };

    const register = async (firstName, lastName, email, password) => {
        // TODO: замінити на реальний запит до бекенду
        console.log("[Auth] Register attempt:", { firstName, lastName, email, password });
        
        // Заглушка: зберігаємо токен і дані користувача
        const mockToken = `token_${Date.now()}`;
        const mockUser = { email, firstName, lastName };
        
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, mockToken);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(mockUser));
        
        setIsAuthenticated(true);
        setUser(mockUser);
        
        return { success: true };
    };

    const logout = async () => {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        await AsyncStorage.removeItem(USER_DATA_KEY);
        setIsAuthenticated(false);
        setUser(null);
        console.log("[Auth] Logged out");
    };

    const value = useMemo(
        () => ({
            isAuthenticated,
            user,
            login,
            register,
            logout,
            isReady,
        }),
        [isAuthenticated, user, isReady]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
