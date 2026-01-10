import React, { createContext, useContext, useState, useEffect } from 'react';
import appData from '../../data/app_data.json';

interface D01Settings {
    fontSize: number;
    fillOpacity: number;
    isGlass: boolean;
    textColor: string;
}

export type BackgroundTheme = 'grid' | 'gradient' | 'mesh' | 'dark' | 'clean';

interface OrgChartSettings {
    backgroundTheme: BackgroundTheme;
}

interface Settings {
    companyName: string;
    d01: D01Settings;
    orgChart: OrgChartSettings;
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
    updateD01Settings: (newD01Settings: Partial<D01Settings>) => void;
    updateOrgChartSettings: (newOrgChartSettings: Partial<OrgChartSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'orgchart-app-settings-v2';

// Default values to merge with loaded data
const DEFAULT_SETTINGS: Settings = {
    companyName: "My Company",
    d01: {
        fontSize: 120,
        fillOpacity: 0.1,
        isGlass: true,
        textColor: '#ffffff'
    },
    orgChart: {
        backgroundTheme: 'grid'
    }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(() => {
        // Since we removed data persistence from file, we rely on local storage for SETTINGS only?
        // Or should we just stick to memory for now as per user instruction "remove local storage"?
        // The user instructions were for App Data (employees). Settings might be different.
        // But to be consistent with "remove 'org-chart-data-v1'", let's keep settings in local storage 
        // OR just default (memory only) if preferred.
        // Let's use LocalStorage for settings preference as it's UI state, not Business Data.
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge with defaults to ensure new fields exist
            return { ...DEFAULT_SETTINGS, ...parsed, orgChart: { ...DEFAULT_SETTINGS.orgChart, ...parsed.orgChart } };
        }
        // Fallback to appData or Defaults
        // @ts-ignore
        return { ...DEFAULT_SETTINGS, ...appData.settings };
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

    const updateOrgChartSettings = (newOrgChartSettings: Partial<OrgChartSettings>) => {
        setSettings(prev => ({
            ...prev,
            orgChart: { ...prev.orgChart, ...newOrgChartSettings }
        }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, updateD01Settings, updateOrgChartSettings }}>
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
