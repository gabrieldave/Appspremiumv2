import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user: currentUser }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !currentUser) {
      throw new Error("Unauthorized");
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("is_admin")
      .eq("id", currentUser.id)
      .single();

    if (profileError || !profile?.is_admin) {
      throw new Error("Only admins can delete users");
    }

    const { userId } = await req.json();

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (userId === currentUser.id) {
      throw new Error("Cannot delete your own account");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: productsError } = await supabaseAdmin
      .from("user_products")
      .delete()
      .eq("user_id", userId);

    if (productsError) {
      console.error("Error deleting products:", productsError);
    }

    const { error: customerError } = await supabaseAdmin
      .from("stripe_customers")
      .delete()
      .eq("user_id", userId);

    if (customerError) {
      console.error("Error deleting customer:", customerError);
    }

    const { error: subscriptionError } = await supabaseAdmin
      .from("stripe_subscriptions")
      .delete()
      .eq("user_id", userId);

    if (subscriptionError) {
      console.error("Error deleting subscription:", subscriptionError);
    }

    const { error: profileDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileDeleteError) {
      throw profileDeleteError;
    }

    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      throw authDeleteError;
    }

    return new Response(
      JSON.stringify({ success: true, message: "User deleted successfully" }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});