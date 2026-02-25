import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserApprovalInfo, ApprovalStatus } from '../backend';
import { Principal } from '@dfinity/principal';

export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  // Include the principal in the query key so the query is re-created when
  // the identity changes. Use 'anonymous' as a stable fallback so the key
  // is always defined.
  const principalKey = identity?.getPrincipal().toString() ?? 'anonymous';
  const isAnonymous = !identity || identity.getPrincipal().isAnonymous();

  const query = useQuery<boolean>({
    queryKey: ['isAdmin', principalKey],
    queryFn: async () => {
      if (!actor) return false;
      // Never call the backend with an anonymous principal — it will always
      // return false and may pollute the cache for the authenticated session.
      if (isAnonymous) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    // Only run when we have a fully-initialized authenticated actor.
    enabled: !!actor && !actorFetching && !isAnonymous,
    // Always fetch fresh — never use stale cached admin status.
    staleTime: 0,
    // Don't keep stale data around between identity changes.
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !actorFetching && !isAnonymous && query.isFetched,
  };
}

export function useListApprovals() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principalKey = identity?.getPrincipal().toString() ?? 'anonymous';
  const isAnonymous = !identity || identity.getPrincipal().isAnonymous();

  return useQuery<UserApprovalInfo[]>({
    queryKey: ['approvals', principalKey],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching && !isAnonymous,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approvalStatus'] });
    },
  });
}
