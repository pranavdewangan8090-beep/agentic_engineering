import { createOrderRecord } from "../repositories/orders.js";
import { calculateTotal } from "../utils/calculateTotal.js";

export async function processOrder(body: { userId: string; items: { price: number; quantity: number }[] }) {
  const total = calculateTotal(body.items);

  if (!Number.isFinite(total)) {
    throw new Error("Invalid order total");
  }

  return createOrderRecord({
    userId: body.userId,
    total,
    status: "pending"
  });
}
