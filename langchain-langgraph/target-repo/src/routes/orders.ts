import { createOrder } from "../controllers/orders.js";

export async function postOrders(req: Request) {
  return createOrder(req);
}
