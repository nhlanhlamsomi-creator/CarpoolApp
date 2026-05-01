import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Mock users for demo
const MOCK_USERS = {
  passenger: {
    uid: 'passenger_001',
    fullName: 'Thabo Mbeki',
    email: 'thabo@gmail.com',
    phone: '0821234567',
    role: 'passenger',
    rating: 4.8,
    verified: true,
  },
  driver: {
    uid: 'driver_001',
    fullName: 'Sipho Dlamini',
    email: 'sipho@gmail.com',
    phone: '0831234567',
    role: 'driver',
    rating: 4.9,
    verified: true,
    driverDetails: {
      vehicleMake: 'Toyota',
      vehicleModel: 'Corolla',
      vehicleColor: 'White',
      licensePlate: 'CA 123-456',
      licenceNumber: '0123456789',
    },
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    // Demo login — email containing 'driver' logs in as driver
    if (email.toLowerCase().includes('driver')) {
      setUser(MOCK_USERS.driver);
      return MOCK_USERS.driver;
    }
    setUser(MOCK_USERS.passenger);
    return MOCK_USERS.passenger;
  };

  const register = async (form) => {
    const newUser = {
      uid: 'user_' + Date.now(),
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      role: form.role || 'passenger',
      rating: 5.0,
      verified: false,
    };
    setUser(newUser);
    return newUser;
  };

  const logout = () => setUser(null);

  const isPassenger  = user?.role === 'passenger';
  const isDriver     = user?.role === 'driver';
  const isAdmin      = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user, login, register, logout,
      isPassenger, isDriver, isAdmin,
      loading: false,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
