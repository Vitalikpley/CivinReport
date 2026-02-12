import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { fetchViolations } from "../db/sqlite";

export default function MapScreen() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [violations, setViolations] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadViolations = useCallback(async () => {
        try {
            const data = await fetchViolations();
            // Фільтруємо тільки ті, що мають геолокацію
            const withLocation = data.filter(
                (v) => v.latitude != null && v.longitude != null
            );
            setViolations(withLocation);
            console.log("[Map] Violations with location:", withLocation.length);
        } catch (e) {
            console.warn("Load violations error:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const getCurrentLocation = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                    const currentLocation = await Location.getCurrentPositionAsync({});
                    setUserLocation(currentLocation);
                }
            } catch (e) {
                console.warn("Location error:", e);
            }
        };
        getCurrentLocation();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadViolations();
        }, [loadViolations])
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 49.0,
                    longitude: 30.0,
                    latitudeDelta: 7,
                    longitudeDelta: 7,
                }}
                showsUserLocation={false} //userLocation != null
            >
                {violations.map((violation) => (
                    <Marker
                        key={violation.id}
                        coordinate={{
                            latitude: violation.latitude,
                            longitude: violation.longitude,
                        }}
                        title={t(`categories.${violation.category}`)}
                        description={violation.description}
                    >

                        <View style={styles.marker}>
                            <View style={styles.markerDot} />
                        </View>
                    </Marker>

                ))}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: "100%",
        height: "100%",
    },
    marker: {
        alignItems: "center",
        justifyContent: "center",
    },
    markerDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#FF0000",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
});
