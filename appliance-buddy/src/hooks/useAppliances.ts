import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Appliance } from '@/types/appliance';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useAppliances = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  // Fetch all appliances
  const { data: appliances = [], isLoading: loading } = useQuery({
    queryKey: ['appliances'],
    queryFn: async () => {
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(`${API_BASE_URL}/appliances`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch appliances');
      return response.json();
    },
    enabled: !!token, // Only run query if token exists
  });

  // Create appliance mutation
  const createMutation = useMutation({
    mutationFn: async (applianceData: Omit<Appliance, 'id' | 'supportContacts' | 'maintenanceTasks' | 'linkedDocuments'>) => {
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(`${API_BASE_URL}/appliances`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(applianceData),
      });
      if (!response.ok) throw new Error('Failed to create appliance');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliances'] });
    },
  });

  // Update appliance mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Appliance> }) => {
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(`${API_BASE_URL}/appliances/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update appliance');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliances'] });
    },
  });

  // Delete appliance mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(`${API_BASE_URL}/appliances/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete appliance');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliances'] });
    },
  });

  return {
    appliances,
    loading,
    addAppliance: createMutation.mutate,
    updateAppliance: (id: string, updates: Partial<Appliance>) => 
      updateMutation.mutate({ id, updates }),
    deleteAppliance: deleteMutation.mutate,
    resetToSampleData: () => {
      // TODO: Implement reset functionality
      console.log('Reset to sample data not implemented yet');
    },
  };
};