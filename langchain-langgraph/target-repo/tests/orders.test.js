import test from "node:test";
import assert from "node:assert/strict";

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity);
}

test("calculates total for multiple items", () => {
  assert.equal(calculateTotal([
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 }
  ]), 35);
});

test("calculates total for one item", () => {
  // This exposes the bug.
  assert.equal(calculateTotal([
    { price: 10, quantity: 2 }
  ]), 20);
});
