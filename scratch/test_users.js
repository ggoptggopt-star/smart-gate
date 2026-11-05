require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

(async () => {
  const { data, error } = await sb.from("users").select("*");
  if (error) {
    console.error("Supabase error:", error);
    return;
  }
  console.log("Supabase total users:", data.length);
  const advisors = data.filter(u => u.role === "advisor");
  console.log("Advisors in Supabase count:", advisors.length);
  advisors.forEach(u => console.log(u.username, u.full_name, u.role));
})();
