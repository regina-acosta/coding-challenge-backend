import { collections } from "scaffolding/mongo";
import { PaymentDoc } from "types";

export async function getAllPayments(): Promise<PaymentDoc[]> {
  return collections.payments.find().toArray();
}
