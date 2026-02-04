import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string | null;
  requested_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  profiles?: {
    email: string;
    display_name: string | null;
  } | null;
}

export const useRoleRequests = (status?: 'pending' | 'approved' | 'rejected') => {
  return useQuery({
    queryKey: ['role-requests', status],
    queryFn: async () => {
      let query = supabase
        .from('role_requests')
        .select('*')
        .order('requested_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data: requests, error } = await query;
      
      if (error) throw error;
      
      // Fetch profiles for the users
      const userIds = [...new Set(requests.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .in('id', userIds);
      
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return requests.map(r => ({
        ...r,
        profiles: profilesMap.get(r.user_id) || null,
      })) as RoleRequest[];
    },
  });
};

export const useMyRoleRequests = () => {
  return useQuery({
    queryKey: ['my-role-requests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('role_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });
      
      if (error) throw error;
      return data as RoleRequest[];
    },
  });
};

export const useCreateRoleRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ requested_role, reason }: { requested_role: string; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('role_requests')
        .insert({
          user_id: user.id,
          requested_role: requested_role as any,
          reason: reason || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-role-requests'] });
    },
  });
};

export const useApproveRoleRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes?: string }) => {
      const { data, error } = await supabase
        .rpc('approve_role_request', { 
          request_id: requestId, 
          notes: notes || null 
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-requests'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useRejectRoleRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes?: string }) => {
      const { data, error } = await supabase
        .rpc('reject_role_request', { 
          request_id: requestId, 
          notes: notes || null 
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-requests'] });
    },
  });
};
