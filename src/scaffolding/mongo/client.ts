import { Db, MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

let server: MongoMemoryServer | null;
let clientMaybe: MongoClient | null;

export function getDbOrThrow(): Db {
  if (!clientMaybe) {
    throw new Error("mongo client has not been configured");
  }

  return clientMaybe.db("oh-coding-challenge");
}

export async function initClient() {
  if (clientMaybe) {
    return;
  }

  server = await MongoMemoryServer.create();

  clientMaybe = new MongoClient(server.getUri());
}

export async function shutdown() {
  await clientMaybe?.close();
  await server?.stop();

  clientMaybe = server = null;
}
