// import Dexie from 'dexie';

// class EnhancedAppDB extends Dexie {
//     syncQueue;

//     constructor() {
//         super('enhancedAppDB');
//         this.version(1).stores({
//             syncQueue: 'id, *timestamp, domain',
//         });
//     }
// }

// export const db = new EnhancedAppDB();

import Dexie from 'dexie';
class genericOfflineDB extends Dexie {
    // Your tables will be properties of this class
    records;
    viewConfigs;
    syncQueue;
    data;
    tableState;

    constructor() {
        super('genericOfflineDB');
        this.version(2).stores({
            records: 'id, *timestamp',
            viewConfigs: 'id, *timestamp',
            syncQueue: 'id, *timestamp',
            data: 'id, *lastModified',
            tablestate: 'id, *timestamp, name, email, phone'
        });
    }
}

export const dexieDB = new genericOfflineDB();


// import Dexie from 'dexie';

// let domainStores = {};

// class DynamicDomainDB extends Dexie {
//     syncQueue; // A common store for sync operations

//     constructor() {
//         super('dynamicDomainDB');
//         this.version(1).stores({
//             syncQueue: '++id, type, data, domain'
//         });
//     }

//     // Method to dynamically add a new domain store
//     addDomainStore(domain, schema) {
//         const currentVersion = this.verno;
        
//         this.version(++currentVersion).stores({
//             [domain]: schema
//         });

//         // Store the schema for future reference
//         domainStores[domain] = schema;

//         // Re-open the database with the new version
//         return this.open();
//     }

//     // Method to check and add a domain if it doesn't exist
//     ensureDomainStore(domain, schema = 'id, *name, updated_at') {
//         if (!this[`${domain}`]) {
//             return this.addDomainStore(domain, schema);
//         }
//         return Promise.resolve(); // Already exists, no need to do anything
//     }
// }

// const db = new DynamicDomainDB();

// // Usage:
// async function handleDomainData(domain, data) {
//     try {
//         // Ensure the store for this domain exists with a default schema
//         await db.ensureDomainStore(domain);
        
//         // Add or update data in the domain's store
//         await db[domain].put(data);
        
//         // Queue sync operation
//         await db.syncQueue.add({
//             type: 'add', // or 'update', 'delete'
//             data,
//             domain
//         });
//     } catch (error) {
//         console.error('Failed to handle domain data:', error);
//     }
// }

// // Example usage
// handleDomainData('y_state', { id: 1, name: 'State One', updated_at: new Date() });
// handleDomainData('y_sales', { id: 1, product: 'Product A', sold_on: new Date() });

// // If you need custom columns for a domain
// db.ensureDomainStore('y_support', 'id, *issue, status, created_at').then(() => {
//     db.y_support.put({ id: 1, issue: 'Network issue', status: 'Open', created_at: new Date() });
// });



// import Dexie from 'dexie';

// class DynamicDomainDB extends Dexie {
//     syncQueue; // Common store for sync operations
//     y_state; // Store for y_state domain

//     constructor() {
//         super('dynamicDomainDB');

//         // Initial schema definition for version 1
//         this.version(1).stores({
//             syncQueue: '++id, type, data, domain',
//             y_state: 'id, &email, *name, phone, address, city, state, country, created_at, updated_at'
//         });

//         // Define indexes for quick lookup
//         this.y_state = this.table('y_state');
        
//         // If you want to enforce uniqueness on email, we can add an index like this:
//         this.y_state.mapToClass(class YState {
//             constructor(id, name, email, phone, address, city, state, country, created_at, updated_at) {
//                 this.id = id;
//                 this.name = name;
//                 this.email = email;
//                 this.phone = phone;
//                 this.address = address;
//                 this.city = city;
//                 this.state = state;
//                 this.country = country;
//                 this.created_at = created_at || new Date();
//                 this.updated_at = updated_at || new Date();
//             }
//         });
//     }
// }

// const db = new DynamicDomainDB();

// // Example of adding an item to y_state
// db.y_state.add({
//     id: 1, // Assuming you generate this ID server-side
//     name: "John Doe",
//     email: "john@example.com",
//     phone: "123-456-7890",
//     address: "123 Example St",
//     city: "Example City",
//     state: "Example State",
//     country: "Example Country",
//     // created_at and updated_at will be set to current date if not provided
// });



// // // Generic approach

// import Dexie from 'dexie';

// class GenericOfflineDB extends Dexie {
//     syncQueue;

//     constructor() {
//         super('genericOfflineDB');
//         this.version(1).stores({
//             syncQueue: '++id, table, data, operation'
//         });
//     }

//     // Method to dynamically add a new store for any table
//     async addStore(tableName) {
//         // Instead of modifying verno directly, we use the version method with a new number
//         const newVersion = this.verno + 1;
//         await this.version(newVersion).stores({
//             [tableName]: 'id'
//         });
//         // Open the database with the new schema
//         await this.open();
//         console.log(`Store ${tableName} added at version ${this.verno}`);
//     }

//     // Method to ensure a store exists for a table
//     async ensureStore(tableName) {
//         if (!this[tableName]) {
//             await this.addStore(tableName);
//         }
//         return this[tableName];
//     }
// }

// export const db = new GenericOfflineDB();