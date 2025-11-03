import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { get, set } from '../idb';

// Custom hook for IndexedDB persistence
// FIX: Changed React.Dispatch<React.SetStateAction<T>> to Dispatch<SetStateAction<T>> and imported the types.
export const useIndexedDB = <T,>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>, boolean] => {
    const [state, setState] = useState<T>(initialValue);
    const [isLoaded, setIsLoaded] = useState(false);

    // Re-read from IDB when the key changes
    useEffect(() => {
        let isMounted = true;
        // Reset loading state on key change
        setIsLoaded(false); 
        
        get<T>(key).then(storedValue => {
            if (isMounted) {
                if (storedValue !== undefined && storedValue !== null) {
                    setState(storedValue);
                } else {
                    // if nothing is stored, initialize with the provided default
                    setState(initialValue);
                }
                setIsLoaded(true);
            }
        }).catch(error => {
            console.error(`Error reading IndexedDB key “${key}”:`, error);
            if (isMounted) {
                setState(initialValue);
                setIsLoaded(true); // Still finish loading even on error
            }
        });

        return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    // Write to IDB on state change
    useEffect(() => {
        // Only write to DB after initial load is complete to avoid overwriting stored data with initialValue
        if (!isLoaded) {
            return;
        }
        // Do not store data for the 'guest' user (when logged out)
        if (key.startsWith('guest-')) {
            return;
        }
        set(key, state).catch(error => {
            console.error(`Error setting IndexedDB key “${key}”:`, error);
        });
    }, [key, state, isLoaded]);

    return [state, setState, isLoaded];
};