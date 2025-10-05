import { memo } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Appliance } from '../types/appliance';
import { formatDate, getWarrantyStatus } from '../utils/dateUtils';

type Props = {
  appliance: Appliance;
  onPress: (appliance: Appliance) => void;
  onEdit: (appliance: Appliance) => void;
};

const statusColor: Record<string, string> = {
  Active: '#16a34a',
  'Expiring Soon': '#f59e0b',
  Expired: '#dc2626',
};

export const ApplianceCard = memo<Props>(({ appliance, onPress, onEdit }) => {
  const status = getWarrantyStatus(appliance.purchaseDate, appliance.warrantyDurationMonths);

  return (
    <Pressable onPress={() => onPress(appliance)} style={({ pressed }) => [styles.container, pressed && styles.pressed]}> 
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{appliance.name}</Text>
          <Text style={styles.subtitle}>{appliance.brand} · {appliance.model}</Text>
        </View>
        <Pressable hitSlop={12} onPress={() => onEdit(appliance)}>
          {({ pressed }) => (
            <Feather name="edit-3" size={20} color={pressed ? '#1d4ed8' : '#2563eb'} />
          )}
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Feather name="calendar" size={16} color="#6b7280" />
          <Text style={styles.metaText}>Purchased {formatDate(appliance.purchaseDate)}</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: statusColor[status] ?? '#6b7280' }]} />
          <Text style={[styles.statusText, { color: statusColor[status] ?? '#6b7280' }]}>{status}</Text>
        </View>
      </View>

      {appliance.serialNumber ? (
        <View style={styles.metaItem}>
          <Feather name="hash" size={16} color="#6b7280" />
          <Text style={styles.metaText}>Serial · {appliance.serialNumber}</Text>
        </View>
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pressed: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#4b5563',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#f9fafb',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
