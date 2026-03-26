import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
	import.meta.env.VITE_SUPABASE_URL ||
	"https://ultkpguxeekqzlazdmoe.supabase.co";
const supabaseKey =
	import.meta.env.VITE_SUPABASE_ANON_KEY ||
	"sb_publishable_Kf91cfCXUECi181toVy4Mw_x3kr3-jw";

export const supabase = createClient(supabaseUrl, supabaseKey);
