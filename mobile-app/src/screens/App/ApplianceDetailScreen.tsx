import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLayoutEffect } from 'react';
import { formatDate, getWarrantyStatus } from '../../utils/dateUtils';
import type { AppStackParamList } from '../../navigation/types';
import { useAppliances } from '../../hooks/useAppliances';

type Props = NativeStackScreenProps<AppStackParamList, 'ApplianceDetail'>;

export const ApplianceDetailScreen = ({ navigation, route }: Props) => {
  const { appliance } = route.params;
  const { deleteAppliance } = useAppliances();
  const status = getWarrantyStatus(appliance.purchaseDate, appliance.warrantyDurationMonths);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: appliance.name,
      headerRight: () => (
        <View style={styles.headerButtons}>
          <Pressable
            hitSlop={12}
            onPress={() => navigation.navigate('ApplianceForm', { appliance })}
          >
            {({ pressed }) => (
              <Feather name="edit-3" size={22} color={pressed ? '#1d4ed8' : '#2563eb'} />
            )}
          </Pressable>
          <Pressable
            hitSlop={12}
            onPress={() =>
              Alert.alert('Delete appliance', 'Are you sure you want to delete this appliance?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    await deleteAppliance(appliance.id);
                    navigation.popToTop();
                  },
                },
              ])
            }
          >
            {({ pressed }) => (
              <Feather name="trash-2" size={22} color={pressed ? '#b91c1c' : '#dc2626'} />
            )}
          </Pressable>
        </View>
      ),
    });
  }, [appliance, deleteAppliance, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}> 
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.row}>
            <Feather name="home" size={18} color="#2563eb" />
            <View>
              <Text style={styles.rowTitle}>{appliance.brand}</Text>
              <Text style={styles.rowSubtitle}>Model {appliance.model}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Feather name="calendar" size={18} color="#2563eb" />
            <View>
              <Text style={styles.rowTitle}>Purchased {formatDate(appliance.purchaseDate)}</Text>
              <Text style={styles.rowSubtitle}>
                Warranty · {appliance.warrantyDurationMonths} month{appliance.warrantyDurationMonths === 1 ? '' : 's'}
              </Text>
            </View>
          </View>
          {appliance.serialNumber ? (
            <View style={styles.row}>
              <Feather name="hash" size={18} color="#2563eb" />
              <View>
                <Text style={styles.rowTitle}>Serial number</Text>
                <Text style={styles.rowSubtitle}>{appliance.serialNumber}</Text>
              </View>
            </View>
          ) : null}
          {appliance.purchaseLocation ? (
            <View style={styles.row}>
              <Feather name="map-pin" size={18} color="#2563eb" />
              <View>
                <Text style={styles.rowTitle}>Purchased at</Text>
                <Text style={styles.rowSubtitle}>{appliance.purchaseLocation}</Text>
              </View>
            </View>
          ) : null}
          <View style={styles.statusPill}>
            <View
              style={[styles.statusDot, status === 'Active' ? styles.statusDotActive : status === 'Expiring Soon' ? styles.statusDotExpiring : styles.statusDotExpired]}
            />
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        {appliance.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{appliance.notes}</Text>
          </View>
        ) : null}

        {appliance.supportContacts?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support Contacts</Text>
            {appliance.supportContacts.map((contact) => (
              <View key={contact.id} style={styles.card}>
                <Text style={styles.cardTitle}>{contact.name}</Text>
                {contact.company ? <Text style={styles.cardSubtitle}>{contact.company}</Text> : null}
                {contact.phone ? <Text style={styles.cardDetail}>Phone · {contact.phone}</Text> : null}
                {contact.email ? <Text style={styles.cardDetail}>Email · {contact.email}</Text> : null}
                {contact.notes ? <Text style={styles.cardDetail}>{contact.notes}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {appliance.maintenanceTasks?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Maintenance</Text>
            {appliance.maintenanceTasks.map((task) => (
              <View key={task.id} style={styles.card}>
                <Text style={styles.cardTitle}>{task.taskName}</Text>
                <Text style={styles.cardDetail}>Scheduled · {formatDate(task.scheduledDate)}</Text>
                <Text style={styles.cardDetail}>Status · {task.status}</Text>
                {task.notes ? <Text style={styles.cardDetail}>{task.notes}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {appliance.linkedDocuments?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documents</Text>
            {appliance.linkedDocuments.map((doc) => (
              <View key={doc.id} style={styles.card}>
                <Text style={styles.cardTitle}>{doc.title}</Text>
                <Text style={[styles.cardDetail, styles.linkText]} numberOfLines={1}>
                  {doc.url}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7ff',
  },
  container: {
    padding: 20,
    gap: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  rowSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  statusDotActive: {
    backgroundColor: '#16a34a',
  },
  statusDotExpiring: {
    backgroundColor: '#f59e0b',
  },
  statusDotExpired: {
    backgroundColor: '#dc2626',
  },
  statusText: {
    fontWeight: '600',
    color: '#1e3a8a',
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#4b5563',
  },
  cardDetail: {
    fontSize: 13,
    color: '#6b7280',
  },
  linkText: {
    color: '#2563eb',
  },
});
