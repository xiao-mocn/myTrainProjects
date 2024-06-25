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

async function executeTransaction<T>(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  // 为什么要用 callback 方式呢？这里看起来应该用 promise 好一点
  transactionCallback: (store: IDBObjectStore) => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const transaction = db.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    resolve(await transactionCallback(store))
    transaction.onerror = (event: Event) => reject((event.target as IDBRequest).error)
  })
}

function addData(db: IDBDatabase, storeName: string, data: any): Promise<IDBValidKey> {
  return executeTransaction(db, storeName, 'readwrite', (store) => {
    const request = store.add(data)
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => resolve((event.target as IDBRequest).result)
      request.onerror = (event: Event) => reject((event.target as IDBRequest).error)
    })
  })
}

function getData(db: IDBDatabase, storeName: string, key: IDBValidKey): Promise<any> {
  return  executeTransaction(db, storeName, 'readonly', (store) => {
    const request = store.get(key)
    return new Promise((resolve, reject) => {
      request.onerror = (event: Event) => reject((event.target as IDBRequest).error)
      request.onsuccess = (event: Event) => resolve((event.target as IDBRequest).result)
    })
  })
}

function deleteRecord(db: IDBDatabase, storeName: string, key: IDBValidKey): Promise<void> {
  return executeTransaction(db, storeName, 'readwrite', (store) => {
    const request = store.delete(key);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
    });
  });
}

export {
  openDB,
  addData,
  getData,
  deleteRecord,
  executeTransaction,
}
