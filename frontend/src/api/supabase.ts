// This creates one shared Supabase client for authentication (login/signup/session).
// AsyncStorage lets the login session persist on the phone between app launches, so the
// user doesn't have to log in every single time they open the app.

import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wbsfvxrdrwiglsxmexch.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indic2Z2eHJkcndpZ2xzeG1leGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMjAwMjQsImV4cCI6MjEwNDU5NjAyNH0.nEwYBMkLhActMU5lVkK1k1vdKps5Pt8ebMU2zBzSwOs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});