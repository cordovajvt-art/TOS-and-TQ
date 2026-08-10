import { bloomKeys, canPrint, rowTotal, tosSummary, validatePackage } from "./core.mjs";

const icons = {
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h5"/></svg>',
  review: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 4h8M9 3h6v3H9zM7 5H5v16h14V5h-2M8 11h8M8 15h5"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>',
  help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 3.3 2.5c-.8.3-.8 1-.8 1.8M12 17h.01"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3ZM18 14l.7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7L18 14Z"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3 3 19 9-19 9 3-9-3-9Z"/><path d="M6 12h16"/></svg>'
};

document.querySelectorAll("[data-icon]").forEach((node) => { node.innerHTML = icons[node.dataset.icon] || ""; });

const defaultState = {
  status: "draft",
  reproductionComplete: false,
  signatures: { faculty: true, coordinator: false, dean: false },
  rows: [
    { id: "outcome-1", title: "Explain linear data structures and their operations", remember: 3, understand: 4, apply: 2, analyze: 1, evaluate: 0, create: 0 },
    { id: "outcome-2", title: "Apply searching and sorting algorithms to problems", remember: 2, understand: 3, apply: 5, analyze: 3, evaluate: 1, create: 0 },
    { id: "outcome-3", title: "Analyze tree and graph traversal strategies", remember: 1, understand: 2, apply: 4, analyze: 4, evaluate: 2, create: 1 },
    { id: "outcome-4", title: "Design an efficient solution using suitable structures", remember: 0, understand: 0, apply: 0, analyze: 1, evaluate: 0, create: 1 }
  ],
  questions: [
    { id: "q1", type: "multiple-choice", stem: "Which data structure follows the Last-In, First-Out principle?", tosRowId: "outcome-1", bloom: "remember" },
    { id: "q2", type: "multiple-choice", stem: "What is the average-case time complexity of binary search?", tosRowId: "outcome-2", bloom: "understand" },
    { id: "q3", type: "essay", stem: "Compare breadth-first and depth-first traversal for a sparse graph.", tosRowId: "outcome-3", bloom: "analyze" },
    { id: "q4", type: "essay", stem: "Design a structure for an undo history and justify your choice.", tosRowId: "outcome-4", bloom: "create" }
  ]
};

let state;
try { state = { ...defaultState, ...JSON.parse(localStorage.getItem("examflow-state")) }; }
catch { state = structuredClone(defaultState); }

const $ = (selector) => document.querySelector(selector);
const save = () => {
  localStorage.setItem("examflow-state", JSON.stringify(state));
  $(".save-state span").textContent = "All changes saved";
};
const markSaving = () => { $(".save-state span").textContent = "Saving…"; window.setTimeout(save, 250); };

function renderTos() {
  $("#tosBody").innerHTML = state.rows.map((row) => `
    <tr data-row-id="${row.id}">
      <td><input class="outcome-input" aria-label="Learning outcome" value="${escapeHtml(row.title)}"></td>
      ${bloomKeys.map((key) => `<td><input class="number-input" type="number" min="0" max="99" aria-label="${key} items" data-key="${key}" value="${row[key] || 0}"></td>`).join("")}
      <td class="row-total">${rowTotal(row)}</td>
      <td><button class="icon-button delete-row" aria-label="Delete ${escapeHtml(row.title)}">×</button></td>
    </tr>`).join("");
  const summary = tosSummary(state.rows);
  $("#tosFoot").innerHTML = `<tr><td>Column total</td>${bloomKeys.map((key) => `<td>${summary.columns[key]}</td>`).join("")}<td>${summary.grandTotal}</td><td></td></tr><tr><td>Distribution</td>${bloomKeys.map((key) => `<td>${summary.grandTotal ? Math.round(summary.columns[key] / summary.grandTotal * 100) : 0}%</td>`).join("")}<td>100%</td><td></td></tr>`;
  $("#tosBadge").textContent = `${summary.grandTotal} items`;
  bindTosInputs();
  renderValidation();
}

