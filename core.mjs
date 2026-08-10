export const bloomKeys = ["remember", "understand", "apply", "analyze", "evaluate", "create"];

export function rowTotal(row) {
  return bloomKeys.reduce((total, key) => total + Math.max(0, Number(row[key]) || 0), 0);
}

export function tosSummary(rows) {
  const grandTotal = rows.reduce((total, row) => total + rowTotal(row), 0);
  const columns = Object.fromEntries(
    bloomKeys.map((key) => [key, rows.reduce((total, row) => total + Math.max(0, Number(row[key]) || 0), 0)])
  );
  return { grandTotal, columns };
}

export function validatePackage(rows, questions) {
  const { grandTotal } = tosSummary(rows);
  const scored = questions.filter((question) => question.type !== "instruction");
  const mapped = scored.filter((question) => question.tosRowId && question.bloom);
  const errors = [];
  if (!rows.length) errors.push("Add at least one learning outcome.");
  if (!grandTotal) errors.push("Allocate at least one test item in the TOS.");
  if (grandTotal !== scored.length) errors.push(`TOS allocates ${grandTotal} items but the TQ contains ${scored.length}.`);
  if (mapped.length !== scored.length) errors.push(`${scored.length - mapped.length} test item(s) still need a TOS mapping.`);
  if (scored.some((question) => !question.stem.trim())) errors.push("Every scored question needs a question stem.");
  return { valid: errors.length === 0, errors, grandTotal, questionCount: scored.length, mappedCount: mapped.length };
}

export function canPrint(signatures, reproductionComplete, status) {
  return status === "approved" && reproductionComplete && ["faculty", "coordinator", "dean"].every((role) => signatures[role]);
}
