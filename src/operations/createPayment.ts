import { getOnePayment } from "scaffolding/getOnePayment";
import { collections } from "scaffolding/mongo";
import {PaymentDoc, PaymentStatus} from "types";
import { v4 } from "uuid";

type Params = {
  amount: number;
  recipient: string;
};

export async function createPayment(params: Params): Promise<PaymentDoc> {
    if (params.amount < 0) {
        throw new Error("Amount must be a positive number.");
    }
    if (!params.recipient) {
        throw new Error("Recipient must be provided.");
    }
  const { insertedId } = await collections.payments.insertOne({
    _id: v4(),
    amount: params.amount,
    recipient: params.recipient,
    status: PaymentStatus.PENDING,
  });

  return await getOnePayment(insertedId);
}
