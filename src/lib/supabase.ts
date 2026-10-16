import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uvekrdfjplxrwklxffyx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2ZWtyZGZqcGx4cndrbHhmZnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMTE2NTIsImV4cCI6MjEwNzY4NzY1Mn0.Rw8HUgf-A4SNGfcywspppBK1wJXoBy75m8SYdFmCzFQ";

export const supabase = createClient(supabaseUrl, supabaseKey);
