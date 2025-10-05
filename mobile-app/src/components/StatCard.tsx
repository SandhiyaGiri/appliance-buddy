import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type StatCardProps = {
  title: string;
  value: number;
  icon?: ReactNode;
  color?: string;
};

export const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  return (
    <View style={[styles.container, color ? { borderColor: color } : undefined]}> 
      <View style={styles.header}>
        {icon}
        <Text style={styles.value}>{value}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  title: {
    fontSize: 14,
    color: '#6b7280',
  },
});
