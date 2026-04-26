import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (optional, can be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          name: string;
          email?: string;
          phone?: string;
          address?: string;
          category: string;
          balance: number;
          debt: number;
          createdAt: string;
        };
      };
      sales: {
        Row: {
          id: string;
          customerId: string;
          totalAmount: number;
          amount?: number;
          createdAt?: string;
          date?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          price: number;
          category: string;
        };
      };
    };
  };
};
