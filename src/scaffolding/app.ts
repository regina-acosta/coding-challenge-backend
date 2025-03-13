import express from "express";
import { createPayment } from "operations/createPayment";
import { executePayment } from "operations/executePayment";
import { getAllPayments } from "scaffolding/getAllPayments";
import { getOnePayment } from "scaffolding/getOnePayment";
import { PaymentDoc } from "types";

export const app = express();

app.use(express.json());

app.get<string, never, { objects: PaymentDoc[] }, never, never>(
  "/payments",
  async (req, res) => {
    const payments = await getAllPayments();

    res.json({ objects: payments });
  },
);

app.get<string, { id: string }, { object: PaymentDoc }, never, never>(
  "/payments/:id",
  async (req, res) => {
    const payment = await getOnePayment(req.params.id);

    if (!payment) {
      res.status(404).send();
      return;
    }

    res.json({ object: payment });
  },
);

app.post<
  string,
  {},
  { object: PaymentDoc },
  { amount: number, recipient: string; },
  never
>("/payments", async (req, res) => {
  const payment = await createPayment({
    recipient: req.body.recipient,
    amount: req.body.amount,
  });

  res.json({ object: payment });
});

app.post<string, { id: string }, { object: PaymentDoc }, never, never>(
  "/payments/:id/execute",
  async (req, res) => {
    const payment = await executePayment(req.params.id);

    res.json({ object: payment });
  },
);