function bindTosInputs() {
  $("#tosBody").querySelectorAll("tr").forEach((tr) => {
    const row = state.rows.find((item) => item.id === tr.dataset.rowId);
    tr.querySelector(".outcome-input").addEventListener("input", (event) => { row.title = event.target.value; markSaving(); });
    tr.querySelectorAll(".number-input").forEach((input) => input.addEventListener("input", (event) => {
      row[event.target.dataset.key] = Math.max(0, Number(event.target.value) || 0); renderTos(); markSaving();
    }));
    tr.querySelector(".delete-row").addEventListener("click", () => { state.rows = state.rows.filter((item) => item.id !== row.id); renderAll(); markSaving(); showToast("Learning outcome removed"); });
  });
}

function renderQuestions() {
  const types = { "multiple-choice": "Multiple choice", essay: "Essay", "short-answer": "Short answer", "true-false": "True / false" };
  $("#questionList").innerHTML = state.questions.map((question, index) => `
    <article class="question-card" data-question-id="${question.id}">
      <div class="question-head"><span class="question-number">${index + 1}</span><strong>Question ${index + 1}</strong><select class="field-control type-select" aria-label="Question type">${Object.entries(types).map(([value,label]) => `<option value="${value}" ${question.type === value ? "selected" : ""}>${label}</option>`).join("")}</select></div>
      <textarea class="field-control stem-input" aria-label="Question ${index + 1} stem">${escapeHtml(question.stem)}</textarea>
      <div class="mapping-row"><select class="field-control row-select" aria-label="TOS learning outcome"><option value="">Select TOS outcome</option>${state.rows.map((row) => `<option value="${row.id}" ${question.tosRowId === row.id ? "selected" : ""}>${escapeHtml(row.title)}</option>`).join("")}</select><select class="field-control bloom-select" aria-label="Bloom level"><option value="">Bloom level</option>${bloomKeys.map((key) => `<option value="${key}" ${question.bloom === key ? "selected" : ""}>${key[0].toUpperCase() + key.slice(1)}</option>`).join("")}</select><button class="button secondary remove-question">Remove</button></div>
    </article>`).join("");
  $("#tqBadge").textContent = `${state.questions.length} questions`;
  $("#questionList").querySelectorAll(".question-card").forEach((card) => {
    const question = state.questions.find((item) => item.id === card.dataset.questionId);
    card.querySelector(".type-select").addEventListener("change", (event) => { question.type = event.target.value; renderValidation(); markSaving(); });
    card.querySelector(".stem-input").addEventListener("input", (event) => { question.stem = event.target.value; renderValidation(); markSaving(); });
    card.querySelector(".row-select").addEventListener("change", (event) => { question.tosRowId = event.target.value; renderValidation(); markSaving(); });
    card.querySelector(".bloom-select").addEventListener("change", (event) => { question.bloom = event.target.value; renderValidation(); markSaving(); });
    card.querySelector(".remove-question").addEventListener("click", () => { state.questions = state.questions.filter((item) => item.id !== question.id); renderAll(); markSaving(); });
  });
  renderValidation();
}

