import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
  feedback_count: number;
}

export interface UserDetail extends UserProfile {
  feedback: Array<{
    id: string;
    subject: string;
    feedback_type: string;
    status: string;
    created_at: string;
  }>;
}

const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
};

const fetchUsers = async (): Promise<UserProfile[]> => {
  const headers = await getAuthHeaders();
  const { data, error } = await supabase.functions.invoke('admin-users', {
    headers,
    body: { action: 'list' },
  });
  
  if (error) {
    throw new Error(error.message || 'Failed to fetch users');
  }
  
  if (data?.error) {
    throw new Error(data.error);
  }
  
  return data?.users || [];
};

const fetchUser = async (userId: string): Promise<UserDetail> => {
  const headers = await getAuthHeaders();
  const { data, error } = await supabase.functions.invoke('admin-users', {
    headers,
    body: { action: 'get', userId },
  });
  
  if (error) {
    throw new Error(error.message || 'Failed to fetch user');
  }
  
  if (data?.error) {
    throw new Error(data.error);
  }
  
  if (!data?.user) {
    throw new Error('User not found');
  }
  
  return data.user;
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
};

export const useUser = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId!),
    enabled: !!userId,
    staleTime: 0,
    retry: 1,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roles, display_name }: { 
      userId: string; 
      roles?: string[]; 
      display_name?: string;
    }) => {
      const headers = await getAuthHeaders();
      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers,
        body: { action: 'update', userId, roles, display_name },
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to update user');
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const headers = await getAuthHeaders();
      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers,
        body: { action: 'delete', userId },
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to delete user');
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useInviteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, roles }: { email: string; roles?: string[] }) => {
      const headers = await getAuthHeaders();
      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers,
        body: { action: 'invite', email, roles },
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to invite user');
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
