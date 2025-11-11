import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  createSpecialistProfile, getSpecialistProfile, updateSpecialistProfile,
  getPublicSpecialists, createSpecialistHireRequest, getSpecialistHireRequests,
  approveSpecialistProfile, getAllSpecialistsForAdmin
} from '@/lib/api';

// ============================================
// Specialist Profile Hooks
// ============================================

export function useCreateSpecialistProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSpecialistProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialist-profiles'] });
    },
  });
}

export function useGetSpecialistProfile(profileId?: string) {
  return useQuery({
    queryKey: ['specialist-profiles', profileId],
    queryFn: () => getSpecialistProfile(profileId),
    enabled: true,
  });
}

export function useGetPublicSpecialists(params?: { province?: string; city?: string }) {
  return useQuery({
    queryKey: ['public-specialists', params],
    queryFn: () => getPublicSpecialists(params),
  });
}

export function useUpdateSpecialistProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, data }: { profileId: string; data: Record<string, unknown> }) => 
      updateSpecialistProfile(profileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialist-profiles'] });
    },
  });
}

// ============================================
// Specialist Hire Request Hooks
// ============================================

export function useCreateHireRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSpecialistHireRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialist-hire-requests'] });
    },
  });
}

export function useGetSpecialistHireRequests(requestId?: string) {
  return useQuery({
    queryKey: ['specialist-hire-requests', requestId],
    queryFn: () => getSpecialistHireRequests(requestId),
    enabled: true,
  });
}

// ============================================
// Admin Specialist Management Hooks
// ============================================

export function useApproveSpecialistProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ specialistId, data }: { specialistId: string; data: { is_approved: boolean; admin_notes?: string } }) => 
      approveSpecialistProfile(specialistId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialist-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['public-specialists'] });
    },
  });
}

export function useGetAllSpecialistsForAdmin() {
  return useQuery({
    queryKey: ['admin-specialists'],
    queryFn: () => getAllSpecialistsForAdmin(),
  });
}