function renderValidation() {
  const result = validatePackage(state.rows, state.questions);
  const checks = [
    { good: state.rows.length > 0 && result.grandTotal > 0, label: "TOS allocation", detail: `${result.grandTotal} item${result.grandTotal === 1 ? "" : "s"} planned` },
    { good: result.mappedCount === result.questionCount, label: "Question mapping", detail: `${result.mappedCount} of ${result.questionCount} mapped` },
    { good: result.grandTotal === result.questionCount, label: "Item reconciliation", detail: `${result.grandTotal} TOS / ${result.questionCount} TQ` },
    { good: state.questions.every((q) => q.stem.trim()), label: "Question content", detail: "Required stems completed" }
  ];
  const complete = checks.filter((check) => check.good).length;
  const score = Math.round(complete / checks.length * 100);
  $("#healthScore").textContent = `${score}%`;
  $("#healthMeter").style.width = `${score}%`;
  $("#validationSummary").innerHTML = `<div class="check-list">${checks.map((check) => `<div class="check-item ${check.good ? "good" : "warn"}"><i>${check.good ? "✓" : "!"}</i><span><strong>${check.label}</strong> · ${check.detail}</span></div>`).join("")}</div>`;
  $("#reviewChecklist").innerHTML = checks.map((check) => `<div class="review-item ${check.good ? "" : "error"}"><i>${check.good ? "✓" : "!"}</i><div><strong>${check.label}</strong><small>${check.detail}${check.good ? " — ready" : " — requires attention"}</small></div></div>`).join("");
  $("#dialogValidation").innerHTML = result.valid ? `<div class="check-item good"><i>✓</i><span>All package checks passed.</span></div>` : `<div class="dialog-errors"><strong>Before submission:</strong><ul>${result.errors.map((error) => `<li>${error}</li>`).join("")}</ul></div>`;
  $("#confirmSubmit").disabled = !result.valid;
  $("#confirmSubmit").classList.toggle("disabled", !result.valid);
  return result;
}

function renderAll() { renderTos(); renderQuestions(); }
function renderWorkflow() {
  const submitted = state.status === "pending-coordinator";
  const pill = $(".status-pill");
  pill.textContent = submitted ? "Pending coordinator" : "Draft";
  pill.classList.toggle("draft", !submitted);
  document.querySelectorAll(".progress-track li").forEach((item, index) => item.classList.toggle("current", index === (submitted ? 1 : 0)));
  $("#submitButton").disabled = submitted;
  $("#submitButton").classList.toggle("disabled", submitted);
  if (submitted) $("#submitButton").firstChild.textContent = "Submitted";
}
function escapeHtml(value) { return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]); }
function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200); }

document.querySelectorAll("[role=tab]").forEach((tab) => tab.addEventListener("click", () => {
  document.querySelectorAll("[role=tab]").forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
  $(`#${tab.dataset.tab}Panel`).classList.add("active");
}));

$("#addOutcomeButton").addEventListener("click", () => {
  state.rows.push({ id: crypto.randomUUID(), title: "New learning outcome", ...Object.fromEntries(bloomKeys.map((key) => [key, 0])) }); renderAll(); markSaving(); showToast("Learning outcome added");
});
$("#addQuestionButton").addEventListener("click", () => {
  state.questions.push({ id: crypto.randomUUID(), type: "multiple-choice", stem: "", tosRowId: "", bloom: "" }); renderQuestions(); markSaving(); showToast("Question added");
});
$("#autoAllocateButton").addEventListener("click", () => {
  if (!state.rows.length) return;
  state.rows.forEach((row, index) => { bloomKeys.forEach((key) => { row[key] = key === bloomKeys[index % bloomKeys.length] ? 5 : 1; }); });
  renderAll(); markSaving(); showToast("Balanced draft allocation applied");
});
$("#submitButton").addEventListener("click", () => { renderValidation(); $("#submitDialog").showModal(); });
$("#confirmSubmit").addEventListener("click", (event) => {
  if (!renderValidation().valid) { event.preventDefault(); return; }
  state.status = "pending-coordinator"; save(); renderWorkflow(); showToast("Package routed to Dr. Samuel Reyes");
});
$("#previewButton").addEventListener("click", () => showToast("Draft preview prepared — print remains locked"));
$("#menuButton").addEventListener("click", () => { const sidebar = $(".sidebar"); sidebar.classList.toggle("open"); $("#menuButton").setAttribute("aria-expanded", String(sidebar.classList.contains("open"))); });
document.addEventListener("click", (event) => { if (innerWidth <= 760 && !event.target.closest(".sidebar") && !event.target.closest("#menuButton")) $(".sidebar").classList.remove("open"); });

canPrint(state.signatures, state.reproductionComplete, state.status);
renderAll();
renderWorkflow();
