import { addMonths, isAfter, isBefore, differenceInDays } from 'date-fns';
import { WarrantyStatus } from '@/types/appliance';

export const calculateWarrantyEndDate = (purchaseDate: Date | string, warrantyDurationMonths: number): Date => {
  const dateObj = typeof purchaseDate === 'string' ? new Date(purchaseDate) : purchaseDate;
  return addMonths(dateObj, warrantyDurationMonths);
};

export const getWarrantyStatus = (purchaseDate: Date | string, warrantyDurationMonths: number): WarrantyStatus => {
  const now = new Date();
  const warrantyEndDate = calculateWarrantyEndDate(purchaseDate, warrantyDurationMonths);
  const daysUntilExpiry = differenceInDays(warrantyEndDate, now);

  if (isAfter(now, warrantyEndDate)) {
    return 'Expired';
  } else if (daysUntilExpiry <= 30) {
    return 'Expiring Soon';
  } else {
    return 'Active';
  }
};

export const getMaintenanceStatus = (scheduledDate: Date | string, completedDate?: Date | string) => {
  if (completedDate) {
    return 'Completed';
  }
  
  const now = new Date();
  const scheduledDateObj = typeof scheduledDate === 'string' ? new Date(scheduledDate) : scheduledDate;
  
  if (isBefore(scheduledDateObj, now)) {
    return 'Overdue';
  }
  
  return 'Upcoming';
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};