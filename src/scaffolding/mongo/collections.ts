import { getDbOrThrow } from "scaffolding/mongo/client";
import { PaymentDoc } from "types";

export const collections = {
  get payments() {
    return getDbOrThrow().collection<PaymentDoc>("payments");
  },
};
