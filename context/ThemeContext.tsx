import { createContext, useContext, useReducer, useEffect } from 'react';

interface ThemeState {
    mode: 'light' | 'dark';
    primaryColor: string;
    fontFamily: string;
    fontSize: 'small' | 'medium' | 'large';
}

type ThemeAction =
    | { type: 'TOGGLE_MODE' }
    | { type: 'SET_MODE'; payload: 'light' | 'dark' }
    | { type: 'SET_PRIMARY_COLOR'; payload: string }
    | { type: 'SET_FONT_FAMILY'; payload: string }
    | { type: 'SET_FONT_SIZE'; payload: 'small' | 'medium' | 'large' }
    | { type: 'RESET_THEME' };

const initialState: ThemeState = {
    mode: 'light',
    primaryColor: '#8B4513', // Saddle brown for luxury wicker theme
    fontFamily: 'Mathilda',
    fontSize: 'medium',
};

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
    switch (action.type) {
        case 'TOGGLE_MODE':
            return {
                ...state,
                mode: state.mode === 'light' ? 'dark' : 'light',
            };
        case 'SET_MODE':
            return {
                ...state,
                mode: action.payload,
            };
        case 'SET_PRIMARY_COLOR':
            return {
                ...state,
                primaryColor: action.payload,
            };
        case 'SET_FONT_FAMILY':
            return {
                ...state,
                fontFamily: action.payload,
            };
        case 'SET_FONT_SIZE':
            return {
                ...state,
                fontSize: action.payload,
            };
        case 'RESET_THEME':
            return initialState;
        default:
            return state;
    }
};

interface ThemeContextType {
    state: ThemeState;
    toggleMode: () => void;
    setMode: (mode: 'light' | 'dark') => void;
    setPrimaryColor: (color: string) => void;
    setFontFamily: (font: string) => void;
    setFontSize: (size: 'small' | 'medium' | 'large') => void;
    resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [state, dispatch] = useReducer(themeReducer, initialState);

    // Load theme from localStorage on mount (client-side only)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            try {
                const theme = JSON.parse(savedTheme);
                dispatch({ type: 'SET_MODE', payload: theme.mode });
                dispatch({ type: 'SET_PRIMARY_COLOR', payload: theme.primaryColor });
                const fallbackFonts = ['Lakewood', 'Balgin', 'Arturm'];
                const storedFont = !theme.fontFamily || fallbackFonts.includes(theme.fontFamily)
                    ? 'Mathilda'
                    : theme.fontFamily;
                dispatch({ type: 'SET_FONT_FAMILY', payload: storedFont });
                dispatch({ type: 'SET_FONT_SIZE', payload: theme.fontSize });
            } catch (error) {
                console.error('Failed to load theme from localStorage:', error);
            }
        }
    }, []);

    // Save theme to localStorage whenever it changes (client-side only)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('theme', JSON.stringify(state));
    }, [state]);

    // Apply theme to document (client-side only)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        document.documentElement.setAttribute('data-theme', state.mode);
        document.documentElement.style.setProperty('--primary-color', state.primaryColor);
        document.documentElement.style.setProperty('--font-family', state.fontFamily);

        const fontSizeMap = {
            small: '14px',
            medium: '16px',
            large: '18px',
        };
        document.documentElement.style.setProperty('--base-font-size', fontSizeMap[state.fontSize]);
    }, [state]);

    const toggleMode = () => {
        dispatch({ type: 'TOGGLE_MODE' });
    };

    const setMode = (mode: 'light' | 'dark') => {
        dispatch({ type: 'SET_MODE', payload: mode });
    };

    const setPrimaryColor = (color: string) => {
        dispatch({ type: 'SET_PRIMARY_COLOR', payload: color });
    };

    const setFontFamily = (font: string) => {
        dispatch({ type: 'SET_FONT_FAMILY', payload: font });
    };

    const setFontSize = (size: 'small' | 'medium' | 'large') => {
        dispatch({ type: 'SET_FONT_SIZE', payload: size });
    };

    const resetTheme = () => {
        dispatch({ type: 'RESET_THEME' });
    };

    const value: ThemeContextType = {
        state,
        toggleMode,
        setMode,
        setPrimaryColor,
        setFontFamily,
        setFontSize,
        resetTheme,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
