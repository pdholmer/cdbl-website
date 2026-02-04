import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Inventory types
export type InventoryCategory = "food" | "beverage" | "snack" | "supplies" | "other";
export type UnitType = "each" | "case" | "box" | "pack" | "lb" | "oz";

export interface InventoryItem {
  id: string;
  item_name: string;
  category: InventoryCategory;
  unit_type: UnitType;
  current_quantity: number;
  minimum_quantity: number;
  unit_cost: number | null;
  sale_price: number | null;
  vendor: string | null;
  notes: string | null;
  is_active: boolean;
  last_restocked_at: string | null;
  created_at: string;
  updated_at: string;
}

// Employee types
export type EmployeeRole = "manager" | "volunteer" | "cashier";
export type EmployeeStatus = "active" | "inactive";

export interface ConcessionEmployee {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  role: EmployeeRole;
  status: EmployeeStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Shift types
export type ShiftStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";

export interface ConcessionShift {
  id: string;
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: ShiftStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: ConcessionEmployee;
}

// Inventory hooks
export const useConcessionInventory = (activeOnly = true) => {
  return useQuery({
    queryKey: ["concession-inventory", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("concession_inventory")
        .select("*")
        .order("category")
        .order("item_name");

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as InventoryItem[];
    },
  });
};

export const useInventoryMutations = () => {
  const queryClient = useQueryClient();

  const createItem = useMutation({
    mutationFn: async (item: Omit<InventoryItem, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("concession_inventory").insert(item).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concession-inventory"] });
      toast.success("Item added");
    },
    onError: () => toast.error("Failed to add item"),
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<InventoryItem>) => {
      const { data, error } = await supabase.from("concession_inventory").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concession-inventory"] });
      toast.success("Item updated");
    },
    onError: () => toast.error("Failed to update item"),
  });

  const restockItem = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data, error } = await supabase
        .from("concession_inventory")
        .update({ 
          current_quantity: quantity,
          last_restocked_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concession-inventory"] });
      toast.success("Inventory restocked");
    },
    onError: () => toast.error("Failed to restock"),
  });

  return { createItem, updateItem, restockItem };
};

// Employee hooks
export const useConcessionEmployees = (activeOnly = true) => {
  return useQuery({
    queryKey: ["concession-employees", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("concession_employees")
        .select("*")
        .order("last_name")
        .order("first_name");

      if (activeOnly) {
        query = query.eq("status", "active");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ConcessionEmployee[];
    },
  });
};

export const useEmployeeMutations = () => {
  const queryClient = useQueryClient();

  const createEmployee = useMutation({
    mutationFn: async (employee: Omit<ConcessionEmployee, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("concession_employees").insert(employee).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concession-employees"] });
      toast.success("Employee added");
    },
    onError: () => toast.error("Failed to add employee"),
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ConcessionEmployee>) => {
      const { data, error } = await supabase.from("concession_employees").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concession-employees"] });
      toast.success("Employee updated");
    },
    onError: () => toast.error("Failed to update employee"),
  });

  return { createEmployee, updateEmployee };
};

// Shift hooks
export const useConcessionShifts = (filters?: { date?: string; employeeId?: string }) => {
  return useQuery({
    queryKey: ["concession-shifts", filters],
    queryFn: async () => {
      let query = supabase
        .from("concession_shifts")
        .select(`
          *,
          employee:concession_employees(*)
        `)
        .order("shift_date")
        .order("start_time");

      if (filters?.date) {
        query = query.eq("shift_date", filters.date);
      }
      if (filters?.employeeId) {
        query = query.eq("employee_id", filters.employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ConcessionShift[];
    },
  });
};

export const useShiftMutations = () => {
  const queryClient = useQueryClient();

  const createShift = useMutation({
    mutationFn: async (shift: Omit<ConcessionShift, "id" | "created_at" | "updated_at" | "employee">) => {
      const { data, error } = await supabase.from("concession_shifts").insert(shift).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concession-shifts"] });
      toast.success("Shift created");
    },
    onError: () => toast.error("Failed to create shift"),
  });

  const updateShift = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ConcessionShift>) => {
      const { data, error } = await supabase.from("concession_shifts").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concession-shifts"] });
      toast.success("Shift updated");
    },
    onError: () => toast.error("Failed to update shift"),
  });

  const deleteShift = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("concession_shifts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concession-shifts"] });
      toast.success("Shift deleted");
    },
    onError: () => toast.error("Failed to delete shift"),
  });

  return { createShift, updateShift, deleteShift };
};

// Labels
export const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  food: "Food",
  beverage: "Beverage",
  snack: "Snack",
  supplies: "Supplies",
  other: "Other",
};

export const ROLE_LABELS: Record<EmployeeRole, string> = {
  manager: "Manager",
  volunteer: "Volunteer",
  cashier: "Cashier",
};

export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};
