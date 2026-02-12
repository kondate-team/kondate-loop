import type { DataStore } from "./types";
import { FileDataStore } from "./fileStore";
import { DynamoDataStore } from "./dynamoStore";

export function createDataStore(): DataStore {
  const driver = (process.env.DATA_STORE_DRIVER ?? "file").toLowerCase();
  if (driver === "dynamo") {
    return new DynamoDataStore(process.env.TABLE_NAME);
  }
  return new FileDataStore();
}
