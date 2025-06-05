import { createClient } from "@supabase/supabase-js";
const supabaseUrl = window.SUPABASE_URL || "";
const supabaseKey = window.SUPABASE_KEY || "";
export const supabase = createClient(supabaseUrl, supabaseKey);
