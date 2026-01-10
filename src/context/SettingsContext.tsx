import React, { createContext, useContext, useState, useEffect } from 'react';
import appData from '../../data/app_data.json';

interface D01Settings {
    fontSize: number;
    fillOpacity: number;
    isGlass: boolean;
    textColor: string;
}

interface Settings {
    companyName: string;
    d01: D01Settings;
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
    updateD01Settings: (newD01Settings: Partial<D01Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'orgchart-app-settings-v1';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        return saved ? JSON.parse(saved) : appData.settings;
    });

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const updateD01Settings = (newD01Settings: Partial<D01Settings>) => {
        setSettings(prev => ({
            ...prev,
            d01: { ...prev.d01, ...newD01Settings }
        }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, updateD01Settings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
