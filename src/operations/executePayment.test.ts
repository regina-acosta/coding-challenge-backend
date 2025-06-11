import { expect, it, jest } from "@jest/globals";
import { executePayment } from "./executePayment";
import { PaymentStatus } from "types";
import { sendVendorPayment } from "../scaffolding/vendor/sendVendorPayment";
import { collections } from "../scaffolding/mongo";

type VendorResponse = { type: "FAILED" | "SUCCEEDED" };

const mockPayments = new Map<string, any>();

jest.mock("../scaffolding/getOnePayment", () => ({
  getOnePayment: jest.fn((id: string) => Promise.resolve(mockPayments.get(id))),
}));

jest.mock("../scaffolding/mongo", () => ({
  collections: {
    payments: {
      updateOne: jest.fn(),
    },
  },
}));

jest.mock("../scaffolding/vendor/sendVendorPayment", () => ({
  sendVendorPayment: jest.fn(),
}));

it("executes payment through vendor interface", async () => {
  const paymentId = "p1";
  mockPayments.set(paymentId, {
    _id: paymentId,
    amount: 100,
    recipient: "George@mail.com",
    status: PaymentStatus.PENDING,
  });

  (sendVendorPayment as jest.MockedFunction<(
      recipient: string,
      amount: number
  ) => Promise<VendorResponse>>).mockResolvedValue({ type: "SUCCEEDED" });

  await executePayment(paymentId);

  expect(sendVendorPayment).toHaveBeenCalledWith("George@mail.com", 100);
  expect(collections.payments.updateOne).toHaveBeenCalledWith(
      { _id: paymentId },
      expect.objectContaining({
        $set: expect.objectContaining({ status: PaymentStatus.SUCCEEDED }),
      })
  );
});

it("allows failed payments to be re-executed", async () => {
  const paymentId = "p2";
  mockPayments.set(paymentId, {
    _id: paymentId,
    amount: 500,
    recipient: "George@mail.com",
    status: PaymentStatus.FAILED,
  });

  (sendVendorPayment as jest.MockedFunction<(
      recipient: string,
      amount: number
  ) => Promise<VendorResponse>>).mockResolvedValue({ type: "SUCCEEDED" });

  await executePayment(paymentId);

  expect(sendVendorPayment).toHaveBeenCalled();
  expect(collections.payments.updateOne).toHaveBeenCalledWith(
      { _id: paymentId },
      expect.objectContaining({
        $set: expect.objectContaining({ status: PaymentStatus.SUCCEEDED }),
      })
  );
});

it("prevents successful payments from being executed again", async () => {
  const paymentId = "p3";
  mockPayments.set(paymentId, {
    _id: paymentId,
    amount: 500,
    recipient: "George@mail.com",
    status: PaymentStatus.SUCCEEDED,
  });

  await executePayment(paymentId);

  expect(sendVendorPayment).not.toHaveBeenCalled();
  expect(collections.payments.updateOne).not.toHaveBeenCalled();
});

it("prevents concurrent executions of payment", async () => {
  const paymentId = "p4";
  let currentStatus = PaymentStatus.PENDING;

  // Simulate a shared DB
  mockPayments.set(paymentId, {
    _id: paymentId,
    amount: 550,
    recipient: "test@example.com",
    get status() {
      return currentStatus;
    },
    set status(value) {
      currentStatus = value;
    },
  });

  (sendVendorPayment as jest.Mock).mockImplementation(async () => {
    await new Promise((res) => setTimeout(res, 100)); // artificial delay
    return { type: "SUCCEEDED" };
  });

  (collections.payments.updateOne as jest.MockedFunction<
      (filter: any, update: { $set: { status: PaymentStatus } }) => Promise<any>
  >).mockImplementation(async (_filter, update) => {
    currentStatus = update.$set.status;
  });

  await Promise.all([
    executePayment(paymentId),
    executePayment(paymentId),
  ]);

  expect(sendVendorPayment).toHaveBeenCalledTimes(1);
});
