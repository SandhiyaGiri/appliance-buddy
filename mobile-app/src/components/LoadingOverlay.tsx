import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type Props = {
  text?: string;
};

export const LoadingOverlay = ({ text = 'Loading...' }: Props) => (
  <View style={styles.container}>
    <View style={styles.card}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.text}>{text}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.3)',
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    minWidth: 200,
  },
  text: {
    fontSize: 16,
    color: '#111827',
  },
});
