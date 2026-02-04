import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RegistrationCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed' | 'free';
  discount_value: number;
  program_id: string | null;
  division_id: string | null;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  programs?: { name: string } | null;
  divisions?: { name: string } | null;
}

export interface RegistrationCodeInsert {
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed' | 'free';
  discount_value: number;
  program_id?: string;
  division_id?: string;
  max_uses?: number;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
}

export interface CodeValidationResult {
  is_valid: boolean;
  code_id: string | null;
  discount_type: string | null;
  discount_value: number | null;
  error_message: string | null;
}

export const useRegistrationCodes = () => {
  return useQuery({
    queryKey: ['registration-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registration_codes')
        .select(`
          *,
          programs(name),
          divisions(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RegistrationCode[];
    },
  });
};

export const useRegistrationCode = (id: string | undefined) => {
  return useQuery({
    queryKey: ['registration-codes', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('registration_codes')
        .select(`
          *,
          programs(name),
          divisions(name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as RegistrationCode;
    },
    enabled: !!id,
  });
};

export const useCreateRegistrationCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (code: RegistrationCodeInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('registration_codes')
        .insert({
          ...code,
          created_by: user?.id,
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registration-codes'] });
    },
  });
};

export const useUpdateRegistrationCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RegistrationCodeInsert> & { id: string }) => {
      const { data, error } = await supabase
        .from('registration_codes')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registration-codes'] });
    },
  });
};

export const useDeleteRegistrationCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('registration_codes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registration-codes'] });
    },
  });
};

export const useValidateRegistrationCode = () => {
  return useMutation({
    mutationFn: async ({ 
      code, 
      programId, 
      divisionId 
    }: { 
      code: string; 
      programId?: string; 
      divisionId?: string;
    }) => {
      const { data, error } = await supabase
        .rpc('validate_registration_code', {
          _code: code,
          _program_id: programId || null,
          _division_id: divisionId || null,
        });
      
      if (error) throw error;
      
      // The function returns an array with one row
      const result = data?.[0] as CodeValidationResult;
      return result;
    },
  });
};

export const useRedeemRegistrationCode = () => {
  return useMutation({
    mutationFn: async ({
      codeId,
      playerId,
      originalAmount,
      discountApplied,
      finalAmount,
    }: {
      codeId: string;
      playerId?: string;
      originalAmount?: number;
      discountApplied?: number;
      finalAmount?: number;
    }) => {
      const { data, error } = await supabase
        .rpc('redeem_registration_code', {
          _code_id: codeId,
          _player_id: playerId || null,
          _original_amount: originalAmount || null,
          _discount_applied: discountApplied || null,
          _final_amount: finalAmount || null,
        });
      
      if (error) throw error;
      return data;
    },
  });
};

// Helper to generate a random code
export const generateRandomCode = (length: number = 8): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoiding ambiguous chars
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
