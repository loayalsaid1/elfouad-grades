import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
// A supabase edge function to delete a context backup file in a Supabase storage bucket with teh name "student-results-csv-backups
// the ffile name is genrated from passe values, being 'scool-slug/year/term<t1 or t2>/grade_<x>.csv'
serve(async (req)=>{
  // Parse input
  const { "school-slug": school_slug, year, term, grade } = await req.json();
  if (!school_slug || !year || !term || !grade) {
    return new Response(JSON.stringify({
      error: "Missing required parameters."
    }), {
      status: 400
    });
  }
  // Construct file path
  const filePath = `${school_slug}/${year}/t${term}/grade_${grade}.csv`;
  // Supabase env vars
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, supabaseKey);
  // Delete file from storage
  const { error } = await supabase.storage.from("student-results-csv-backups").remove([
    filePath
  ]);
  if (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500
    });
  }
  return new Response(JSON.stringify({
    success: true,
    deleted: filePath
  }), {
    status: 200
  });
});
