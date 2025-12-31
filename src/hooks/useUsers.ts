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
  const { data } = await supabase.functions.invoke('admin-users', {
    headers,
  });
  
  if (data?.error) {
    throw new Error(data.error);
  }
  
  return data?.users || [];
};

const fetchUser = async (userId: string): Promise<UserDetail> => {
  const headers = await getAuthHeaders();
  const { data } = await supabase.functions.invoke(`admin-users/${userId}`, {
    headers,
  });
  
  if (data?.error) {
    throw new Error(data.error);
  }
  
  return data?.user;
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
      const { data } = await supabase.functions.invoke(`admin-users/${userId}`, {
        method: 'PATCH',
        headers,
        body: { roles, display_name },
      });
      
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
      const { data } = await supabase.functions.invoke(`admin-users/${userId}`, {
        method: 'DELETE',
        headers,
      });
      
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
      const { data } = await supabase.functions.invoke('admin-users', {
        method: 'POST',
        headers,
        body: { email, roles },
      });
      
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
