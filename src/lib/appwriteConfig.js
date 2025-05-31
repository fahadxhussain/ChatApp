import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

client
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // Your Appwrite endpoint
  .setProject('683307d50017d0b19e87');             // Your Project ID

export const account = new Account(client);
export const storage = new Storage(client);
export const database = new Databases(client);

// Your actual IDs:
export const DATABASE_ID = '68331eef003acd8b9b71';
export const USERS_COLLECTION_ID = '68331f2100153d3d21e9';
export const AVATAR_BUCKET_ID = '68331900001c24aed04f';
