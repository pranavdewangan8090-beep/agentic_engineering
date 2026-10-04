export async function createOrderRecord(input: {
  userId: string;
  total: number;
  status: string;
}) {
  // Simulated persistence layer.
  if (!Number.isFinite(input.total)) {
    throw new Error("database rejected non-finite total");
  }
  return { id: "ord_demo", ...input };
}
