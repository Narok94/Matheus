import { useMemo, useEffect } from 'react';
import { AppSettings, BackupData, CompanyProfile } from '../../types';
import { useIndexedDB } from './useIndexedDB';
import { useAuth } from '../context/AuthContext';
import { get } from '../idb';

export const useSettings = () => {
    const { currentUser } = useAuth();
    const dataKeyPrefix = useMemo(() => currentUser || 'guest', [currentUser]);

    const [theme, setTheme, themeLoaded] = useIndexedDB<'light' | 'dark'>(`${dataKeyPrefix}-theme`, 'dark');
    const [companyProfile, setCompanyProfile, companyProfileLoaded] = useIndexedDB<CompanyProfile>(`${dataKeyPrefix}-companyProfile`, { name: 'Empresa ABC' });
    const [appSettings, setAppSettings, appSettingsLoaded] = useIndexedDB<AppSettings>(`${dataKeyPrefix}-appSettings`, { reminders: true });

    const isSettingsLoading = !themeLoaded || !companyProfileLoaded || !appSettingsLoaded;
    
    const handleImportSettings = (parsedData: BackupData) => {
        setCompanyProfile(parsedData.companyProfile || { name: 'Empresa ABC' });
        setAppSettings(parsedData.appSettings || { reminders: true });
    };

    const confirmAutoRestoreSettings = async () => {
        const profileBackup = await get<CompanyProfile>(`${dataKeyPrefix}-companyProfile_backup`);
        if (profileBackup) setCompanyProfile(profileBackup);

        const settingsBackup = await get<AppSettings>(`${dataKeyPrefix}-appSettings_backup`);
        if (settingsBackup) setAppSettings(settingsBackup);
    };

    return {
        theme,
        setTheme,
        companyProfile,
        setCompanyProfile,
        appSettings,
        setAppSettings,
        isSettingsLoading,
        handleImportSettings,
        confirmAutoRestoreSettings
    };
};