
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request, { clerkId }: { clerkId: string }) {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("drivers")
      .select("id, full_name, email, status, verified, phone_number, profile_image_url, driver_license_url, government_id_url, vehicle_details, bank_details")
      .eq("email", clerkId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return Response.json({ data: data ?? null });
  } catch (error) {
    console.error("Error fetching driver application:", error);
    return Response.json({ data: null });
  }
}
