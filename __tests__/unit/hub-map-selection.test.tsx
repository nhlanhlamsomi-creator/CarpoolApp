import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import Map from '@/components/Map';
import { useDriverStore, useLocationStore } from '@/store';

jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    from: (table: string) => ({
      select: () => {
        if (table === 'hubs') {
          return {
            eq: () =>
              Promise.resolve({
                data: [
                  {
                    id: 7,
                    name: 'Pretoria Central Hub',
                    address: '123 Steve Biko Road',
                    latitude: -25.7479,
                    longitude: 28.2293,
                    radius: 300,
                    status: 'active',
                  },
                  {
                    id: 8,
                    name: 'Hatfield Hub',
                    address: 'Hatfield, Pretoria',
                    latitude: -25.75,
                    longitude: 28.235,
                    radius: 250,
                    status: 'active',
                  },
                ],
                error: null,
              }),
          };
        }
        return Promise.resolve({
          data: [
            {
              id: 42,
              first_name: 'Selected',
              last_name: 'Driver',
              profile_image_url: '',
              car_image_url: '',
              car_seats: 4,
              rating: 5,
              status: 'active',
              verified: true,
              is_online: true,
              driver_verification_status: 'approved',
            },
            {
              id: 43,
              first_name: 'Other',
              last_name: 'Driver',
              profile_image_url: '',
              car_image_url: '',
              car_seats: 4,
              rating: 4,
              status: 'active',
              verified: true,
              is_online: true,
              driver_verification_status: 'approved',
            },
          ],
          error: null,
        });
      },
    }),
  }),
}));

jest.mock('@/lib/map', () => ({
  calculateDriverTimes: jest.fn().mockResolvedValue([]),
  calculateRegion: jest.fn(() => ({
    latitude: -25.7479,
    longitude: 28.2293,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  })),
  fetchRoutePolyline: jest.fn().mockResolvedValue([]),
  generateMarkersFromData: jest.fn(({ data }: { data: any[] }) =>
    data.map((driver) => ({
      ...driver,
      latitude: driver.latitude ?? -25.7479,
      longitude: driver.longitude ?? 28.2293,
      title: `${driver.first_name} ${driver.last_name}`,
    })),
  ),
}));

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MapView = ({ children }: { children?: React.ReactNode }) => (
    <View>{children}</View>
  );

  const Marker = ({
    children,
    onPress,
    testID,
    ...rest
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
    testID?: string;
    [key: string]: any;
  }) => (
    <View
      testID={testID}
      onTouchEnd={onPress}
      accessibilityRole="button"
      {...rest}
    >
      {children}
    </View>
  );

  return {
    __esModule: true,
    default: MapView,
    Circle: ({ children }: { children?: React.ReactNode }) => <View>{children}</View>,
    Marker,
    Polyline: ({ children }: { children?: React.ReactNode }) => <View>{children}</View>,
    PROVIDER_DEFAULT: 'default',
    PROVIDER_GOOGLE: 'google',
  };
});

describe('Map hub selection', () => {
  beforeEach(() => {
    useLocationStore.setState({
      userLatitude: -25.7479,
      userLongitude: 28.2293,
      userAddress: 'Pretoria',
      destinationLatitude: null,
      destinationLongitude: null,
      destinationAddress: null,
      selectedHubId: null,
      selectedHubName: null,
      rideBooked: false,
    });
    useDriverStore.setState({
      drivers: [],
      selectedDriver: null,
    });
  });

  it('sets the selected hub when a hub marker is pressed', async () => {
    render(<Map />);

    const marker = await waitFor(() => screen.getByTestId('hub-marker-7'),{timeout: 10000});

    fireEvent(marker, 'onTouchEnd');

    await waitFor(() => {
      expect(useLocationStore.getState().selectedHubId).toBe(7);
    });

    expect(useLocationStore.getState().selectedHubName).toBe('Pretoria Central Hub');
    expect(useLocationStore.getState().userAddress).toBe('123 Steve Biko Road');
  });

  it('shows only the selected hub and driver after booking', async () => {
    useLocationStore.setState({
      selectedHubId: 7,
      rideBooked: true,
      userLatitude: -25.7479,
      userLongitude: 28.2293,
    });
    useDriverStore.setState({ selectedDriver: 42 });

    render(<Map />);

    await waitFor(
      () => {
        expect(screen.getByTestId('hub-marker-7')).toBeTruthy();
        expect(screen.getByTestId('driver-marker-42')).toBeTruthy();
      },
      { timeout: 10000 },
    );

    expect(screen.queryByTestId('hub-marker-8')).toBeNull();
    expect(screen.queryByTestId('driver-marker-43')).toBeNull();
  });
});