import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import CalendarScreen from "../screens/CalendarScreen";
import MapScreen from "../screens/MapScreen";
import NewViolationScreen from "../screens/CreateViolationScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ navigation, route }) => ({
        headerTitleAlign: "center",
        headerLeft: () => (
          <Ionicons
            name="menu"
            size={24}
            color={colors.text}
            style={{ marginLeft: 16 }}
            onPress={() => navigation.getParent()?.openDrawer()}
          />
        ),
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Calendar: focused ? "calendar" : "calendar-outline",
            Map: focused ? "map" : "map-outline",
            New: focused ? "add-circle" : "add-circle-outline",
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="New" component={NewViolationScreen} />
    </Tab.Navigator>
  );
}
