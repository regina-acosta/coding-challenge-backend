import { afterAll, beforeAll, beforeEach } from "@jest/globals";
import { collections } from "scaffolding/mongo";
import { initClient, shutdown } from "scaffolding/mongo/client";

beforeAll(async () => {
  await initClient();
});

beforeEach(async () => {
  // clear db between tests
  await Promise.all(
    Object.values(collections).map((x: any) => x.deleteMany({}))
  );
});

afterAll(async () => {
  await shutdown()
});
