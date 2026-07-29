import { getSupabaseServerClient } from "@/lib/supabase-server";

// One thread per ride. Same file goes in BOTH apps — they share the database,
// which is what makes passenger↔driver messaging work across two builds.
//
// GET  /(api)/messages/[rideId]?clerkId=...   → thread + header info
// POST /(api)/messages/[rideId]  {clerkId, body} → send

// Only participants of the ride may read or write. Everything is verified
// server-side against the ride row, never trusted from the client.
async function loadParticipants(supabase: any, rideId: string) {
  const { data: ride, error } = await supabase
    .from("rides")
    .select("ride_id, status, user_id, driver_id")
    .eq("ride_id", rideId)
    .maybeSingle();

  if (error) throw error;
  if (!ride) return null;

  const [passenger, driver] = await Promise.all([
    supabase
      .from("users")
      .select("clerk_id, name, profile_image_url")
      .eq("clerk_id", ride.user_id)
      .maybeSingle(),
    supabase
      .from("drivers")
      .select("clerk_id, email, first_name, last_name, profile_image_url")
      .eq("id", ride.driver_id)
      .maybeSingle(),
  ]);

  return { ride, passenger: passenger.data, driver: driver.data };
}

export async function GET(request: Request, { rideId }: { rideId: string }) {
  try {
    const url = new URL(request.url);
    const clerkId = url.searchParams.get("clerkId");

    if (!rideId || !clerkId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const context = await loadParticipants(supabase, rideId);

    if (!context) {
      return Response.json({ error: "Ride not found" }, { status: 404 });
    }

    const { ride, passenger, driver } = context;

    const isPassenger = passenger?.clerk_id === clerkId;
    const isDriver =
      driver?.clerk_id === clerkId || driver?.email === clerkId;

    if (!isPassenger && !isDriver) {
      return Response.json({ error: "Not part of this trip" }, { status: 403 });
    }

    const other = isPassenger
      ? {
          name: driver
            ? `${driver.first_name ?? ""} ${driver.last_name ?? ""}`.trim() || "Driver"
            : "Driver",
          image: driver?.profile_image_url ?? null,
          role: "driver" as const,
        }
      : {
          name: passenger?.name ?? "Passenger",
          image: passenger?.profile_image_url ?? null,
          role: "passenger" as const,
        };

    const { data: rows, error } = await supabase
      .from("messages")
      .select("id, sender_clerk_id, body, created_at")
      .eq("ride_id", rideId)
      .order("created_at", { ascending: true })
      .limit(500);

    if (error) throw error;

    return Response.json({
      data: {
        ride_id: ride.ride_id,
        status: ride.status ?? "booked",
        other,
        messages: (rows ?? []).map((m: any) => ({
          ...m,
          mine: m.sender_clerk_id === clerkId,
        })),
      },
    });
  } catch (error) {
    console.error("Error loading thread:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request, { rideId }: { rideId: string }) {
  try {
    const { clerkId, body } = await request.json();
    const text = String(body ?? "").trim();

    if (!rideId || !clerkId || !text) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (text.length > 2000) {
      return Response.json({ error: "Message is too long" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const context = await loadParticipants(supabase, rideId);

    if (!context) {
      return Response.json({ error: "Ride not found" }, { status: 404 });
    }

    const { ride, passenger, driver } = context;
    const isMember =
      passenger?.clerk_id === clerkId ||
      driver?.clerk_id === clerkId ||
      driver?.email === clerkId;

    if (!isMember) {
      return Response.json({ error: "Not part of this trip" }, { status: 403 });
    }

    // No new messages into a cancelled trip's thread — reading stays open,
    // writing closes with the trip.
    if (ride.status === "cancelled") {
      return Response.json(
        { error: "This trip was cancelled, so its chat is closed" },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({ ride_id: rideId, sender_clerk_id: clerkId, body: text })
      .select()
      .single();

    if (error) throw error;

    return Response.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}