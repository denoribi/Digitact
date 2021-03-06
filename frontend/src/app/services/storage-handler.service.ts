/**
 * @description
 *  This file handles all the CRUD operations related to ionic storage
 */
import { Injectable } from '@angular/core';
import {
  createInstance,
  defineDriver,
  INDEXEDDB,
  LOCALSTORAGE,
} from 'localforage';
import { _driver } from 'localforage-cordovasqlitedriver';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

@Injectable({
  providedIn: 'root',
})
export class StorageHandlerService {
  applicantDetailsDb: Promise<LocalForage>;
  applicantRatingsDb: Promise<LocalForage>;
  commonPropertiesDb: Promise<LocalForage>;

  constructor() {
    const commonPropertiesDbConfig = {
      name: 'digitactDb',
      storeName: 'commonProperties',
      driverOrder: ['sqlite', 'indexeddb', 'localstorage'],
    };

    this.commonPropertiesDb = new Promise((resolve, reject) => {
      let db: LocalForage;
      defineDriver(CordovaSQLiteDriver)
        .then(() => {
          db = createInstance(commonPropertiesDbConfig);
        })
        .then(() =>
          db.setDriver(
            this.getDriverOrder(commonPropertiesDbConfig.driverOrder)
          )
        )
        .then(() => {
          resolve(db);
        })
        .catch((reason) => reject(reason));
    });
    const applicantDetailsDbConfig = {
      name: 'digitactDb',
      storeName: 'applicantsDetails',
      driverOrder: ['sqlite', 'indexeddb', 'localstorage'],
    };

    this.applicantDetailsDb = new Promise((resolve, reject) => {
      let db: LocalForage;
      defineDriver(CordovaSQLiteDriver)
        .then(() => {
          db = createInstance(applicantDetailsDbConfig);
        })
        .then(() =>
          db.setDriver(
            this.getDriverOrder(applicantDetailsDbConfig.driverOrder)
          )
        )
        .then(() => {
          resolve(db);
        })
        .catch((reason) => reject(reason));
    });

    const applicantRatingsDbConfig = {
      name: 'digitactDb',
      storeName: 'applicantsRating',
      driverOrder: ['sqlite', 'indexeddb', 'localstorage'],
    };

    this.applicantRatingsDb = new Promise((resolve, reject) => {
      let db: LocalForage;
      defineDriver(CordovaSQLiteDriver)
        .then(() => {
          db = createInstance(applicantRatingsDbConfig);
        })
        .then(() =>
          db.setDriver(
            this.getDriverOrder(applicantRatingsDbConfig.driverOrder)
          )
        )
        .then(() => {
          resolve(db);
        })
        .catch((reason) => reject(reason));
    });
  }

  /**
   * Used to get the corresponding storage method keyword used by localforage
   * @param driveOrder - Holds the prioritised driveer order array
   * @returns array of strings with corresponding keyword supported by localforage
   */

  getDriverOrder(driverOrder: string[]): string[] {
    return driverOrder.map((driver) => {
      switch (driver) {
        case 'sqlite':
          return _driver;
        case 'indexeddb':
          return INDEXEDDB;
        case 'localstorage':
          return LOCALSTORAGE;
      }
    });
  }

  /**
   * Used to generate next Id
   * @returns Promise of string containing next id
   */

  async getNextId(): Promise<string> {
    return await new Promise((resolve, reject) => {
      this.commonPropertiesDb
        .then((localForageObject) => {
          localForageObject.getItem('recentApplicantId').then((val: number) => {
            const nextId: number = val ? val + 1 : 1;
            localForageObject.setItem('recentApplicantId', nextId);
            resolve(nextId.toString());
          });
        })
        .catch((reason) => reject(reason));
    });
  }

  /**
   * Used to create and and add an item in the storage
   * @param key Unique key for the item
   * @param value Conatains the FormsData field objects
   * @returns Promise of forms data object
   */
  async addItem<T>(
    dbObject: Promise<LocalForage>,
    key: string,
    value: T
  ): Promise<T> {
    return await new Promise((resolve, reject) => {
      dbObject
        .then((localForageObject) => {
          localForageObject.setItem(key, value).then((storedValue: T) => {
            resolve(storedValue);
          });
        })
        .catch((reason) => reject(reason));
    });
  }
  /**
   * Used to get an item from the storage
   * @param dbObject The storage object
   * @param key Unique key for the item
   * @returns Promise of forms data object
   */
  async getItem<T>(dbObject: Promise<LocalForage>, key: string): Promise<T> {
    return await new Promise((resolve, reject) => {
      dbObject
        .then((localForageObject) => {
          localForageObject.getItem(key).then((storedValue: T) => {
            resolve(storedValue);
          });
        })
        .catch((reason) => reject(reason));
    });
  }

  /**
   * Used to get all items from the storage
   * @param dbObject The storage object
   * @returns Promise of array of forms data object
   */
  async getAllItems<T>(dbObject: Promise<LocalForage>): Promise<Array<T>> {
    const items: Array<T> = [];
    return await new Promise((resolve, reject) => {
      dbObject
        .then((localForageObject) => {
          localForageObject
            .iterate((storedValue: T) => {
              items.push(storedValue);
            })
            .then(() => {
              resolve(items);
            });
        })
        .catch((reason) => reject(reason));
    });
  }

  /**
   * Used to delete an item from the storage
   * @param dbObject The storage object
   * @param key Unique key for the item
   * @returns Promise of void
   */
  async deleteItem(dbObject: Promise<LocalForage>, key: string): Promise<void> {
    return await new Promise((resolve, reject) => {
      dbObject
        .then((localForageObject) => {
          const item = localForageObject.getItem(key);
          if (!item) {
            resolve();
          }
          localForageObject.removeItem(key).then(() => {
            resolve();
          });
        })
        .catch((reason) => reject(reason));
    });
  }

  /**
   * Used to delete all items in the storage
   * @param dbObject The storage object
   * @returns Promise of void
   */
  async deleteAllItems(dbObject: Promise<LocalForage>): Promise<void> {
    return await dbObject.then((localForageObject) => {
      localForageObject.clear();
    });
  }

  /**
   * Used to update an existing item in the storage
   * @param dbObject The storage object
   * @param key Unique key for the item
   * @param value Conatains value to update
   * @returns Promise of forms data object
   */
  async updateItem<T>(
    dbObject: Promise<LocalForage>,
    key: string,
    value: T
  ): Promise<T> {
    return await new Promise((resolve, reject) => {
      dbObject
        .then((localForageObject) => {
          const item = localForageObject.getItem(key);
          if (!item) {
            resolve(undefined);
          }
          localForageObject.setItem(key, value).then(() => {
            resolve(value);
          });
        })
        .catch((reason) => reject(reason));
    });
  }
}
