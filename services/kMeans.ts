import { getSupabaseClient } from "@/lib/supabase";

export interface PassengerLocation {
  id: string;
  latitude: number;
  longitude: number;
}

export interface ClusterCentroid {
  latitude: number;
  longitude: number;
}

export interface KMeansCluster {
  clusterId: number;
  passengers: PassengerLocation[];
  centroid: ClusterCentroid;
  passengerCount: number;
  pickupAreaRadiusKm: number;
}

export interface KMeansOptions {
  k?: number;
  maxIterations?: number;
  maxPickupDistanceKm?: number;
}

export interface CarpoolGroup {
  clusterId: number;
  passengers: string[];
  centroid: ClusterCentroid;
  passengerCount: number;
  pickupAreaRadiusKm: number;
}

export const DEFAULT_MAX_PICKUP_DISTANCE_KM = 5;
const EARTH_RADIUS_KM = 6371;

export function isValidCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function sanitizePassengers(
  input: Array<Partial<PassengerLocation> | null | undefined>,
): PassengerLocation[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((entry): entry is Partial<PassengerLocation> => Boolean(entry))
    .filter((entry) => {
      if (!entry?.id || typeof entry.id !== "string") {
        return false;
      }

      return (
        isValidCoordinate(entry.latitude) &&
        entry.latitude >= -90 &&
        entry.latitude <= 90 &&
        isValidCoordinate(entry.longitude) &&
        entry.longitude >= -180 &&
        entry.longitude <= 180
      );
    })
    .map((entry) => ({
      id: entry.id!,
      latitude: Number(entry.latitude),
      longitude: Number(entry.longitude),
    }));
}

export function haversineDistanceKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;

  const deltaLatitude = toRadians(latitudeB - latitudeA);
  const deltaLongitude = toRadians(longitudeB - longitudeA);

  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(toRadians(latitudeA)) *
      Math.cos(toRadians(latitudeB)) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export function calculateCentroid(passengers: PassengerLocation[]): ClusterCentroid {
  if (!passengers.length) {
    return { latitude: 0, longitude: 0 };
  }

  const total = passengers.reduce(
    (acc, passenger) => {
      acc.latitude += passenger.latitude;
      acc.longitude += passenger.longitude;
      return acc;
    },
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: total.latitude / passengers.length,
    longitude: total.longitude / passengers.length,
  };
}

function calculateRadius(passengers: PassengerLocation[], centroid: ClusterCentroid): number {
  if (!passengers.length) {
    return 0;
  }

  return Math.max(
    ...passengers.map((passenger) =>
      haversineDistanceKm(
        passenger.latitude,
        passenger.longitude,
        centroid.latitude,
        centroid.longitude,
      ),
    ),
  );
}

function initializeCentroids(
  passengers: PassengerLocation[],
  clusterCount: number,
): ClusterCentroid[] {
  const centroids: ClusterCentroid[] = [];

  for (let index = 0; index < clusterCount; index += 1) {
    const passenger =
      passengers[Math.floor((passengers.length * index) / clusterCount)] ??
      passengers[0];

    centroids.push({
      latitude: passenger.latitude,
      longitude: passenger.longitude,
    });
  }

  return centroids;
}

