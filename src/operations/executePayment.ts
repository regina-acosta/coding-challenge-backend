import {PaymentDoc, PaymentStatus} from "types";
import {sendVendorPayment} from "../scaffolding/vendor/sendVendorPayment";
import {collections} from "../scaffolding/mongo";
import {getOnePayment} from "../scaffolding/getOnePayment";

const inProgress = new Set<string>();
export async function executePayment(id: string): Promise<PaymentDoc> {

const payment = await getOnePayment(id)

    if (!payment) {
      console.error(`Payment with id ${id} not found`);
      throw new Error(`Payment with id ${id} not found`);
    }
    // check if the payment is already in progress. Prevents double execution.
    if (inProgress.has(payment._id)) return payment;
    inProgress.add(payment._id);

    if(payment.status == PaymentStatus.SUCCEEDED) {
        console.warn(`Payment with id ${id} has already been executed`);
        return payment;
    }
    const { amount, recipient } = payment;

    try {
      const response = await sendVendorPayment(recipient, amount);

      if (response.type === "SUCCEEDED") {
        const update = {
          $set: {
            status: PaymentStatus.SUCCEEDED,
            sentAt: new Date(),
            errorMessage: null,
          },
        };
        await collections.payments.updateOne({ _id: payment._id }, update);

      } else if(response.type === "FAILED") {
        const update = {
          $set: {
            status: PaymentStatus.FAILED,
            errorMessage: "Amount must not be between 600 and 700.",
          },
        };
        await collections.payments.updateOne({ _id: payment._id }, update);

      }
    } catch (err: any) {
      console.error("Payment execution failed: " + err.message);
      const update = {
        $set: {
          status: PaymentStatus.FAILED,
          errorMessage: err.message,
        },
      };
      await collections.payments.updateOne({ _id: payment._id }, update);
    }finally {
        inProgress.delete(payment._id);
    }

    const updatedPayment = await getOnePayment(id);
    return updatedPayment;
}
