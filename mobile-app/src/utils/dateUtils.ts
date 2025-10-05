import { addMonths, differenceInDays, isAfter } from 'date-fns';
import { WarrantyStatus } from '../types/appliance';

export const calculateWarrantyEndDate = (purchaseDate: string, warrantyDurationMonths: number) => {
  return addMonths(new Date(purchaseDate), warrantyDurationMonths);
};

export const getWarrantyStatus = (purchaseDate: string, warrantyDurationMonths: number): WarrantyStatus => {
  const now = new Date();
  const endDate = calculateWarrantyEndDate(purchaseDate, warrantyDurationMonths);
  const daysUntilExpiry = differenceInDays(endDate, now);

  if (isAfter(now, endDate)) {
    return 'Expired';
  }

  if (daysUntilExpiry <= 30) {
    return 'Expiring Soon';
  }

  return 'Active';
};

export const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
