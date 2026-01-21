import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { DrawerActions } from "@react-navigation/native";
import BottomTabs from "./BottomTabs";

import ProfileScreen from "../screens/ProfileScreen";
import ThemeScreen from "../screens/ThemeScreen";
import LanguageScreen from "../screens/LanguageScreen";

const Drawer = createDrawerNavigator();

function onLogout() {

}

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Вихід"
        icon={({ color, size }) => (
          <Ionicons name="log-out" size={size} color={color} />
        )}
        onPress={() => {
          props.navigation.closeDrawer();
          onLogout();
        }}
      />
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation, route }) => ({
        headerLeft: () => (
          <Pressable
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            style={{ paddingHorizontal: 16 }}
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </Pressable>
        ),
        drawerIcon: ({ color, size }) => {
          const icons = {
            Home: "home",
            Profile: "person",
            Theme: "moon",
            Language: "language",
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Drawer.Screen
        name="Home"
        component={BottomTabs}
        options={{
          headerShown: false,
          title: "Головна",
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Профіль" }}
      />
      <Drawer.Screen
        name="Theme"
        component={ThemeScreen}
        options={{ title: "Вибір теми" }}
      />
      <Drawer.Screen
        name="Language"
        component={LanguageScreen}
        options={{ title: "Вибір мови" }}
      />
    </Drawer.Navigator>
  );
}
