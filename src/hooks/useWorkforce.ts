import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  createJobSeekerProfile, getJobSeekerProfile, updateJobSeekerProfile, deleteJobSeekerProfile,
  getPublicJobSeekers, createJobSeekerHireRequest,
  createWorkRequest, getWorkRequests, updateWorkRequestStatus,
  getJobMatches, createJobMatch, updateJobMatchStatus,
  getWorkContracts, createWorkContract, signContract
} from '@/lib/api';

// ============================================
// Job Seeker Hooks
// ============================================

export function useCreateJobSeekerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJobSeekerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobSeekers'] });
    },
  });
}

export function useGetJobSeekerProfile(profileId?: string) {
  return useQuery({
    queryKey: ['jobSeekers', profileId],
    queryFn: () => getJobSeekerProfile(profileId),
    enabled: true,
  });
}

export function useGetAllJobSeekers() {
  return useQuery({
    queryKey: ['jobSeekers'],
    queryFn: () => getJobSeekerProfile(),
  });
}

export function useGetPublicJobSeekers(params?: { service_scope?: string }) {
  return useQuery({
    queryKey: ['publicJobSeekers', params],
    queryFn: () => getPublicJobSeekers(params),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

export function useCreateJobSeekerHireRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJobSeekerHireRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobSeekerHireRequests'] });
    },
  });
}

export function useUpdateJobSeekerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, data }: { profileId: string; data: Record<string, unknown> }) => 
      updateJobSeekerProfile(profileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobSeekers'] });
    },
  });
}

export function useDeleteJobSeekerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) => deleteJobSeekerProfile(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobSeekers'] });
    },
  });
}

// ============================================
// Work Request Hooks
// ============================================

export function useCreateWorkRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workRequests'] });
    },
  });
}

export function useGetWorkRequest(requestId?: string) {
  return useQuery({
    queryKey: ['workRequests', requestId],
    queryFn: () => getWorkRequests(requestId),
    enabled: true,
  });
}

export function useGetAllWorkRequests() {
  return useQuery({
    queryKey: ['workRequests'],
    queryFn: () => getWorkRequests(),
  });
}

export function useUpdateWorkRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: Record<string, unknown> }) => 
      updateWorkRequestStatus(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workRequests'] });
      queryClient.invalidateQueries({ queryKey: ['jobMatches'] });
    },
  });
}

// ============================================
// Job Match Hooks
// ============================================

export function useCreateJobMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJobMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobMatches'] });
      queryClient.invalidateQueries({ queryKey: ['workRequests'] });
    },
  });
}

export function useGetJobMatch(matchId?: string) {
  return useQuery({
    queryKey: ['jobMatches', matchId],
    queryFn: () => getJobMatches(matchId),
    enabled: true,
  });
}

export function useGetAllJobMatches() {
  return useQuery({
    queryKey:['jobMatches'],
    queryFn: () => getJobMatches(),
  });
}

export function useUpdateJobMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: Record<string, unknown> }) => 
      updateJobMatchStatus(matchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobMatches'] });
      queryClient.invalidateQueries({ queryKey: ['workContracts'] });
    },
  });
}

// ============================================
// Work Contract Hooks
// ============================================

export function useCreateWorkContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workContracts'] });
      queryClient.invalidateQueries({ queryKey: ['jobMatches'] });
    },
  });
}

export function useGetWorkContract(contractId?: string) {
  return useQuery({
    queryKey: ['workContracts', contractId],
    queryFn: () => getWorkContracts(contractId),
    enabled: true,
  });
}

export function useGetAllWorkContracts() {
  return useQuery({
    queryKey: ['workContracts'],
    queryFn: () => getWorkContracts(),
  });
}

export function useSignContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, signatureType }: { contractId: string; signatureType: 'contractor' | 'seeker' }) => 
      signContract(contractId, signatureType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workContracts'] });
    },
  });
}

