-- Eski ma'lumotlarni avtomatik o'chirish
-- Supabase Dashboard -> SQL Editor ga qo'shish

-- 1. 30 kundan eski sotuvlarni arxiv jadvalga ko'chirish
CREATE TABLE IF NOT EXISTS sales_archive (
  LIKE sales INCLUDING ALL,
  archived_at TIMESTAMP DEFAULT NOW()
);

-- 2. Eski sotuvlarni arxivga ko'chirish va o'chirish (har kuni ishga tushadi)
CREATE OR REPLACE FUNCTION archive_old_sales()
RETURNS void AS $$
BEGIN
  -- 90 kundan eski sotuvlarni arxivga
  INSERT INTO sales_archive 
  SELECT *, NOW() FROM sales 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Asosiy jadvaldan o'chirish
  DELETE FROM sales 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- 3. Har kuni avtomatik ishga tushirish (pg_cron bilan)
SELECT cron.schedule('archive-sales', '0 2 * * *', 'SELECT archive_old_sales()');
