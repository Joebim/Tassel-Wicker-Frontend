import React, { createContext, useContext, useState } from 'react';

interface AnimationContextType {
    showHeader: boolean;
    setShowHeader: (show: boolean) => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [showHeader, setShowHeader] = useState(true); // Default true for non-home pages

    return (
        <AnimationContext.Provider value={{ showHeader, setShowHeader }}>
            {children}
        </AnimationContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAnimation = () => {
    const context = useContext(AnimationContext);
    if (!context) {
        throw new Error('useAnimation must be used within AnimationProvider');
    }
    return context;
};
