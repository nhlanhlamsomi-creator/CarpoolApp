import { create } from "zustand";

import { DriverStore, LocationStore, MarkerData } from "@/types/type";

export const useLocationStore = create<LocationStore>((set, get) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  selectedHubId: null,
  selectedHubName: null,
  rideBooked: false,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,

  setUserLocation: ({ latitude, longitude, address }) => {
    if (get().rideBooked) return;

    set({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
      selectedHubId: null,
      selectedHubName: null,
      rideBooked: false,
    });

    const { selectedDriver, clearSelectedDriver } =
      useDriverStore.getState();

    if (selectedDriver) clearSelectedDriver();
  },

  setHubPickup: ({ id, name, latitude, longitude, address }) => {
    set({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
      selectedHubId: id,
      selectedHubName: name,
      rideBooked: false,
    });

    const { selectedDriver, clearSelectedDriver } =
      useDriverStore.getState();

    if (selectedDriver) clearSelectedDriver();
  },

  setDestinationLocation: ({ latitude, longitude, address }) => {
    set({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
      rideBooked: false,
    });

    const { selectedDriver, clearSelectedDriver } =
      useDriverStore.getState();

    if (selectedDriver) clearSelectedDriver();
  },

  setRideBooked: (rideBooked) => set({ rideBooked }),
}));

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [],
  selectedDriver: null,

  setSelectedDriver: (driverId: number) =>
    set({
      selectedDriver: driverId,
    }),

  setDrivers: (drivers: MarkerData[]) =>
    set({
      drivers,
    }),

  clearSelectedDriver: () =>
    set({
      selectedDriver: null,
    }),
}));