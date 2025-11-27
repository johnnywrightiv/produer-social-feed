'use client';

import { createClient, Provider, fetchExchange } from 'urql';
import { useMemo } from 'react';
import { createClient as createSupabaseClient } from '@/app/lib/supabase';

export function Providers({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    const supabase = createSupabaseClient();
    
    return createClient({
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`,
      exchanges: [fetchExchange],
      // Supabase GraphQL expects POST requests; disable GET-for-queries
      preferGetMethod: false,
      // Force-attach Supabase auth headers on every GraphQL request
      fetch: async (input, init) => {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token;

        const headers: HeadersInit = {
          ...(init?.headers || {}),
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        return fetch(input, {
          ...init,
          headers,
        });
      },
    });
  }, []);

  return <Provider value={client}>{children}</Provider>;
}

