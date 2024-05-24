function openDB(name: string, version: number = 1): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version)

    request.onerror = (event: Event) => reject((event.target as IDBRequest).error)
    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBRequest).result as IDBDatabase;
      console.log('Database opened successfully');
      console.log('Existing object stores:', db.objectStoreNames);
      resolve(db);
    };
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      console.log('onupgradeneeded')
      const db = (event.target as IDBRequest).result as IDBDatabase
      console.log(`Upgrade needed: Old version ${event.oldVersion}, New version ${event.newVersion}`)
      if (!db.objectStoreNames.contains('chunks')) {
        db.createObjectStore('chunks', { keyPath: 'name' }) // 确保对象存储名称和keyPath正确
        db.createObjectStore('hash', { keyPath: 'name' }) 
        console.log('Object store "chunks" created')
      }
    }
  })
}

function executeTransaction(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  transactionCallback: (store: IDBObjectStore) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode)
    transaction.onerror = (event: Event) => reject((event.target as IDBRequest).error)
    transaction.oncomplete = () => resolve()

    const store = transaction.objectStore(storeName)
    transactionCallback(store)
  })
}

function addData(db: IDBDatabase, storeName: string, data: any): Promise<IDBValidKey> {
  return new Promise((resolve, reject) => {
    executeTransaction(db, storeName, 'readwrite', (store) => {
      const request = store.add(data)
      request.onerror = (event: Event) => reject((event.target as IDBRequest).error)
      request.onsuccess = (event) => resolve((event.target as IDBRequest).result as IDBValidKey)
    }).catch(reject)
  })
}

function getData(db: IDBDatabase, storeName: string, key: IDBValidKey): Promise<any> {
  return new Promise((resolve, reject) => {
    executeTransaction(db, storeName, 'readonly', (store) => {
      const request = store.get(key)
      request.onerror = (event: Event) => reject((event.target as IDBRequest).error)
      request.onsuccess = (event: Event) => resolve((event.target as IDBRequest).result)
    }).catch(reject)
  })
}

export {
  openDB,
  addData,
  getData,
  executeTransaction,
}
