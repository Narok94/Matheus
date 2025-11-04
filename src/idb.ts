import { Client } from '../types';

const DB_NAME = 'InspecProDB';
const DB_VERSION = 2; // Incremented version to trigger upgrade
const STORE_NAME = 'keyval';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
    if (dbPromise) {
        return dbPromise;
    }
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const oldVersion = event.oldVersion;
            console.log(`Upgrading database from version ${oldVersion} to ${DB_VERSION}`);

            // Step 1: Ensure the store exists.
            let store: IDBObjectStore;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                store = db.createObjectStore(STORE_NAME);
            } else {
                const transaction = (event.target as IDBOpenDBRequest).transaction;
                if (!transaction) {
                    console.error("Upgrade transaction is not available.");
                    return;
                }
                store = transaction.objectStore(STORE_NAME);
            }

            // Step 2: Apply migrations sequentially.
            if (oldVersion < 2) {
                // This migration adds a _version field to all Client objects.
                // It's a non-destructive example to establish the migration pattern for future updates.
                console.log("Applying migration for v2: Adding _version to clients.");

                store.openCursor().onsuccess = (e) => {
                    const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
                    if (cursor) {
                        const key = cursor.key as string;
                        if (typeof key === 'string' && key.endsWith('-clients')) {
                            try {
                                const clients = cursor.value as Client[];
                                if (Array.isArray(clients)) {
                                    const needsMigration = clients.some(c => !c.hasOwnProperty('_version'));
                                    if (needsMigration) {
                                        const updatedClients = clients.map(client => ({
                                            ...client,
                                            _version: 2,
                                        }));
                                        cursor.update(updatedClients);
                                        console.log(`Migrated client data for key: ${key}`);
                                    }
                                }
                            } catch (error) {
                                console.error(`Failed to migrate client data for key: ${key}`, error);
                            }
                        }
                        cursor.continue();
                    }
                };
            }
            // Future migrations would be chained here, e.g.:
            // if (oldVersion < 3) { /* ... migrate to v3 ... */ }
        };
    });
    return dbPromise;
}

export async function get<T>(key: string): Promise<T | undefined> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error);
    });
}

export async function set(key: string, value: any): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.put(value, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}