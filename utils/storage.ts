// Client-safe storage utilities for Zustand persist
// These ensure localStorage/sessionStorage are only accessed on the client

export const createClientStorage = () => {
  if (typeof window === 'undefined') {
    // Return a no-op storage for SSR
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  return {
    getItem: (name: string) => {
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: string) => {
      try {
        localStorage.setItem(name, value);
      } catch {
        // Ignore storage errors
      }
    },
    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name);
      } catch {
        // Ignore storage errors
      }
    },
  };
};

export const createClientSessionStorage = () => {
  if (typeof window === 'undefined') {
    // Return a no-op storage for SSR
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  return {
    getItem: (name: string) => {
      try {
        return sessionStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: string) => {
      try {
        sessionStorage.setItem(name, value);
      } catch {
        // Ignore storage errors
      }
    },
    removeItem: (name: string) => {
      try {
        sessionStorage.removeItem(name);
      } catch {
        // Ignore storage errors
      }
    },
  };
};

