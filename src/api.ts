import { supabase } from './lib/supabase';

export async function api(path: string, options: any = {}): Promise<any> {
  console.log('API call:', path, options);
  return { ok: true, message: 'Using Supabase client directly - this function is deprecated' };
}

export { supabase };
