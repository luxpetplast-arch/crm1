import { supabase } from './supabase';

// Supabase storage monitoring
export async function checkSupabaseStorage(): Promise<{
  used: number;
  limit: number;
  percent: number;
  tables: Record<string, number>;
}> {
  // Jadval hajmlarini tekshirish
  const tables = ['products', 'customers', 'sales', 'orders'];
  const tableSizes: Record<string, number> = {};
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (!error && count !== null) {
      tableSizes[table] = count;
    }
  }
  
  // Umumiy hajm (taxminiy)
  const totalRows = Object.values(tableSizes).reduce((a, b) => a + b, 0);
  const estimatedMB = totalRows * 0.5; // Taxminan 0.5 KB har bir yozuv
  
  // Free tier: 500 MB limit
  const limitMB = 500;
  const percent = (estimatedMB / limitMB) * 100;
  
  return {
    used: Math.round(estimatedMB),
    limit: limitMB,
    percent: Math.round(percent),
    tables: tableSizes
  };
}

// Ogohlantirish
export async function checkStorageAlert(): Promise<boolean> {
  const status = await checkSupabaseStorage();
  
  if (status.percent > 80) {
    console.warn(`⚠️ Supabase to'lishiga yaqin: ${status.percent}%`);
    return true;
  }
  
  return false;
}
