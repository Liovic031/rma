import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://sgdneorziwqwbkrtrics.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnZG5lb3J6aXdxd2JrcnRyaWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYyNDM2OTMsImV4cCI6MjA0MTgxOTY5M30.uNcfBieB2XkNcNF64joH2dN1MEYbwlW5RrP6nRsUuAA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
