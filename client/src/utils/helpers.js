export function pluralize(name, count) {
  if (count === 1) {
    return name
  }
  return name + 's'
}

export function idbPromise(storeName, method, object) {
  return new Promise((resolve, reject) => {
    //open connection to the database
    const request = window.indexedDB.open('shop-shop', 1);

    //create var to hold ref to database, transaction, and obj store
    let db, tx, store;

    // if version has changed (or if this is the first time using the database), run this method and create the three object stores 
    request.onupgradeneeded = function (e) {
      const db = request.result;
      // create object store for each type of data and set "primary" key index to be the `_id` of the data
      db.createObjectStore('products', { keyPath: '_id' });
      db.createObjectStore('categories', { keyPath: '_id' });
      db.createObjectStore('cart', { keyPath: '_id' });
    };

    //handle errors while connecting
    request.onerror = function (e) {
      console.log('There was an error');
    };

    //on database open success
    request.onsuccess = function (e) {
      //save reference of db
      db = request.result;

      //open transaction
      tx = db.transaction(storeName, 'readwrite');

      //save ref to object store
      store = tx.objectStore(storeName);

      //if errors
      db.onerror = function (e) {
        console.log('error', e);
      };

      switch (method) {
        case 'put':
          store.put(object);
          resolve(object);
          break;
        case 'get':
          const all = store.getAll();
          all.onsuccess = function() {
            resolve(all.result);
          };
          break;
        case 'delete':
          store.delete(object._id);
          break;
        default:
          console.log('Not a valid method');
          break;
      }

      //when transaction is complete close connection
      tx.oncomplete = function () {
        db.close();
      };
    };
  });
}
