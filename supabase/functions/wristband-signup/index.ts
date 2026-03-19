import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      wristband_code,
      email,
      password,
      full_name,
      cpf,
      
      phone,
      role: empRole,
      department,
      blood_type,
      gender,
      birth_date,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      pre_existing_conditions,
      medications,
      allergies,
      linkedin,
      instagram,
      whatsapp,
      photo_url,
      signup_type, // "employee" (default) or "user"
    } = body;

    const isUserSignup = signup_type === "user";

    // Validate required fields based on signup type
    if (!wristband_code || !email || !password || !full_name) {
      return new Response(
        JSON.stringify({ error: "Preencha todos os campos obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isUserSignup && (!cpf || !phone || !empRole || !department || !blood_type || !emergency_contact_name || !emergency_contact_phone || !emergency_contact_relationship)) {
      return new Response(
        JSON.stringify({ error: "Preencha todos os campos obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const client = createClient(supabaseUrl, serviceKey);

    // 1. Verify wristband exists
    const { data: wb, error: wbErr } = await client
      .from("wristbands")
      .select("id, employee_id, user_id, code, role")
      .eq("code", wristband_code)
      .maybeSingle();

    if (wbErr || !wb) {
      return new Response(
        JSON.stringify({ error: "Link de cadastro inválido ou não encontrado." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For employee signup, wristband must not be claimed
    if (!isUserSignup && wb.user_id) {
      return new Response(
        JSON.stringify({ error: "Este link já foi utilizado para um cadastro." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For user signup, wristband must be claimed (user is signing up from someone's profile)
    if (isUserSignup && !wb.user_id) {
      return new Response(
        JSON.stringify({ error: "Link inválido para cadastro de usuário." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Create auth user
    const { data: authData, error: authErr } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (authErr) {
      return new Response(
        JSON.stringify({ error: authErr.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = authData.user.id;

    if (isUserSignup) {
      // User signup: just assign 'user' role
      await client.from("user_roles").insert({ user_id: userId, role: "user" });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Cadastro realizado com sucesso!",
          user_id: userId,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Employee signup flow
    const { data: empData, error: empErr } = await client
      .from("employees")
      .insert({
        full_name,
        cpf,
        
        phone,
        email,
        role: empRole,
        department,
        blood_type,
        gender: gender ?? null,
        birth_date: birth_date ?? null,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,
        pre_existing_conditions: pre_existing_conditions ?? [],
        medications: medications ?? [],
        allergies: allergies ?? [],
        linkedin: linkedin ?? null,
        instagram: instagram ?? null,
        whatsapp: whatsapp ?? null,
        photo_url: photo_url ?? null,
      })
      .select("id")
      .single();

    if (empErr) {
      // Rollback auth user
      await client.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: `Erro ao criar funcionário: ${empErr.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const employeeId = empData.id;

    // Assign employee role
    await client.from("user_roles").insert({ user_id: userId, role: wb.role ?? "employee" });

    // Link wristband to user and employee
    await client
      .from("wristbands")
      .update({ user_id: userId, employee_id: employeeId })
      .eq("id", wb.id);

    // Link profile to employee
    await client
      .from("profiles")
      .update({ employee_id: employeeId })
      .eq("user_id", userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Cadastro realizado com sucesso!",
        user_id: userId,
        employee_id: employeeId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
