import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { VestingSchedule } from '../backend';

export function useGetAllVestingSchedules() {
  const { actor, isFetching } = useActor();

  return useQuery<VestingSchedule[]>({
    queryKey: ['vestingSchedules'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVestingSchedules();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveVestingSchedule() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (schedule: VestingSchedule) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveVestingSchedule(schedule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vestingSchedules'] });
    },
  });
}

export function useDeleteVestingSchedule() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteVestingSchedule(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vestingSchedules'] });
    },
  });
}