function findNearestCentroidIndex(
  passenger: PassengerLocation,
  centroids: ClusterCentroid[],
): number {
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  centroids.forEach((centroid, index) => {
    const distance = haversineDistanceKm(
      passenger.latitude,
      passenger.longitude,
      centroid.latitude,
      centroid.longitude,
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

function centroidsAreStable(
  previous: ClusterCentroid[],
  next: ClusterCentroid[],
): boolean {
  if (previous.length !== next.length) {
    return false;
  }

  return previous.every((centroid, index) => {
    const nextCentroid = next[index];

    return (
      haversineDistanceKm(
        centroid.latitude,
        centroid.longitude,
        nextCentroid.latitude,
        nextCentroid.longitude,
      ) < 0.0001
    );
  });
}

export function runKMeans(
  passengers: PassengerLocation[],
  k: number,
  options: KMeansOptions = {},
): KMeansCluster[] {
  const validPassengers = sanitizePassengers(passengers);

  if (!validPassengers.length) {
    return [];
  }

  const clusterCount = Math.min(
    Math.max(1, Math.round(k || 2)),
    validPassengers.length,
  );
  const maxIterations = Math.max(1, options.maxIterations ?? 25);
  const maxPickupDistanceKm = options.maxPickupDistanceKm ?? DEFAULT_MAX_PICKUP_DISTANCE_KM;

  let centroids = initializeCentroids(validPassengers, clusterCount);
  let assignments = Array.from({ length: clusterCount }, () => [] as PassengerLocation[]);

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    assignments = Array.from({ length: clusterCount }, () => [] as PassengerLocation[]);

    validPassengers.forEach((passenger) => {
      const nearestClusterIndex = findNearestCentroidIndex(passenger, centroids);
      assignments[nearestClusterIndex].push(passenger);
    });

    const nextCentroids = centroids.map((currentCentroid, index) => {
      const clusterPassengers = assignments[index] ?? [];

      if (!clusterPassengers.length) {
        return { ...currentCentroid };
      }

      return calculateCentroid(clusterPassengers);
    });

    if (centroidsAreStable(centroids, nextCentroids)) {
      centroids = nextCentroids;
      break;
    }

    centroids = nextCentroids;
  }

  return Array.from({ length: clusterCount }, (_, clusterId) => {
    const clusterPassengers = assignments[clusterId] ?? [];
    const centroid =
      clusterPassengers.length > 0
        ? calculateCentroid(clusterPassengers)
        : centroids[clusterId] ?? { latitude: 0, longitude: 0 };

    return {
      clusterId,
      passengers: clusterPassengers,
      centroid,
      passengerCount: clusterPassengers.length,
      pickupAreaRadiusKm: Math.min(
        maxPickupDistanceKm,
        calculateRadius(clusterPassengers, centroid),
      ),
    };
  });
}

function buildCarpoolGroup(
  passengers: PassengerLocation[],
  clusterId: number,
): CarpoolGroup {
  const centroid = calculateCentroid(passengers);

  return {
    clusterId,
    passengers: passengers.map((passenger) => passenger.id),
    centroid,
    passengerCount: passengers.length,
    pickupAreaRadiusKm: calculateRadius(passengers, centroid),
  };
}

export function findCarpoolGroups(
  passengers: PassengerLocation[],
  vehicleCapacity: number,
  options: KMeansOptions = {},
): CarpoolGroup[] {
  const validPassengers = sanitizePassengers(passengers);

  if (!validPassengers.length || !Number.isFinite(vehicleCapacity) || vehicleCapacity <= 0) {
    return [];
  }

  const safeCapacity = Math.max(1, Math.floor(vehicleCapacity));
  const targetK = Math.max(
    1,
    Math.min(validPassengers.length, options.k ?? Math.min(4, validPassengers.length)),
  );

  const clustered = runKMeans(validPassengers, targetK, options);
  const groups: CarpoolGroup[] = [];
  const maxPickupDistanceKm = options.maxPickupDistanceKm ?? DEFAULT_MAX_PICKUP_DISTANCE_KM;

  clustered.forEach((cluster) => {
    if (!cluster.passengers.length) {
      return;
    }

    const sorted = [...cluster.passengers].sort((left, right) => {
      const leftDistance = haversineDistanceKm(
        left.latitude,
        left.longitude,
        cluster.centroid.latitude,
        cluster.centroid.longitude,
      );
      const rightDistance = haversineDistanceKm(
        right.latitude,
        right.longitude,
        cluster.centroid.latitude,
        cluster.centroid.longitude,
      );

      return leftDistance - rightDistance;
    });

    for (let index = 0; index < sorted.length; index += safeCapacity) {
      const slice = sorted.slice(index, index + safeCapacity);
      groups.push(buildCarpoolGroup(slice, groups.length));
    }
  });

  const finalGroups: CarpoolGroup[] = [];

  for (const group of groups) {
    const groupPassengers = validPassengers.filter((passenger) =>
      group.passengers.includes(passenger.id),
    );

    if (!groupPassengers.length) {
      continue;
    }

    let cleanedPassengers = [...group.passengers];
    const keptPassengers: string[] = [];

    for (const passengerId of cleanedPassengers) {
      const passenger = validPassengers.find((entry) => entry.id === passengerId);

      if (!passenger) {
        continue;
      }

      const distance = haversineDistanceKm(
        passenger.latitude,
        passenger.longitude,
        group.centroid.latitude,
        group.centroid.longitude,
      );

      if (distance <= maxPickupDistanceKm) {
        keptPassengers.push(passengerId);
      }
    }

    const outliers = cleanedPassengers.filter(
      (passengerId) => !keptPassengers.includes(passengerId),
    );

    if (keptPassengers.length === 0) {
      finalGroups.push({
        clusterId: finalGroups.length,
        passengers: [cleanedPassengers[0]],
        centroid: {
          latitude: validPassengers.find((entry) => entry.id === cleanedPassengers[0])?.latitude ?? 0,
          longitude: validPassengers.find((entry) => entry.id === cleanedPassengers[0])?.longitude ?? 0,
        },
        passengerCount: 1,
        pickupAreaRadiusKm: 0,
      });
      continue;
    }

    const candidateGroup: CarpoolGroup = {
      clusterId: finalGroups.length,
      passengers: keptPassengers,
      centroid: calculateCentroid(
        validPassengers.filter((entry) => keptPassengers.includes(entry.id)),
      ),
      passengerCount: keptPassengers.length,
      pickupAreaRadiusKm: 0,
    };

    candidateGroup.pickupAreaRadiusKm = calculateRadius(
      validPassengers.filter((entry) => keptPassengers.includes(entry.id)),
      candidateGroup.centroid,
    );

    finalGroups.push(candidateGroup);

    for (const passengerId of outliers) {
      const targetGroupIndex = finalGroups.findIndex(
        (candidate) =>
          candidate.clusterId !== candidateGroup.clusterId &&
          candidate.passengerCount < safeCapacity,
      );

      if (targetGroupIndex === -1) {
        finalGroups.push({
          clusterId: finalGroups.length,
          passengers: [passengerId],
          centroid: {
            latitude: validPassengers.find((entry) => entry.id === passengerId)?.latitude ?? 0,
            longitude: validPassengers.find((entry) => entry.id === passengerId)?.longitude ?? 0,
          },
          passengerCount: 1,
          pickupAreaRadiusKm: 0,
        });
        continue;
      }

      const targetGroup = finalGroups[targetGroupIndex];
      targetGroup.passengers.push(passengerId);
      targetGroup.passengerCount = targetGroup.passengers.length;
      targetGroup.centroid = calculateCentroid(
        validPassengers.filter((entry) => targetGroup.passengers.includes(entry.id)),
      );
      targetGroup.pickupAreaRadiusKm = calculateRadius(
        validPassengers.filter((entry) => targetGroup.passengers.includes(entry.id)),
        targetGroup.centroid,
      );
    }
  }

  return finalGroups
    .filter((group) => group.passengerCount > 0)
    .map((group, index) => ({
      ...group,
      clusterId: index,
    }))
    .sort((left, right) => right.passengerCount - left.passengerCount);
}

export async function fetchPassengersForClustering({
  table = "passengers",
  latitudeColumn = "latitude",
  longitudeColumn = "longitude",
  selectColumns = "id, latitude, longitude",
}: {
  table?: string;
  latitudeColumn?: string;
  longitudeColumn?: string;
  selectColumns?: string;
} = {}): Promise<PassengerLocation[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(table)
    .select(selectColumns)
    .not(latitudeColumn, "is", null)
    .not(longitudeColumn, "is", null);

  if (error) {
    console.error("Failed to load passengers for clustering:", error);
    return [];
  }

  return sanitizePassengers(
    (Array.isArray(data) ? data : []).map((entry) => {
      const row = (entry ?? {}) as Record<string, unknown>;

      return {
        id: String(row.id ?? ""),
        latitude: Number(row[latitudeColumn]),
        longitude: Number(row[longitudeColumn]),
      };
    }),
  );
}
