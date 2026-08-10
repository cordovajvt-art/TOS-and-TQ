import test from "node:test";
import assert from "node:assert/strict";
import { canPrint, rowTotal, tosSummary, validatePackage } from "../core.mjs";

test("TOS totals are calculated across Bloom levels", () => {
  const rows = [{ remember: 2, understand: 3, apply: 4, analyze: 1, evaluate: 0, create: 1 }];
  assert.equal(rowTotal(rows[0]), 11);
  assert.deepEqual(tosSummary(rows), { grandTotal: 11, columns: { remember: 2, understand: 3, apply: 4, analyze: 1, evaluate: 0, create: 1 } });
});

test("submission validation catches allocation and mapping mismatches", () => {
  const rows = [{ id: "r1", remember: 2 }];
  const result = validatePackage(rows, [{ type: "multiple-choice", stem: "Question", tosRowId: "", bloom: "" }]);
  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 2);
});

test("submission is valid when item counts and mappings reconcile", () => {
  const rows = [{ id: "r1", remember: 1 }];
  const questions = [{ type: "multiple-choice", stem: "Question", tosRowId: "r1", bloom: "remember" }];
  assert.equal(validatePackage(rows, questions).valid, true);
});

test("print gate requires status, reproduction fields, and all signatures", () => {
  const signatures = { faculty: true, coordinator: true, dean: true };
  assert.equal(canPrint(signatures, true, "approved"), true);
  assert.equal(canPrint({ ...signatures, dean: false }, true, "approved"), false);
  assert.equal(canPrint(signatures, false, "approved"), false);
  assert.equal(canPrint(signatures, true, "pending-dean"), false);
});
