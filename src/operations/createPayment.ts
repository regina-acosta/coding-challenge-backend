import { getOnePayment } from "scaffolding/getOnePayment";
import { collections } from "scaffolding/mongo";
import { PaymentDoc } from "types";
import { v4 } from "uuid";

type Params = {
  amount: number;
  recipient: string;
};

export async function createPayment(params: Params): Promise<PaymentDoc> {
  const { insertedId } = await collections.payments.insertOne({
    _id: v4(),
    amount: params.amount,
    recipient: params.recipient,
  });

  return await getOnePayment(insertedId);
}
