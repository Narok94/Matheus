import { useMemo } from 'react';
import { AppSettings, BackupData, CompanyProfile } from '../../types';
import { useIndexedDB } from './useIndexedDB';
import { useAuth } from '../context/AuthContext';
import { get } from '../idb';

export const useSettings = () => {
    const { currentUser } = useAuth();
    const userSpecificPrefix = useMemo(() => {
        if (!currentUser) return 'guest';
        return currentUser;
    }, [currentUser]);

    const companyProfilePrefix = 'admin'; // Company profile is global

    const initialCompanyProfile = { name: 'MDS' };

    const [theme, setTheme, themeLoaded] = useIndexedDB<'light' | 'dark'>(`${userSpecificPrefix}-theme`, 'dark');
    const [companyProfile, setCompanyProfile, companyProfileLoaded] = useIndexedDB<CompanyProfile>(`${companyProfilePrefix}-companyProfile`, initialCompanyProfile);
    const [appSettings, setAppSettings, appSettingsLoaded] = useIndexedDB<AppSettings>(`${userSpecificPrefix}-appSettings`, { reminders: true });

    const isSettingsLoading = !themeLoaded || !companyProfileLoaded || !appSettingsLoaded;
    
    const handleImportSettings = (parsedData: BackupData) => {
        setCompanyProfile(parsedData.companyProfile || { name: 'MDS' });
        setAppSettings(parsedData.appSettings || { reminders: true });
    };

    const confirmAutoRestoreSettings = async () => {
        const profileBackup = await get<CompanyProfile>(`${companyProfilePrefix}-companyProfile_backup`);
        if (profileBackup) setCompanyProfile(profileBackup);

        const settingsBackup = await get<AppSettings>(`${userSpecificPrefix}-appSettings_backup`);
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
