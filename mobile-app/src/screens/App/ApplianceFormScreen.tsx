import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import { AppliancePayload } from '../../types/appliance';
import { useAppliances } from '../../hooks/useAppliances';
import { format } from 'date-fns';

type Props = NativeStackScreenProps<AppStackParamList, 'ApplianceForm'>;

const parseInitialDate = (value?: string) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const ApplianceFormScreen = ({ navigation, route }: Props) => {
  const editingAppliance = route.params?.appliance;
  const { createAppliance, updateAppliance } = useAppliances();
  const [name, setName] = useState(editingAppliance?.name ?? '');
  const [brand, setBrand] = useState(editingAppliance?.brand ?? '');
  const [model, setModel] = useState(editingAppliance?.model ?? '');
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(parseInitialDate(editingAppliance?.purchaseDate));
  const [warrantyDuration, setWarrantyDuration] = useState(
    editingAppliance?.warrantyDurationMonths?.toString() ?? '12',
  );
  const [serialNumber, setSerialNumber] = useState(editingAppliance?.serialNumber ?? '');
  const [purchaseLocation, setPurchaseLocation] = useState(editingAppliance?.purchaseLocation ?? '');
  const [notes, setNotes] = useState(editingAppliance?.notes ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [showPurchasePicker, setShowPurchasePicker] = useState(false);

  const formattedPurchaseDate = useMemo(
    () => (purchaseDate ? format(purchaseDate, 'PPP') : 'Select date'),
    [purchaseDate],
  );

  const handlePurchaseDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPurchasePicker(false);
    }
    if (selectedDate) {
      setPurchaseDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !brand.trim() || !model.trim() || !purchaseDate) {
      Alert.alert('Missing information', 'Name, brand, model, and purchase date are required.');
      return;
    }

    const normalizedWarranty = Number.parseInt(warrantyDuration, 10);
    if (Number.isNaN(normalizedWarranty) || normalizedWarranty <= 0) {
      Alert.alert('Invalid warranty', 'Warranty duration must be a positive number of months.');
      return;
    }

    const payload: AppliancePayload = {
      name: name.trim(),
      brand: brand.trim(),
      model: model.trim(),
      purchaseDate: purchaseDate.toISOString(),
      warrantyDurationMonths: normalizedWarranty,
      serialNumber: serialNumber.trim() || undefined,
      purchaseLocation: purchaseLocation.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    setSubmitting(true);
    try {
      if (editingAppliance) {
        await updateAppliance(editingAppliance.id, payload);
      } else {
        await createAppliance(payload);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Appliance save failed', error);
      Alert.alert('Save failed', error instanceof Error ? error.message : 'Unable to save appliance.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{editingAppliance ? 'Edit Appliance' : 'Add Appliance'}</Text>
        <Text style={styles.subtitle}>Track warranties, support contacts, and important notes.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              placeholder="Smart Refrigerator"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Brand *</Text>
            <TextInput
              placeholder="Brand"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={brand}
              onChangeText={setBrand}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Model *</Text>
            <TextInput
              placeholder="Model"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={model}
              onChangeText={setModel}
            />
          </View>
          <View style={styles.fieldRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Purchase Date *</Text>
              <Pressable
                onPress={() => setShowPurchasePicker(true)}
                style={({ pressed }) => [styles.dateInput, pressed && styles.buttonPressed]}
              >
                <Text style={[styles.dateInputText, !purchaseDate && styles.placeholderText]}>
                  {purchaseDate ? formattedPurchaseDate : 'Select date'}
                </Text>
              </Pressable>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Warranty Months *</Text>
              <TextInput
                placeholder="12"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                keyboardType="number-pad"
                value={warrantyDuration}
                onChangeText={setWarrantyDuration}
              />
            </View>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Serial Number</Text>
            <TextInput
              placeholder="Serial number"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={serialNumber}
              onChangeText={setSerialNumber}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Purchase Location</Text>
            <TextInput
              placeholder="Retailer or store"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={purchaseLocation}
              onChangeText={setPurchaseLocation}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              placeholder="Any important information"
              placeholderTextColor="#9ca3af"
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
            submitting && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {submitting ? 'Saving…' : editingAppliance ? 'Update Appliance' : 'Add Appliance'}
          </Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Cancel</Text>
        </Pressable>
      </ScrollView>

      {Platform.OS === 'android' && showPurchasePicker ? (
        <DateTimePicker
          value={purchaseDate ?? new Date()}
          mode="date"
          display="calendar"
          onChange={handlePurchaseDateChange}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal
          transparent
          animationType="slide"
          visible={showPurchasePicker}
          onRequestClose={() => setShowPurchasePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={purchaseDate ?? new Date()}
                mode="date"
                display="inline"
                onChange={handlePurchaseDateChange}
                style={styles.modalPicker}
              />
              <Pressable onPress={() => setShowPurchasePicker(false)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7ff',
  },
  container: {
    padding: 20,
    gap: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
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
  fieldGroup: {
    gap: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dateInputText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryText: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  modalPicker: {
    alignSelf: 'stretch',
  },
  modalCloseButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCloseText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
});
