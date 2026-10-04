import { processOrder } from "../services/orders.js";

export async function createOrder(req: Request) {
  const body = await req.json();
  return processOrder(body);
}
