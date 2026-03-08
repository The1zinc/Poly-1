const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const buttons = document.querySelectorAll(".btn");
const angleToggle = document.getElementById("angleToggle");
const angleModeEl = document.getElementById("angleMode");
const memoryStatusEl = document.getElementById("memoryStatus");
const historyList = document.getElementById("historyList");

let expression = "";
let lastResult = "0";
let angleMode = "DEG";
let memoryValue = 0;
const historyItems = [];
const HISTORY_LIMIT = 6;
const RESULT_PRECISION = 6;

const allowedPattern = /^[0-9+\-*/().,^%!\s,a-zA-Zπe]*$/;

const customFunctions = {
  factorial(n) {
    if (!Number.isFinite(n)) return NaN;
    if (n < 0 || !Number.isInteger(n)) return NaN;
    let total = 1;
    for (let i = 2; i <= n; i += 1) {
      total *= i;
    }
    return total;
  },
};

const toRadians = (value) => (angleMode === "DEG" ? (value * Math.PI) / 180 : value);
const toDegrees = (value) => (angleMode === "DEG" ? (value * 180) / Math.PI : value);

const mathBindings = {
  sin: (value) => Math.sin(toRadians(value)),
  cos: (value) => Math.cos(toRadians(value)),
  tan: (value) => Math.tan(toRadians(value)),
  asin: (value) => toDegrees(Math.asin(value)),
  acos: (value) => toDegrees(Math.acos(value)),
  atan: (value) => toDegrees(Math.atan(value)),
  sqrt: Math.sqrt,
  abs: Math.abs,
  log: (value) => Math.log10(value),
  ln: (value) => Math.log(value),
  pow: Math.pow,
  pi: Math.PI,
  e: Math.E,
  factorial: customFunctions.factorial,
};

const formatResult = (value) =>
  Number.isInteger(value)
    ? value.toString()
    : value.toFixed(RESULT_PRECISION).replace(/0+$/, "").replace(/\.$/, "");

const updateDisplay = (value, result = lastResult) => {
  expressionEl.textContent = value || "0";
  resultEl.textContent = result;
  angleModeEl.textContent = angleMode;
  memoryStatusEl.textContent = `MEM: ${formatResult(memoryValue)}`;
};

const insertValue = (value) => {
  expression += value;
  updateDisplay(expression);
};

const canInsertDecimal = () => {
  const segment = expression.split(/[+\-*/^(),]/).pop() || "";
  return !segment.includes(".");
};

const isOperator = (value) => /^[+\-*/^]$/.test(value);

const insertOperator = (value) => {
  if (!expression && value !== "-") {
    return;
  }

  if (isOperator(expression.slice(-1))) {
    expression = `${expression.slice(0, -1)}${value}`;
    updateDisplay(expression);
    return;
  }

  insertValue(value);
};

const clearAll = () => {
  expression = "";
  lastResult = "0";
  updateDisplay(expression, lastResult);
};

const deleteLast = () => {
  if (!expression) return;
  expression = expression.slice(0, -1);
  updateDisplay(expression);
};

const handlePercent = () => {
  if (!expression) return;
  expression += "/100";
  updateDisplay(expression);
};

const updateHistory = () => {
  historyList.innerHTML = "";
  historyItems.forEach((item) => {
    const entry = document.createElement("li");
    entry.innerHTML = `<div>${item.expression}</div><strong>${item.result}</strong>`;
    entry.addEventListener("click", () => {
      expression = item.expression;
      lastResult = item.result;
      updateDisplay(expression, lastResult);
    });
    historyList.appendChild(entry);
  });
};

const recordHistory = (value, result) => {
  historyItems.unshift({ expression: value, result });
  if (historyItems.length > HISTORY_LIMIT) {
    historyItems.pop();
  }
  updateHistory();
};

const updateMemory = (newValue) => {
  memoryValue = Number.isFinite(newValue) ? newValue : memoryValue;
  updateDisplay(expression, lastResult);
};

