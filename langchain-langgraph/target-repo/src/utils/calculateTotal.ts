export function calculateTotal(items: { price: number; quantity: number }[]) {
  // BUG: reduce has no initial value.
  // For a single item, the accumulator becomes the whole item object.
  return items.reduce((sum, item) => sum + item.price * item.quantity);
}
