import { beforeEach, expect, it, jest } from "@jest/globals";
import { createPayment } from "./createPayment";
import { collections } from "../scaffolding/mongo";
type InsertOneResult = { insertedId: string };

jest.mock("../scaffolding/mongo", () => ({
    collections: {
        payments: {
            insertOne: jest.fn().mockImplementation(() => {
                return Promise.resolve({ insertedId: '123456789' });
            }),
            findOne: jest.fn().mockImplementation(() => {
                return Promise.resolve({
                    _id: '123456789', amount: 150, recipient: "George" });
            }),
        }
    }
}));

beforeEach(() => {
    jest.clearAllMocks();
});

it("persists payment", async () => {
    const payment = await createPayment({ amount: 150, recipient: "George" });
    expect(collections.payments.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 150, recipient: "George" }));

    expect(payment).toEqual({
        _id: "123456789",
        amount: 150,
        recipient: "George",
    });
});

it("errors if negative amount", async () => {
    await expect(createPayment({ amount: -150, recipient: "Mary" }))
        .rejects
        .toThrow("Amount must be a positive number.");
});
