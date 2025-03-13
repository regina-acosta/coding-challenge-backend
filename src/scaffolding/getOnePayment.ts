import { collections } from "scaffolding/mongo";
import { PaymentDoc } from "types";

export async function getOnePayment(id: string): Promise<PaymentDoc> {
  const doc = await collections.payments.findOne({ _id: id });

  if (!doc) {
    throw new Error("not found");
  }

  return doc;
}
