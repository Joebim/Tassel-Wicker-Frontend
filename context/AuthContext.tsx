import { createContext, useReducer, useEffect } from 'react';
import { initialState, authReducer } from './authConstants';
import type { User, AuthUser, LoginCredentials, RegisterCredentials } from '../types/user';

// Simple browser cookie helpers (non-HTTP-only, client-side only)
const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${encodeURIComponent(name)}=`));
    if (!match) return null;
    return decodeURIComponent(match.split('=')[1] || '');
};

const setCookie = (name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 7) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
        value
    )}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
};

const removeCookie = (name: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax`;
};

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthContextType {
    state: AuthState;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    updateUser: (user: User) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        // Check for stored auth data on mount (client-side only)
        if (typeof window === 'undefined') return;

        // Clear any legacy local/session storage values
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('refreshToken');
        } catch {
            // Ignore storage cleanup errors
        }

        const storedToken = getCookie('token');
        const storedUser = getCookie('user');

        if (storedToken && storedUser) {
            try {
                const user = JSON.parse(storedUser);
                dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: {
                        user,
                        token: storedToken,
                        refreshToken: getCookie('refreshToken') || '',
                    },
                });
            } catch {
                // Clear invalid stored cookie data
                removeCookie('token');
                removeCookie('user');
                removeCookie('refreshToken');
            }
        }
    }, []);

    const login = async (credentials: LoginCredentials) => {
        dispatch({ type: 'LOGIN_START' });

        try {
            // TODO: Implement actual API call
            // const response = await authService.login(credentials);

            // Mock response for now
            const mockUser: User = {
                id: '1',
                email: credentials.email,
                firstName: 'John',
                lastName: 'Doe',
                role: 'customer',
                isEmailVerified: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                addresses: [],
                preferences: {
                    newsletter: true,
                    marketing: false,
                    currency: 'USD',
                    language: 'en',
                },
            };

            const mockAuthUser: AuthUser = {
                user: mockUser,
                token: 'mock-token',
                refreshToken: 'mock-refresh-token',
            };

            // Store in cookies instead of localStorage
            setCookie('token', mockAuthUser.token);
            setCookie('user', JSON.stringify(mockAuthUser.user));
            setCookie('refreshToken', mockAuthUser.refreshToken);

            dispatch({ type: 'LOGIN_SUCCESS', payload: mockAuthUser });
        } catch (error) {
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: error instanceof Error ? error.message : 'Login failed',
            });
        }
    };

    const register = async (credentials: RegisterCredentials) => {
        dispatch({ type: 'LOGIN_START' });

        try {
            // TODO: Implement actual API call
            // const response = await authService.register(credentials);

            // Mock response for now
            const mockUser: User = {
                id: '1',
                email: credentials.email,
                firstName: credentials.firstName,
                lastName: credentials.lastName,
                phone: credentials.phone,
                role: 'customer',
                isEmailVerified: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                addresses: [],
                preferences: {
                    newsletter: credentials.newsletter || false,
                    marketing: false,
                    currency: 'USD',
                    language: 'en',
                },
            };

            const mockAuthUser: AuthUser = {
                user: mockUser,
                token: 'mock-token',
                refreshToken: 'mock-refresh-token',
            };

            // Store in cookies instead of localStorage
            setCookie('token', mockAuthUser.token);
            setCookie('user', JSON.stringify(mockAuthUser.user));
            setCookie('refreshToken', mockAuthUser.refreshToken);

            dispatch({ type: 'LOGIN_SUCCESS', payload: mockAuthUser });
        } catch (error) {
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: error instanceof Error ? error.message : 'Registration failed',
            });
        }
    };

    const logout = () => {
        removeCookie('token');
        removeCookie('user');
        removeCookie('refreshToken');
        dispatch({ type: 'LOGOUT' });
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const updateUser = (user: User) => {
        setCookie('user', JSON.stringify(user));
        dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
                user,
                token: state.token || '',
                refreshToken: getCookie('refreshToken') || '',
            },
        });
    };

    const value: AuthContextType = {
        state,
        login,
        register,
        logout,
        clearError,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