const transformFactorial = (input) => {
  let output = input;
  while (output.includes("!")) {
    const index = output.indexOf("!");
    let start = index - 1;
    let depth = 0;

    while (start >= 0) {
      const char = output[start];
      if (char === ")") {
        depth += 1;
      } else if (char === "(") {
        depth -= 1;
        if (depth === 0) {
          break;
        }
      } else if (depth === 0 && !/[0-9.]/.test(char)) {
        start += 1;
        break;
      }
      start -= 1;
    }

    if (start < 0) {
      start = 0;
    }

    const operand = output.slice(start, index);
    output = `${output.slice(0, start)}factorial(${operand})${output.slice(index + 1)}`;
  }
  return output;
};

const sanitizeExpression = (input) => {
  if (!allowedPattern.test(input)) {
    throw new Error("Invalid characters in expression.");
  }

  let sanitized = input
    .replace(/π/g, "pi")
    .replace(/\^/g, "**")
    .replace(/%/g, "/100")
    .replace(/\s/g, "");

  sanitized = transformFactorial(sanitized);

  return sanitized;
};

const evaluateExpression = () => {
  if (!expression.trim()) return;

  try {
    const sanitized = sanitizeExpression(expression);
    // eslint-disable-next-line no-new-func
    const evaluator = new Function(
      ...Object.keys(mathBindings),
      `"use strict"; return (${sanitized});`
    );
    const result = evaluator(...Object.values(mathBindings));

    if (!Number.isFinite(result)) {
      throw new Error("Result is not finite.");
    }

    lastResult = formatResult(result);
    updateDisplay(expression, lastResult);
    recordHistory(expression, lastResult);
  } catch (error) {
    lastResult = "Error";
    updateDisplay(expression, lastResult);
  }
};

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    const value = button.dataset.value;

    switch (action) {
      case "number":
        insertValue(value);
        break;
      case "operator":
        insertOperator(value);
        break;
      case "decimal":
        if (canInsertDecimal()) {
          insertValue(value);
        }
        break;
      case "func":
        insertValue(`${value}(`);
        break;
      case "const":
        insertValue(value);
        break;
      case "factorial":
        insertValue(value);
        break;
      case "percent":
        handlePercent();
        break;
      case "clear":
        clearAll();
        break;
      case "delete":
        deleteLast();
        break;
      case "equals":
        evaluateExpression();
        break;
      case "memory-clear":
        updateMemory(0);
        break;
      case "memory-recall":
        insertValue(memoryValue.toString());
        break;
      case "memory-plus": {
        const value = Number(lastResult);
        if (!Number.isNaN(value)) {
          updateMemory(memoryValue + value);
        }
        break;
      }
      case "memory-minus": {
        const value = Number(lastResult);
        if (!Number.isNaN(value)) {
          updateMemory(memoryValue - value);
        }
        break;
      }
      default:
        break;
    }
  });
});

angleToggle.addEventListener("click", () => {
  angleMode = angleMode === "DEG" ? "RAD" : "DEG";
  angleToggle.querySelectorAll(".toggle__option").forEach((option) => {
    option.classList.toggle("is-active", option.dataset.mode === angleMode);
  });
  updateDisplay(expression, lastResult);
});

window.addEventListener("keydown", (event) => {
  const { key } = event;

  if (key === "Enter") {
    event.preventDefault();
    evaluateExpression();
    return;
  }

  if (key === "Backspace") {
    deleteLast();
    return;
  }

  if (key === "Escape") {
    clearAll();
    return;
  }

  if (key === "x" || key === "X") {
    insertOperator("*");
    return;
  }

  if (key === "m" || key === "M") {
    insertValue(memoryValue.toString());
    return;
  }

  if (/^[0-9+\-*/().,^%!]$/.test(key)) {
    insertValue(key);
  }
});

updateDisplay(expression, lastResult);
updateHistory();
