/**
 * Small IndexedDB helpers. One object store, key/value records.
 * Callers own database names, store names, and value shapes.
 */

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

export function openKeyValueDb(dbName: string, storeName: string, version = 1): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available'))
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Could not open IndexedDB'))
    request.onblocked = () => reject(new Error('IndexedDB open is blocked'))
  })
}

export async function idbGet<T>(
  dbName: string,
  storeName: string,
  key: IDBValidKey,
): Promise<T | undefined> {
  const db = await openKeyValueDb(dbName, storeName)
  try {
    const value = await requestToPromise(
      db.transaction(storeName, 'readonly').objectStore(storeName).get(key),
    )
    return value as T | undefined
  } finally {
    db.close()
  }
}

export async function idbSet(
  dbName: string,
  storeName: string,
  key: IDBValidKey,
  value: unknown,
): Promise<void> {
  const db = await openKeyValueDb(dbName, storeName)
  try {
    await requestToPromise(
      db.transaction(storeName, 'readwrite').objectStore(storeName).put(value, key),
    )
  } finally {
    db.close()
  }
}

export async function idbDelete(
  dbName: string,
  storeName: string,
  key: IDBValidKey,
): Promise<void> {
  const db = await openKeyValueDb(dbName, storeName)
  try {
    await requestToPromise(
      db.transaction(storeName, 'readwrite').objectStore(storeName).delete(key),
    )
  } finally {
    db.close()
  }
}
