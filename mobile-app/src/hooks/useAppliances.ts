import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Appliance, AppliancePayload } from '../types/appliance';
import { getApiUrl } from '../utils/config';
import { useAuth } from '../context/AuthContext';

const fetchJson = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, init);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const useAppliances = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const headers: Record<string, string> = token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };

  const appliancesQuery = useQuery<Appliance[]>({
    queryKey: ['appliances'],
    queryFn: async () => {
      if (!token) {
        return [];
      }

      return fetchJson<Appliance[]>(getApiUrl('appliances'), {
        headers,
      });
    },
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: AppliancePayload) => {
      if (!token) {
        throw new Error('Missing auth token');
      }

      return fetchJson<Appliance>(getApiUrl('appliances'), {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliances'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (input: { id: string; updates: Partial<AppliancePayload> }) => {
      if (!token) {
        throw new Error('Missing auth token');
      }

      return fetchJson<Appliance>(getApiUrl(`appliances/${input.id}`), {
        method: 'PUT',
        headers,
        body: JSON.stringify(input.updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliances'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!token) {
        throw new Error('Missing auth token');
      }

      await fetchJson<void>(getApiUrl(`appliances/${id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliances'] });
    },
  });

  return {
    appliances: appliancesQuery.data ?? [],
    isLoading: appliancesQuery.isLoading,
    isRefetching: appliancesQuery.isRefetching,
    refetch: appliancesQuery.refetch,
    createAppliance: createMutation.mutateAsync,
    updateAppliance: (id: string, updates: Partial<AppliancePayload>) =>
      updateMutation.mutateAsync({ id, updates }),
    deleteAppliance: deleteMutation.mutateAsync,
  };
};
