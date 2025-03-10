// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth admin API key
    const supabaseAdmin = createClient(
      // Supabase API URL - env var exported by default when deployed
      Deno.env.get("SUPABASE_URL") ?? "",
      // Supabase API SERVICE ROLE KEY - env var exported by default when deployed
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        },
      );
    }

    // Extract the token from the authorization header
    const token = authHeader.replace("Bearer ", "");

    // Verify the token and get the user
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Check if the user already exists in the public.users table
    const { data: existingUser, error: queryError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (queryError && queryError.code !== "PGRST116") {
      // PGRST116 is the error code for no rows returned
      return new Response(JSON.stringify({ error: queryError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // If the user doesn't exist in the public.users table, create them
    if (!existingUser) {
      const { error: insertError } = await supabaseAdmin.from("users").insert({
        id: user.id,
        name: user.user_metadata.name || user.email?.split("@")[0] || "User",
        email: user.email || "",
      });

      if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      return new Response(
        JSON.stringify({ message: "User created successfully" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        },
      );
    }

    return new Response(JSON.stringify({ message: "User already exists" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
