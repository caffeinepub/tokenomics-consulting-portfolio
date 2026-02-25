import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { SavedSession } from '../backend';

export function useGetAllSessions() {
  const { actor, isFetching } = useActor();

  return useQuery<SavedSession[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSession(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<SavedSession>({
    queryKey: ['session', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSession(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useSaveSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: SavedSession) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveSession(session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
