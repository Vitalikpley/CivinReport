import { View, Text, StyleSheet } from "react-native";

export default function NewViolationScreen() {
  return (
    <View style={styles.container}>
      <Text>New violation</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});