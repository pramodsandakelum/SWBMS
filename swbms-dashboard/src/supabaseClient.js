// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://haecgyxeccjjwsyomvuy.supabase.co";
//haecgyxeccjjwsyomvuy
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZWNneXhlY2NqandzeW9tdnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MDQ2MzAsImV4cCI6MjA3MDM4MDYzMH0.wP-ZAxr-skEKThxIOXSFMPBn4j4tdVq2E_048w7hZ2Y"; // For demonstration, ideally use a service role key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
