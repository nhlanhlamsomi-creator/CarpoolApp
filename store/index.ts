import { create } from "zustand";

import { DriverStore, LocationStore, MarkerData } from "@/types/type";

const mockDrivers: MarkerData[] = [
  {
    id: "1",
    driver_id: 1,
    first_name: "James",
    last_name: "Wilson",
    profile_image_url: "https://randomuser.me/api/portraits/men/11.jpg",
    car_image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    car_seats: 4,
    rating: "4.8",
    latitude: -26.2041,
    longitude: 28.0473,
    title: "James Wilson",
    time: 3,
    price: "45.00",
  },
  {
    id: "2",
    driver_id: 2,
    first_name: "David",
    last_name: "Brown",
    profile_image_url: "https://randomuser.me/api/portraits/men/22.jpg",
    car_image_url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800",
    car_seats: 5,
    rating: "4.9",
    latitude: -26.1985,
    longitude: 28.0415,
    title: "David Brown",
    time: 5,
    price: "50.00",
  },
  {
    id: "3",
    driver_id: 3,
    first_name: "Michael",
    last_name: "Johnson",
    profile_image_url: "https://randomuser.me/api/portraits/men/33.jpg",
    car_image_url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
    car_seats: 4,
    rating: "4.7",
    latitude: -26.2107,
    longitude: 28.0325,
    title: "Michael Johnson",
    time: 6,
    price: "52.00",
  },
  {
    id: "4",
    driver_id: 4,
    first_name: "Chris",
    last_name: "Taylor",
    profile_image_url: "https://randomuser.me/api/portraits/men/44.jpg",
    car_image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800",
    car_seats: 4,
    rating: "4.6",
    latitude: -26.1865,
    longitude: 28.0435,
    title: "Chris Taylor",
    time: 7,
    price: "55.00",
  },
  {
    id: "5",
    driver_id: 5,
    first_name: "John",
    last_name: "Smith",
    profile_image_url: "https://randomuser.me/api/portraits/men/55.jpg",
    car_image_url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800",
    car_seats: 4,
    rating: "5.0",
    latitude: -26.1745,
    longitude: 28.0580,
    title: "John Smith",
    time: 9,
    price: "60.00",
  },
  {
    id: "6",
    driver_id: 6,
    first_name: "Peter",
    last_name: "Mokoena",
    profile_image_url: "https://randomuser.me/api/portraits/men/66.jpg",
    car_image_url: "https://images.unsplash.com/photo-1493238792000-8113da705763?w=800",
    car_seats: 4,
    rating: "4.8",
    latitude: -26.1520,
    longitude: 28.0410,
    title: "Peter Mokoena",
    time: 11,
    price: "68.00",
  },
  {
    id: "7",
    driver_id: 7,
    first_name: "Sipho",
    last_name: "Nkosi",
    profile_image_url: "https://randomuser.me/api/portraits/men/77.jpg",
    car_image_url: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
    car_seats: 4,
    rating: "4.9",
    latitude: -26.1076,
    longitude: 28.0567,
    title: "Sipho Nkosi",
    time: 14,
    price: "78.00",
  },
];

export const useLocationStore = create<LocationStore>((set) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,

  setUserLocation: ({ latitude, longitude, address }) => {
    set({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
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
  drivers: mockDrivers,
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