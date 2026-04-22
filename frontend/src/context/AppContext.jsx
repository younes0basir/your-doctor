import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('patientToken') || localStorage.getItem('doctorToken');
  });
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState(() => {
    return localStorage.getItem('patientToken') ? 'patient' : 'doctor';
  });

  // Set up axios interceptors for authentication
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const patientToken = localStorage.getItem('patientToken');
        const doctorToken = localStorage.getItem('doctorToken');

        if (patientToken) {
          config.headers['patient-token'] = patientToken;
        }
        if (doctorToken) {
          config.headers['doctor-token'] = doctorToken;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Update userType when token changes
  useEffect(() => {
    if (token) {
      const newUserType = localStorage.getItem('patientToken') ? 'patient' : 'doctor';
      setUserType(newUserType);
    } else {
      setUserType(null);
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem('patientToken');
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctor');
    localStorage.removeItem('userData');
    setToken(null);
    setUserData(null);
    setUserType(null);
  };

  return (
    <AppContext.Provider value={{ 
      token, 
      setToken, 
      userData, 
      setUserData, 
      userType,
      logout 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
