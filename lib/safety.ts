export type GeoPoint = { latitude: number; longitude: number };

export type SafetyThresholds = {
  offRouteMeters: number;
  minimumAwayMeters: number;
  sustainedMinutes: number;
  prolongedStopMinutes: number;
  prolongedStopMaxMovementMeters: number;
};

export type LocationSample = GeoPoint & { recordedAt: string };

const EARTH_RADIUS_METERS = 6371000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const distanceMeters = (from: GeoPoint, to: GeoPoint) => {
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const latitude = toRadians((from.latitude + to.latitude) / 2);
  const x = longitudeDelta * Math.cos(latitude);
  const y = latitudeDelta;

  return Math.sqrt(x * x + y * y) * EARTH_RADIUS_METERS;
};

const projectedPosition = (
  point: GeoPoint,
  origin: GeoPoint,
  destination: GeoPoint,
) => {
  const latitude = toRadians(origin.latitude);
  const scale = Math.cos(latitude);
  const x = (point.longitude - origin.longitude) * scale;
  const y = point.latitude - origin.latitude;
  const routeX = (destination.longitude - origin.longitude) * scale;
  const routeY = destination.latitude - origin.latitude;
  const routeLengthSquared = routeX * routeX + routeY * routeY;
  const progress =
    routeLengthSquared === 0
      ? 0
      : (x * routeX + y * routeY) / routeLengthSquared;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const nearest = {
    latitude:
      origin.latitude +
      (destination.latitude - origin.latitude) * clampedProgress,
    longitude:
      origin.longitude +
      (destination.longitude - origin.longitude) * clampedProgress,
  };

  return { progress, deviationMeters: distanceMeters(point, nearest) };
};

export const detectSafetyAnomaly = ({
  origin,
  destination,
  samples,
  thresholds = {
    offRouteMeters: 750,
    minimumAwayMeters: 500,
    sustainedMinutes: 3,
    prolongedStopMinutes: 10,
    prolongedStopMaxMovementMeters: 50,
  },
}: {
  origin: GeoPoint;
  destination: GeoPoint;
  samples: LocationSample[];
  thresholds?: SafetyThresholds;
}) => {
  if (samples.length < 2) return null;

  const ordered = [...samples].sort(
    (left, right) =>
      new Date(left.recordedAt).getTime() -
      new Date(right.recordedAt).getTime(),
  );
  const latest = ordered[ordered.length - 1];
  const latestProjection = projectedPosition(latest, origin, destination);
  const latestDestinationDistance = distanceMeters(latest, destination);
  const previous = ordered[ordered.length - 2];
  const previousDestinationDistance = distanceMeters(previous, destination);
  const durationMinutes =
    (new Date(latest.recordedAt).getTime() -
      new Date(ordered[0].recordedAt).getTime()) /
    60000;
  const totalMovementMeters = distanceMeters(ordered[0], latest);
  const prolongedStop =
    durationMinutes >= thresholds.prolongedStopMinutes &&
    totalMovementMeters <= thresholds.prolongedStopMaxMovementMeters &&
    latestDestinationDistance > thresholds.offRouteMeters;

  if (
    (!prolongedStop &&
      latestProjection.deviationMeters < thresholds.offRouteMeters) ||
    (!prolongedStop && durationMinutes < thresholds.sustainedMinutes) ||
    (!prolongedStop &&
      latestDestinationDistance - previousDestinationDistance <
        thresholds.minimumAwayMeters)
  ) {
    return null;
  }

  return {
    reason: prolongedStop
      ? "Unexpected prolonged stop during an active ride"
      : "Sustained route deviation with travel away from the destination",
    deviationMeters: Math.round(latestProjection.deviationMeters),
    distanceFromDestinationMeters: Math.round(latestDestinationDistance),
  };
};
