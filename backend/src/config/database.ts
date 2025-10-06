import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vejihuzhsoixppcyghdw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(supabaseKey);
const createSupabaseClient = (): SupabaseClient => {
  if (!supabaseKey) {
    console.warn('⚠️  Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY. Booting without DB.');
    // Create a dummy client that throws on use to avoid crashes at import time
    return {
      auth: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async getUser(_token?: string) { throw new Error('Supabase not configured'); },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async signUp(_args: unknown) { throw new Error('Supabase not configured'); },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async signInWithPassword(_args: unknown) { throw new Error('Supabase not configured'); },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async signOut() { throw new Error('Supabase not configured'); },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async refreshSession(_args: unknown) { throw new Error('Supabase not configured'); },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async updateUser(_args: unknown) { throw new Error('Supabase not configured'); },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async resetPasswordForEmail(_email: string, _opts?: unknown) { throw new Error('Supabase not configured'); },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async setSession(_args: unknown) { throw new Error('Supabase not configured'); }
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      from(_table: string) { throw new Error('Supabase not configured'); },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      rpc(_fn: string, _args?: unknown) { throw new Error('Supabase not configured'); }
    } as unknown as SupabaseClient;
  }

  console.log('🔗 Connecting to Supabase...');
  const client = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Connected to Supabase');
  return client;
};

export const supabase = createSupabaseClient();

// Create a simple database interface that works with Supabase
export const supabaseClient = supabase;

export const db = {
  // For testing database connection
  execute: async (query: any) => {
    try {
      const { data, error } = await supabase.rpc('execute_sql', { sql: query });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
};