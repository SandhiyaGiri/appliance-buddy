import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export const ProfileScreen = () => {
  const { user, logout, refreshUser, loading } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}> 
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Feather name="user" size={28} color="#2563eb" />
          </View>
          <Text style={styles.name}>{user?.name ?? 'Account'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={refreshUser}
            style={({ pressed }) => [styles.actionButton, pressed && styles.buttonPressed]}
          >
            <Feather name="refresh-ccw" size={18} color="#2563eb" />
            <Text style={styles.actionText}>Refresh profile</Text>
          </Pressable>

          <Pressable
            onPress={logout}
            disabled={loading}
            style={({ pressed }) => [
              styles.actionButton,
              styles.logoutButton,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
          >
            <Feather name="log-out" size={18} color="#dc2626" />
            <Text style={styles.logoutText}>Sign out</Text>
          </Pressable>
        </View>
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
    padding: 20,
    gap: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0ecff',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
  },
  actions: {
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionText: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '500',
  },
  logoutButton: {
    borderColor: '#fecaca',
  },
  logoutText: {
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
