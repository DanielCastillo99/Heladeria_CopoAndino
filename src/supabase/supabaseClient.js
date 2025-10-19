import { createClient } from "@supabase/supabase-js";

// Carga las variables del entorno (.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Crea el cliente de conexión
export const supabase = createClient(supabaseUrl, supabaseAnonKey);