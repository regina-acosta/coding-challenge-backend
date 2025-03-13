// NOTE: this is a mock implementation and is designed to fail when the `amount` is between 600 and 700
export async function sendVendorPayment(
  recipient: string,
  amount: number
): Promise<VendorResponse> {
  await sleep();

  return { type: shouldFail(amount) ? "FAILED" : "SUCCEEDED" };
}

function shouldFail(amount: number) {
  return amount >= 600 && amount < 700;
}

async function sleep() {
  return new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
}

type VendorResponse = { type: "FAILED" | "SUCCEEDED" };
