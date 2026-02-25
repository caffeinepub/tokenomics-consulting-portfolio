import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useApprovalStatus() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  // Include the principal in the query key so the query is re-created when
  // the identity changes. Use 'anonymous' as a stable fallback.
  const principalKey = identity?.getPrincipal().toString() ?? 'anonymous';
  const isAnonymous = !identity || identity.getPrincipal().isAnonymous();

  const query = useQuery<boolean>({
    queryKey: ['approvalStatus', principalKey],
    queryFn: async () => {
      if (!actor) return false;
      // Never call the backend with an anonymous principal.
      if (isAnonymous) return false;
      try {
        return await actor.isCallerApproved();
      } catch {
        return false;
      }
    },
    // Only run when we have a fully-initialized authenticated actor.
    enabled: !!actor && !actorFetching && !isAnonymous,
    refetchOnMount: 'always',
    staleTime: 0,
    // Don't keep stale data around between identity changes.
    gcTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !actorFetching && !isAnonymous && query.isFetched,
    isApproved: query.data === true,
  };
}
