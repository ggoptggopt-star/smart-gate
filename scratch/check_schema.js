require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

(async () => {
  const { data, error } = await sb.from("leave_requests").select("*").limit(1);
  if (error) {
    console.error("Error:", error);
    return;
  }
  if (data && data.length > 0) {
    console.log("leave_requests columns:", Object.keys(data[0]));
  } else {
    console.log("No data in leave_requests");
  }
})();
