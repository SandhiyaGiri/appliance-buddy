import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { AppStackParamList } from '../../navigation/types';
import { useAppliances } from '../../hooks/useAppliances';
import { Appliance } from '../../types/appliance';
import { getWarrantyStatus } from '../../utils/dateUtils';
import { ApplianceCard } from '../../components/ApplianceCard';
import { EmptyState } from '../../components/EmptyState';
import { StatCard } from '../../components/StatCard';

type Props = NativeStackScreenProps<AppStackParamList, 'ApplianceList'>;

type FilterKey = 'all' | 'active' | 'expiring' | 'expired';

export const ApplianceListScreen = ({ navigation }: Props) => {
  const { appliances, isLoading, isRefetching, refetch } = useAppliances();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  useEffect(() => {
    navigation.setOptions({
      title: 'Appliance Buddy',
      headerLargeTitle: false,
      headerRight: () => (
        <View style={styles.headerActions}>
          <Pressable hitSlop={12} onPress={() => navigation.navigate('Profile')}>
            {({ pressed }) => (
              <Feather name="user" size={22} color={pressed ? '#1d4ed8' : '#2563eb'} />
            )}
          </Pressable>
          <Pressable hitSlop={12} onPress={() => navigation.navigate('ApplianceForm')}>
            {({ pressed }) => (
              <Feather name="plus-circle" size={24} color={pressed ? '#1d4ed8' : '#2563eb'} />
            )}
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return appliances.filter((appliance) => {
      const matchesSearch =
        !normalized ||
        [appliance.name, appliance.brand, appliance.model]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalized));

      if (!matchesSearch) {
        return false;
      }

      if (filter === 'all') {
        return true;
      }

      const status = getWarrantyStatus(appliance.purchaseDate, appliance.warrantyDurationMonths);
      if (filter === 'active') {
        return status === 'Active';
      }
      if (filter === 'expiring') {
        return status === 'Expiring Soon';
      }
      if (filter === 'expired') {
        return status === 'Expired';
      }
      return true;
    });
  }, [appliances, filter, search]);

  const stats = useMemo(() => {
    let active = 0;
    let expiring = 0;
    let expired = 0;

    appliances.forEach((appliance) => {
      const status = getWarrantyStatus(appliance.purchaseDate, appliance.warrantyDurationMonths);
      if (status === 'Active') active += 1;
      if (status === 'Expiring Soon') expiring += 1;
      if (status === 'Expired') expired += 1;
    });

    return {
      total: appliances.length,
      active,
      expiring,
      expired,
    };
  }, [appliances]);

  const renderItem = ({ item }: { item: Appliance }) => (
    <ApplianceCard
      appliance={item}
      onPress={(appliance) => navigation.navigate('ApplianceDetail', { appliance })}
      onEdit={(appliance) => navigation.navigate('ApplianceForm', { appliance })}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}> 
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Feather name="search" size={18} color="#9ca3af" style={{ marginLeft: 8 }} />
            <TextInput
              placeholder="Search appliances"
              placeholderTextColor="#9ca3af"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
          </View>
          <View style={styles.filtersRow}>
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'active', label: 'Active' },
                { key: 'expiring', label: 'Expiring' },
                { key: 'expired', label: 'Expired' },
              ] as { key: FilterKey; label: string }[]
            ).map(({ key, label }) => (
              <Pressable
                key={key}
                onPress={() => setFilter(key)}
                style={({ pressed }) => [
                  styles.filterChip,
                  filter === key && styles.filterChipActive,
                  pressed && styles.filterChipPressed,
                ]}
              >
                <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Total Appliances"
            value={stats.total}
            icon={<Feather name="home" size={20} color="#2563eb" />}
            color="#2563eb"
          />
          <StatCard
            title="Active"
            value={stats.active}
            icon={<Feather name="check-circle" size={20} color="#16a34a" />}
            color="#16a34a"
          />
          <StatCard
            title="Expiring"
            value={stats.expiring}
            icon={<Feather name="clock" size={20} color="#f59e0b" />}
            color="#f59e0b"
          />
          <StatCard
            title="Expired"
            value={stats.expired}
            icon={<Feather name="alert-triangle" size={20} color="#dc2626" />}
            color="#dc2626"
          />
        </View>

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loaderText}>Loading your appliances…</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={filtered.length === 0 ? styles.emptyContent : styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            ListEmptyComponent={
              <EmptyState
                title={appliances.length === 0 ? 'Add your first appliance' : 'No appliances match your filters'}
                description={
                  appliances.length === 0
                    ? 'Track warranties, maintenance tasks, and important documents in one place.'
                    : 'Try adjusting your search or filter criteria.'
                }
                action={
                  appliances.length === 0 ? (
                    <Pressable
                      onPress={() => navigation.navigate('ApplianceForm')}
                      style={({ pressed }) => [styles.emptyButton, pressed && styles.buttonPressed]}
                    >
                      <Text style={styles.emptyButtonText}>Add Appliance</Text>
                    </Pressable>
                  ) : null
                }
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7ff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  searchContainer: {
    gap: 12,
    paddingTop: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: '#111827',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
  },
  filterChipPressed: {
    opacity: 0.8,
  },
  filterText: {
    color: '#1e3a8a',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  listContent: {
    paddingBottom: 24,
    gap: 16,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loaderText: {
    fontSize: 16,
    color: '#4b5563',
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
