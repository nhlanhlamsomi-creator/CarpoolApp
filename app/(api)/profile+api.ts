import { getSupabaseServerClient } from "@/lib/supabase-server";

// Columns the client is allowed to write. Anything not on this list is ignored,
// so a caller can't set their own rating or verification_status to "approved".
const WRITABLE = [
  "name",
  "email",
  "phone_number",
  "profile_image_url",
  "government_id_url",
  "government_id_back_url",
  "selfie_image_url",
  "id_number",
  "id_citizenship",
  "date_of_birth",
  "verification_status",
  "verification_submitted_at",
  "verification_warnings",
] as const;

// Only a reviewer should ever move an account to approved or rejected, so the
// app can only push it into review.
const CLIENT_ALLOWED_STATUSES = ["not_submitted", "pending"];

const SELECT_COLUMNS = `
  id,
  name,
  email,
  clerk_id,
  phone_number,
  profile_image_url,
  rating,
  total_trips,
  verification_percentage,
  verification_status,
  verification_rejection_reason,
  verification_submitted_at,
  verification_warnings,
  government_id_url,
  government_id_back_url,
  selfie_image_url,
  id_number,
  id_citizenship,
  date_of_birth,
  profile_data
`;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const clerkId = url.searchParams.get("clerkId");

    if (!clerkId) {
      return Response.json({ error: "Missing clerkId" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data: profile, error } = await supabase
      .from("users")
      .select(SELECT_COLUMNS)
      .eq("clerk_id", clerkId)
      .maybeSingle();

    if (error) throw error;

    return Response.json({
      data: profile
        ? {
            ...profile,
            profile_data: profile.profile_data ?? {},
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clerkId, profile_data, ...updates } = body;

    if (!clerkId) {
      return Response.json({ error: "Missing clerkId" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // ── Build the update from whitelisted keys only ─────────────────────────
    // Undefined keys are left out entirely, so sending one field doesn't blank
    // the others.
    const payload: Record<string, unknown> = {};

    for (const key of WRITABLE) {
      if (updates[key] !== undefined) {
        payload[key] = updates[key];
      }
    }

    if (
      payload.verification_status !== undefined &&
      !CLIENT_ALLOWED_STATUSES.includes(String(payload.verification_status))
    ) {
      return Response.json(
        { error: "That verification status can only be set by a reviewer" },
        { status: 403 },
      );
    }

    // ── Merge profile_data rather than replacing it ─────────────────────────
    // Replacing meant saving one preference wiped all the others.
    if (profile_data && typeof profile_data === "object") {
      const { data: existing, error: readError } = await supabase
        .from("users")
        .select("profile_data")
        .eq("clerk_id", clerkId)
        .maybeSingle();

      if (readError) throw readError;

      payload.profile_data = {
        ...(existing?.profile_data ?? {}),
        ...profile_data,
      };
    }

    if (Object.keys(payload).length === 0) {
      return Response.json({ error: "Nothing to update" }, { status: 400 });
    }

    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("users")
      .update(payload)
      .eq("clerk_id", clerkId)
      .select(SELECT_COLUMNS)
      .single();

    if (error) throw error;

    return Response.json({ data });
  } catch (error: any) {
    // A duplicate ID number is a real, expected case — say so plainly rather
    // than returning a generic 500.
    if (error?.code === "23505" && String(error?.message).includes("id_number")) {
      return Response.json(
        { error: "That ID number is already registered to another account" },
        { status: 409 },
      );
    }

    console.error("Error updating profile:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}