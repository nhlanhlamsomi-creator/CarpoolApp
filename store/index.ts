import { create } from "zustand";

import { DriverStore, LocationStore, MarkerData } from "@/types/type";

export const useLocationStore = create<LocationStore>((set) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  selectedHubId: null,
  selectedHubName: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,

  setUserLocation: ({ latitude, longitude, address }) => {
    set({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
      selectedHubId: null,
      selectedHubName: null,
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
    });

    const { selectedDriver, clearSelectedDriver } =
      useDriverStore.getState();

    if (selectedDriver) clearSelectedDriver();
  },
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