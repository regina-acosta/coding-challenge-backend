export type PaymentDoc = {
  _id: string;
  amount: number;
  recipient: string;
  status: PaymentStatus;
  sentAt?: Date | null;
  errorMessage?: string | null;
};

export enum PaymentStatus {
    SUCCEEDED = "SUCCEEDED",
    FAILED = "FAILED",
    PENDING = "PENDING",
}
