import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL yoki Anon Key mavjud emas. .env faylni tekshiring.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Malumotlarni olish (SELECT)
export async function getData(table: string, options?: { 
  filters?: Record<string, any>;
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
}) {
  let query = supabase.from(table).select('*');

  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? true });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Supabase ${table} dan malumot olish xatosi:`, error);
    throw error;
  }

  return data;
}

// Bitta malumot olish
export async function getSingleData(table: string, id: string | number) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Supabase ${table} dan bitta malumot olish xatosi:`, error);
    throw error;
  }

  return data;
}

// Malumot qo'shish (INSERT)
export async function insertData(table: string, data: Record<string, any>) {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error(`Supabase ${table} ga malumot qo'shish xatosi:`, error);
    throw error;
  }

  return result;
}

// Ko'p malumot qo'shish
export async function insertMultipleData(table: string, data: Record<string, any>[]) {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select();

  if (error) {
    console.error(`Supabase ${table} ga ko'p malumot qo'shish xatosi:`, error);
    throw error;
  }

  return result;
}

// Malumot yangilash (UPDATE)
export async function updateData(table: string, id: string | number, data: Record<string, any>) {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Supabase ${table} da malumot yangilash xatosi:`, error);
    throw error;
  }

  return result;
}

// Malumot o'chirish (DELETE)
export async function deleteData(table: string, id: string | number) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Supabase ${table} dan malumot o'chirish xatosi:`, error);
    throw error;
  }

  return true;
}

// Realtime subscription
export function subscribeToTable(table: string, callback: (payload: any) => void) {
  const subscription = supabase
    .channel(`${table}_changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe();

  return subscription;
}

// Foydalanuvchi autentifikatsiyasi
export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata }
  });

  if (error) {
    console.error('Supabase sign up xatosi:', error);
    throw error;
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Supabase sign in xatosi:', error);
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Supabase sign out xatosi:', error);
    throw error;
  }

  return true;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Supabase foydalanuvchini olish xatosi:', error);
    return null;
  }

  return data.user;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Supabase session olish xatosi:', error);
    return null;
  }

  return data.session;
}

// File storage
export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  if (error) {
    console.error('Supabase file upload xatosi:', error);
    throw error;
  }

  return data;
}

export async function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    console.error('Supabase file delete xatosi:', error);
    throw error;
  }

  return true;
}

// RPC (Stored Procedure) chaqirish
export async function callRPC(functionName: string, params?: Record<string, any>) {
  const { data, error } = await supabase.rpc(functionName, params);

  if (error) {
    console.error(`Supabase RPC ${functionName} xatosi:`, error);
    throw error;
  }

  return data;
}

export default supabase;
