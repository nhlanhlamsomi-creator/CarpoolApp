import { useAuth } from "@clerk/expo";
import { useEffect, useRef, useState } from "react";

import { apiRequest } from "@/lib/api";

export type DriverVehicle = {
  make: string | null;
  model: string | null;
  year: string | number | null;
  colour: string | null;
  plate: string | null;
  seats: number | null;
};

export function useDriverVehicle(driverId?: number | null) {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  const [vehicleResult, setVehicleResult] = useState<{
    driverId: number;
    vehicle: DriverVehicle | null;
  } | null>(null);
  const [loadingDriverId, setLoadingDriverId] = useState<number | null>(null);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    let active = true;

    if (!driverId) return;

    const loadVehicle = async () => {
      setLoadingDriverId(driverId);
      try {
        const token = await getTokenRef.current();
        const result = await apiRequest<{ data: { vehicle: DriverVehicle } }>(
          `/api/drivers/${driverId}/vehicle`,
          {},
          token,
        );
        if (active) {
          setVehicleResult({ driverId, vehicle: result.data.vehicle });
        }
      } catch (error) {
        console.warn("Unable to load driver vehicle details", error);
        if (active) setVehicleResult({ driverId, vehicle: null });
      } finally {
        if (active) {
          setLoadingDriverId((currentId) =>
            currentId === driverId ? null : currentId,
          );
        }
      }
    };

    void loadVehicle();
    return () => {
      active = false;
    };
  }, [driverId]);

  return {
    vehicle:
      vehicleResult?.driverId === driverId ? vehicleResult.vehicle : null,
    loading: loadingDriverId === driverId,
  };
}
