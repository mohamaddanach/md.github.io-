/******************************************************************************
 *
 *   JAVASCRIPT FOUNDATIONS — THE WHOLE COURSE IN ONE APPLIED FILE
 *
 *   For: someone who already knows programming and only needs
 *        "how does JavaScript do it, and where does it bite?"
 *
 *   THE IDEA: instead of foo/bar examples, every lesson is applied to ONE
 *   real project — a mini learning platform (like learn.se2.dev):
 *   courses, lectures, students, a shopping cart, progress, grades.
 *   The data below is the real "JavaScript Basics" section of your course.
 *
 *   HOW EVERY LESSON IS LAID OUT
 *     WHAT     the concept in 1–3 lines
 *     SYNTAX   the minimum you need to remember
 *     APPLIED  real code on the platform
 *     GOTCHA   where JS differs from Java / C / Python
 *
 *   HOW TO RUN
 *     node javascript-foundations.js                → runs every lesson, prints results
 *     node javascript-foundations.js --interactive  → also plays the 3 assignments
 *     (or paste any lesson into the browser console, F12)
 *
 *   READING THE OUTPUT
 *     Every result is printed as   label ............ → value
 *     Strings are printed in "quotes" so you can tell "5" from 5.
 *
 *   CONTENTS
 *     1     How JavaScript runs
 *     2.0   First code execution
 *     2.1   Variables and constants
 *     2.2   Numbers, strings, booleans (+ null, undefined, conversion)
 *     2.3.1 Arithmetic operators
 *     2.3.2 Logical operators
 *     2.3.3 Complex operations
 *     2.4   Taking user input
 *     A1    ASSIGNMENT: Temperature Converter
 *     3.1   If / else, nested conditions, switch
 *     3.2   While loops
 *     3.3   Arrays and array operations
 *     3.4   For loops and array processing
 *     3.5   Break, continue, advanced loop control
 *     A3    ASSIGNMENT: Number Guessing Game
 *     4.1   Declaring and calling functions
 *     4.2   Parameters and return values
 *     4.3   Reusable code and scope (closures)
 *     4.4   Recursion
 *     A4    ASSIGNMENT: Grade Calculator
 *     ★     Cheat sheet: the 20 JavaScript gotchas
 *
 ******************************************************************************/

"use strict"; // Turns silent mistakes into errors (e.g. typo'd variable names).
              // Always put it at the top of plain scripts.

/* ---------- Output helpers (used by every lesson) ---------- */
function lesson(title) {
  console.log("\n" + "━".repeat(72) + "\n  " + title + "\n" + "━".repeat(72));
}
function show(label, value) {
  const printable = typeof value === "string" ? JSON.stringify(value) : value;
  console.log("  " + label.padEnd(40, " .") + " →", printable);
}
function note(text) {
  console.log("  · " + text);
}


/* ============================================================================
 * THE PROJECT DATA — used throughout the file
 * ============================================================================
 * An array of objects: the most common data shape in JavaScript (it's what
 * you get from every API as JSON). Lectures with no video have duration null.
 */
const javascriptBasics = [
  { id: 1, title: "2.0.1 Setup Online Compiler",       duration: "03:24", type: "video" },
  { id: 2, title: "2.0.2 Your First Code Execution",   duration: "06:33", type: "video" },
  { id: 3, title: "2.1 Variables and Constants",       duration: "48:38", type: "video" },
  { id: 4, title: "2.2 Numbers, Strings, and Booleans",duration: "52:44", type: "video" },
  { id: 5, title: "2.3.1 Arithmetic Operators",        duration: "23:31", type: "video" },
  { id: 6, title: "2.3.2 Logical Operators",           duration: "20:19", type: "video" },
  { id: 7, title: "2.3.3 Complex Operations",          duration: "24:43", type: "video" },
  { id: 8, title: "2.4 Taking User Input",             duration: "43:55", type: "video" },
  { id: 9, title: "Assignment: Temperature Converter", duration: null,    type: "assignment" },
];


/* ============================================================================
 * 1. HOW JAVASCRIPT RUNS
 * ============================================================================
 * WHAT
 *   - JS is dynamically typed: variables have no type, VALUES do.
 *   - An ENGINE runs it (V8 in Chrome and Node.js). It is JIT-compiled.
 *   - Two main environments:
 *       Browser  → has window, document, alert(), prompt()   (front-end)
 *       Node.js  → has process, files, network, require()      (back-end, CLI)
 *   - Single-threaded with an EVENT LOOP: slow work (network, timers, input)
 *     runs in the background and its callback/promise resumes later.
 *     That's why reading user input below uses `await`.
 *   - Everything that is not a primitive (number, string, boolean, null,
 *     undefined, bigint, symbol) is an OBJECT — arrays and functions included.
 */
lesson("1. How JavaScript runs");
show("Environment", typeof window === "undefined" ? "Node.js " + process.version : "Browser");

// The event loop in 4 lines: synchronous code runs first, queued work after.
setTimeout(() => note("(event loop) this timer callback ran AFTER all synchronous code"), 0);
note("synchronous line — runs immediately");


/* ============================================================================
 * 2.0 FIRST CODE EXECUTION
 * ============================================================================
 * WHAT    console.log is your print(). It accepts any number of values.
 * SYNTAX  console.log(a, b)   console.table(arrayOfObjects)   console.error(msg)
 */
lesson("2.0 First code execution");
console.log("Hello, World!");
console.log("Welcome to", "SE² Platform —", 4, "sections");
console.table(javascriptBasics.slice(0, 3)); // prints arrays of objects as a table — great for debugging


/* ============================================================================
 * 2.1 VARIABLES AND CONSTANTS
 * ============================================================================
 * WHAT
 *   const → cannot be reassigned           ← use by DEFAULT
 *   let   → can be reassigned              ← use when the value changes
 *   var   → old, function-scoped, hoisted  ← never use in new code
 *
 * GOTCHA
 *   const freezes the VARIABLE, not the OBJECT inside it.
 *   let/const are block-scoped { }, var ignores blocks.
 */
lesson("2.1 Variables and constants");

// APPLIED: app configuration and session state
const APP_NAME = "SE² Platform";   // never changes → const, UPPER_SNAKE for config constants
const MAX_LOGIN_ATTEMPTS = 3;
let currentUser = null;            // nobody logged in yet → will change → let
let unreadNotifications = 7;       // the red badge in your screenshot

currentUser = { name: "Mohamad", email: "mohamad@example.com", role: "student" }; // user logs in
unreadNotifications = 0;                                                            // user opens bell

show("App", APP_NAME);
show("Logged-in user", currentUser.name);
show("Unread notifications", unreadNotifications);

// const object: the binding is locked, the contents are not
const settings = { theme: "dark", language: "en" };
settings.theme = "light";          // ✅ allowed — mutating the object
// settings = {};                  // ❌ TypeError: Assignment to constant variable
show("Settings after change", settings);

// Block scope: `let` lives only inside its { }
if (currentUser) {
  const welcome = `Welcome back, ${currentUser.name}`;
  show("Inside the block", welcome);
}
// console.log(welcome);           // ❌ ReferenceError — welcome doesn't exist out here

// Destructuring: unpack values into variables (you'll see this everywhere)
const { name, role } = currentUser;               // from an object (by key name)
const [firstLecture, secondLecture] = javascriptBasics; // from an array (by position)
show("Destructured name / role", `${name} / ${role}`);
show("First lecture title", firstLecture.title);

// Swap two variables without a temp
let left = "A", right = "B";
[left, right] = [right, left];
show("Swapped", `${left} ${right}`);


/* ============================================================================
 * 2.2 NUMBERS, STRINGS, AND BOOLEANS
 * ============================================================================
 * WHAT
 *   number  → ONE type for ints and decimals (64-bit float). No int/float split.
 *   string  → text, immutable. 'single', "double" or `template ${expr}`.
 *   boolean → true / false.
 *   null      → "empty on purpose"       (you set it)
 *   undefined → "no value assigned yet"  (JS sets it)
 */
lesson("2.2 Numbers, strings, booleans");

// ---------- NUMBERS — APPLIED: pricing ----------
const coursePrice = 49.99;
const studentsEnrolled = 120;
show("Revenue", coursePrice * studentsEnrolled);       // 5998.8
show("7 / 2 (no integer division)", 7 / 2);            // 3.5 — not 3 like Java/C
show("Math.trunc(7 / 2)", Math.trunc(7 / 2));          // 3

// GOTCHA: floats are imprecise → never store money as decimals
show("0.1 + 0.2", 0.1 + 0.2);                          // 0.30000000000000004
// FIX: store money in CENTS (integers), format only for display
const priceInCents = 4999;
const totalCents = priceInCents * 3;
show("3 × $49.99 (cents method)", `$${(totalCents / 100).toFixed(2)}`); // "$149.97"

// Invalid math doesn't crash — it gives special values
show("10 / 0", 10 / 0);                                // Infinity
show('"abc" * 2', "abc" * 2);                          // NaN (Not a Number)
show("NaN === NaN  (!)", NaN === NaN);                 // false → use Number.isNaN()
show("Number.isNaN(NaN)", Number.isNaN(NaN));          // true

// Formatting numbers for users
show("toFixed(2)", (1234.5).toFixed(2));               // "1234.50" (a string)
show("toLocaleString", (1234567.891).toLocaleString("en-US", { style: "currency", currency: "USD" }));

// ---------- STRINGS — APPLIED: user & course text ----------
const rawEmail = "  Mohamad.Danach@Gmail.COM ";
const email = rawEmail.trim().toLowerCase();           // clean form input — chain methods
show("Normalized email", email);
show("Is it a gmail?", email.endsWith("@gmail.com"));
show("Username part", email.slice(0, email.indexOf("@")));

const fullName = "Mohamad Danach";
const initials = fullName.split(" ").map(word => word[0]).join("");
show("Avatar initials (like 'MO' badge)", initials);   // "MD"

// Template literals: the readable way to build strings
const lectureCount = javascriptBasics.length;
show("Section header", `JavaScript Basics • ${lectureCount} lectures`);

// URL slug from a course title (what the platform does for /courses/javascript-foundations)
const courseTitle = "JavaScript Foundations!";
const slug = courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
show("Course URL slug", slug);                         // "javascript-foundations"

// Mask a card number at checkout
const card = "4111111111111111";
show("Masked card", card.slice(-4).padStart(card.length, "*"));

// Truncate long titles for a sidebar ("Mohamad Mo..." in your screenshot)
const truncate = (text, max) => (text.length > max ? text.slice(0, max - 3) + "..." : text);
show("Truncated name", truncate("Mohamad Mohamad Danach", 12));

// Most-used string methods (all return NEW strings — strings are immutable):
// .length .toUpperCase() .toLowerCase() .trim() .includes() .startsWith() .endsWith()
// .indexOf() .slice(start,end) .split(sep) .replace() .replaceAll() .padStart() .repeat() .at(-1)

// ---------- BOOLEANS + TRUTHY/FALSY — APPLIED: form validation ----------
// In an `if`, these 8 values count as false; EVERYTHING else counts as true:
//    false  0  -0  0n  ""  null  undefined  NaN
// GOTCHA vs Python: [] and {} are TRUTHY in JS. "0" and "false" are TRUTHY.
const form = { username: "", age: 0, bio: "   " };
show("username filled?", Boolean(form.username));     // false — empty string
show("age filled? (0 is falsy!)", Boolean(form.age));  // false — careful, 0 may be valid
show("bio filled? (spaces are truthy)", Boolean(form.bio)); // true — trim before checking
show("bio really filled?", form.bio.trim() !== "");    // false
show("empty array truthy?", Boolean([]));              // true — check arr.length instead

// ---------- null vs undefined — APPLIED: optional profile data ----------
const profile = { name: "Mohamad", phone: null };      // phone: user chose not to give it
show("profile.phone (set to null)", profile.phone);
show("profile.github (never set)", profile.github);    // undefined — no error!

// ---------- typeof and conversion ----------
show("typeof 42", typeof 42);
show("typeof 'hi'", typeof "hi");
show("typeof null  (historic bug)", typeof null);      // "object"
show("typeof []", typeof []);                          // "object" → use Array.isArray
show("Array.isArray([])", Array.isArray([]));

// Form inputs are ALWAYS strings. Convert explicitly:
const ageInput = "25";
show('"25" + 1   (concatenates!)', ageInput + 1);      // "251"
show('Number("25") + 1', Number(ageInput) + 1);        // 26
show('Number("25px")', Number("25px"));                // NaN — strict
show('parseInt("25px", 10)', parseInt("25px", 10));    // 25  — reads the leading number
show('String(25)', String(25));

// == vs ===   RULE: always use === (no type conversion)
show('5 == "5"', 5 == "5");                            // true  (converts) — avoid
show('5 === "5"', 5 === "5");                          // false (strict)  — use this


/* ============================================================================
 * 2.3.1 ARITHMETIC OPERATORS
 * ============================================================================
 * SYNTAX   +  -  *  /  %(remainder)  **(power)  ++  --  +=  -=  *=  /=
 *          Math.round / floor / ceil / trunc / max / min / abs / random
 */
lesson("2.3.1 Arithmetic operators");

// APPLIED 1: convert lecture durations ("mm:ss") to seconds and back
function toSeconds(mmss) {
  const [minutes, seconds] = mmss.split(":").map(Number); // "48:38" → [48, 38]
  return minutes * 60 + seconds;
}
function formatHMS(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);          // whole hours
  const m = Math.floor((totalSeconds % 3600) / 60);   // leftover minutes
  const s = totalSeconds % 60;                        // leftover seconds
  const pad = n => String(n).padStart(2, "0");
  return `${h}:${pad(m)}:${pad(s)}`;
}
show('"48:38" in seconds', toSeconds("48:38"));       // 2918
show("2918 s formatted", formatHMS(2918));            // "0:48:38"

// APPLIED 2: shopping cart with tax and discount
const subtotal = 49.99 + 29.99;
const discountRate = 0.2;   // 20% off
const taxRate = 0.11;       // 11% VAT
const afterDiscount = subtotal * (1 - discountRate);
const total = afterDiscount * (1 + taxRate);
show("Cart total", Math.round(total * 100) / 100);    // round to 2 decimals

// APPLIED 3: progress bar percentage
const completedLectures = 5;
const progress = Math.round((completedLectures / javascriptBasics.length) * 100);
show("Progress", `${progress}%`);

// APPLIED 4: pagination — how many pages for 53 lectures, 10 per page?
show("Pages needed", Math.ceil(53 / 10));             // 6 — ceil because the last page is partial

// APPLIED 5: % (remainder) — alternate row colors, every-Nth logic
for (let row = 1; row <= 4; row++) {
  note(`row ${row} → ${row % 2 === 0 ? "dark" : "light"} background`);
}

// APPLIED 6: random — pick a random "tip of the day", generate a 6-digit code
const tips = ["Use const by default", "Use ===", "Name things clearly"];
show("Tip of the day", tips[Math.floor(Math.random() * tips.length)]);
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min; // inclusive
show("Verification code", randomInt(100000, 999999));

// Increment / compound assignment
let views = 0;
views++;            // 1
views += 10;        // 11
views *= 2;         // 22
show("Lecture views", views);
// views++ returns the OLD value, ++views returns the NEW value:
let x = 5;
show("x++ (returns old)", x++);  // 5, x is now 6
show("++x (returns new)", ++x);  // 7

// GOTCHA: % keeps the sign of the left side
show("-7 % 3", -7 % 3);                               // -1 (Python gives 2)
show("Math.round(2.5) / Math.round(-2.5)", `${Math.round(2.5)} / ${Math.round(-2.5)}`); // 3 / -2


/* ============================================================================
 * 2.3.2 LOGICAL OPERATORS
 * ============================================================================
 * SYNTAX   &&  (and)   ||  (or)   !  (not)
 *          ??  (default only for null/undefined)
 *          ?.  (safe property access)
 *          comparison:  ===  !==  <  >  <=  >=
 *
 * GOTCHA   && and || return one of the OPERANDS, not always true/false:
 *            a || b  → a if a is truthy, otherwise b
 *            a && b  → a if a is falsy,  otherwise b
 */
lesson("2.3.2 Logical operators");

// APPLIED 1: access control — can this user watch a lecture?
const viewer = { isLoggedIn: true, isEnrolled: false, isAdmin: false };
const lectureIsFreePreview = true;
const canWatch = viewer.isLoggedIn && (viewer.isEnrolled || lectureIsFreePreview || viewer.isAdmin);
show("Can watch lecture?", canWatch);
show("Show 'Buy course' button?", !viewer.isEnrolled && !viewer.isAdmin);

// APPLIED 2: default values
const displayName = currentUser.nickname || currentUser.name || "Guest"; // first truthy wins
show("Display name", displayName);

// GOTCHA: || treats 0 and "" as missing. Use ?? when 0 / "" are valid values.
const savedVolume = 0;                // user muted the video on purpose
show("volume with ||  (bug)", savedVolume || 50);  // 50 — wrong!
show("volume with ??  (correct)", savedVolume ?? 50); // 0

// APPLIED 3: optional chaining ?. — safe access to data that may be missing (API data)
const apiUser = { name: "Sara", address: null };
show("apiUser.address?.city", apiUser.address?.city);               // undefined, no crash
show("with fallback", apiUser.address?.city ?? "City not set");
// Without ?. → apiUser.address.city → TypeError: Cannot read properties of null

// APPLIED 4: short-circuit as a one-line "if"
const isDebug = false;
isDebug && console.log("debug info...");     // only runs when isDebug is true

// Comparisons
show('"10" < "9"   (string compare!)', "10" < "9"); // true — compares character by character
show("10 < 9", 10 < 9);                             // false


/* ============================================================================
 * 2.3.3 COMPLEX OPERATIONS
 * ============================================================================
 * WHAT     Combining operators: ternary, precedence, chaining multiple rules.
 * SYNTAX   condition ? valueIfTrue : valueIfFalse    (an expression → returns a value)
 * RULE     When in doubt about precedence, add parentheses.
 */
lesson("2.3.3 Complex operations");

// APPLIED 1: ternary for UI labels
const enrolledCount = 1;
show("Label", `${enrolledCount} ${enrolledCount === 1 ? "student" : "students"}`);
const notificationBadge = unreadNotifications > 9 ? "9+" : unreadNotifications > 0 ? String(unreadNotifications) : "";
show("Bell badge", notificationBadge);

// APPLIED 2: shipping-fee rules combined into one expression
//   free if order ≥ $100 OR user is premium; otherwise $5 local, $15 international
function shippingFee(orderTotal, isPremium, isInternational) {
  return orderTotal >= 100 || isPremium ? 0 : isInternational ? 15 : 5;
}
show("Shipping $120 local", shippingFee(120, false, false));
show("Shipping $40 international", shippingFee(40, false, true));
show("Shipping $40 premium", shippingFee(40, true, true));

// APPLIED 3: final price formula — precedence matters
const base = 100, coupon = 10, vat = 0.11;
show("base - coupon * (1 + vat)   ✗", base - coupon * (1 + vat));  // 88.9 — wrong order
show("(base - coupon) * (1 + vat) ✓", (base - coupon) * (1 + vat)); // 99.9
// Precedence (high → low): ()  →  !  →  **  →  * / %  →  + -  →  < >  →  === !==  →  &&  →  || ??  →  ?:  →  =

// APPLIED 4: password strength — several conditions combined
function passwordStrength(pw) {
  const longEnough = pw.length >= 8;
  const hasNumber = /\d/.test(pw);           // regex: contains a digit
  const hasUpper = /[A-Z]/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);
  const score = longEnough + hasNumber + hasUpper + hasSymbol; // true counts as 1!
  return score === 4 ? "strong" : score >= 2 ? "medium" : "weak";
}
show('passwordStrength("abc")', passwordStrength("abc"));
show('passwordStrength("hello123")', passwordStrength("hello123"));
show('passwordStrength("Hello123!")', passwordStrength("Hello123!"));

// Logical assignment operators — fill missing settings
const userPrefs = { autoplay: false };
userPrefs.speed ??= 1.0;        // set only if null/undefined
userPrefs.autoplay ??= true;    // stays false — it's not null/undefined
show("Prefs", userPrefs);


/* ============================================================================
 * 2.4 TAKING USER INPUT
 * ============================================================================
 * BROWSER (synchronous, blocks the page):
 *     const name = prompt("Your name?");   // string, or null if Cancel
 *     const ok   = confirm("Delete?");     // true / false
 *     alert("Saved!");
 *
 * NODE.JS (asynchronous): use the readline module + await (see ask() below).
 *
 * RULE: input is ALWAYS a string (or null). Always: trim → convert → validate.
 */
lesson("2.4 Taking user input");

// ask("Question? ") → Promise<string|null>. Use inside an async function: await ask(...)
let rl = null, inputLines = null;
function ask(question) {
  if (!rl) {
    const readline = require("readline");
    rl = readline.createInterface({ input: process.stdin });
    inputLines = rl[Symbol.asyncIterator]();   // buffers lines, so piped input works too
  }
  process.stdout.write(question);
  return inputLines.next().then(r => (r.done ? null : r.value)); // null when input ends
}

// Reusable validators — the "convert + validate" step
function parseNumber(input) {
  if (input === null || String(input).trim() === "") return null;
  const n = Number(String(input).trim());
  return Number.isNaN(n) ? null : n;
}
function parseIntInRange(input, min, max) {
  const n = parseNumber(input);
  return n !== null && Number.isInteger(n) && n >= min && n <= max ? n : null;
}
show('parseNumber(" 3.5 ")', parseNumber(" 3.5 "));
show('parseNumber("abc")', parseNumber("abc"));
show('parseIntInRange("150", 0, 120)', parseIntInRange("150", 0, 120)); // null — out of range
show('parseIntInRange("25", 0, 120)', parseIntInRange("25", 0, 120));


/* ============================================================================
 * A1. ASSIGNMENT — TEMPERATURE CONVERTER
 * ============================================================================
 * Formulas:  F = C × 9/5 + 32      C = (F − 32) × 5/9      K = C + 273.15
 * Design: pure conversion functions (easy to test) + a separate input layer.
 */
lesson("A1. Assignment: Temperature Converter");

const toCelsius = { C: v => v, F: v => (v - 32) * 5 / 9, K: v => v - 273.15 };

function convertTemperature(value, fromUnit) {
  const unit = String(fromUnit).trim().toUpperCase().charAt(0); // "celsius" → "C"
  if (!(unit in toCelsius)) return null;                        // unknown unit
  const c = toCelsius[unit](value);
  if (c < -273.15) return null;                                 // below absolute zero
  return { C: c, F: c * 9 / 5 + 32, K: c + 273.15 };
}
function describeTemperature(c) {
  if (c <= 0) return "freezing 🥶";
  if (c < 15) return "cold";
  if (c < 25) return "pleasant";
  if (c < 35) return "hot";
  return "very hot 🔥";
}
function formatTemperature(t) {
  return `${t.C.toFixed(1)}°C = ${t.F.toFixed(1)}°F = ${t.K.toFixed(1)}K (${describeTemperature(t.C)})`;
}
show("100 C", formatTemperature(convertTemperature(100, "C")));
show("98.6 F", formatTemperature(convertTemperature(98.6, "fahrenheit")));
show("0 K", formatTemperature(convertTemperature(0, "k")));
show("-500 C (invalid)", convertTemperature(-500, "C"));

async function temperatureConverterInteractive() {
  const value = parseNumber(await ask("Temperature value: "));
  if (value === null) return console.log("❌ Not a valid number.");
  const result = convertTemperature(value, (await ask("Unit (C/F/K): ")) ?? "");
  console.log(result ? "✅ " + formatTemperature(result) : "❌ Unknown unit or below absolute zero.");
}


/* ============================================================================
 * 3.1 IF-ELSE AND NESTED CONDITIONS  (+ switch)
 * ============================================================================
 * SYNTAX
 *   if (cond) { ... } else if (cond2) { ... } else { ... }
 *   switch (value) { case "a": ...; break; default: ... }   ← uses ===
 *
 * RULE  Prefer GUARD CLAUSES (return early) over deep nesting.
 */
lesson("3.1 If / else, nested conditions, switch");

// APPLIED 1: login validation — nested version (hard to read)...
function loginNested(user, password) {
  if (user) {
    if (!user.isBanned) {
      if (user.password === password) {
        return "✅ Welcome " + user.name;
      } else {
        return "❌ Wrong password";
      }
    } else {
      return "❌ Account banned";
    }
  } else {
    return "❌ User not found";
  }
}
// ...and the SAME logic with guard clauses (flat and clear) ✓
function login(user, password) {
  if (!user) return "❌ User not found";
  if (user.isBanned) return "❌ Account banned";
  if (user.password !== password) return "❌ Wrong password";
  return "✅ Welcome " + user.name;
}
const dbUser = { name: "Mohamad", password: "s3cret", isBanned: false }; // (never store plain passwords in real apps)
show("login(correct)", login(dbUser, "s3cret"));
show("login(wrong)", login(dbUser, "1234"));
show("login(no user)", login(undefined, "x"));
show("nested version agrees?", loginNested(dbUser, "1234") === login(dbUser, "1234"));

// APPLIED 2: if / else-if chain — score → letter grade (order matters: high to low)
function letterFor(score) {
  if (score >= 90) return "A";
  else if (score >= 80) return "B";
  else if (score >= 70) return "C";
  else if (score >= 60) return "D";
  else return "F";
}
show("letterFor(85)", letterFor(85));

// APPLIED 3: switch — permissions per role (fall-through groups cases)
function permissionsFor(role) {
  switch (role) {
    case "admin":
      return ["view", "edit", "delete", "manage-users"];
    case "instructor":
    case "teaching-assistant":                 // fall-through: shares the same result
      return ["view", "edit"];
    case "student":
      return ["view"];
    default:
      return [];
  }
}
show("permissionsFor('teaching-assistant')", permissionsFor("teaching-assistant"));
// GOTCHA: if you use `case` without `return` or `break`, execution falls into the next case.

// APPLIED 4: object lookup — often cleaner than switch for simple mappings
const LECTURE_ICONS = { video: "🎬", assignment: "📝", quiz: "❓" };
show("Icon for 'assignment'", LECTURE_ICONS["assignment"] ?? "📄");

// APPLIED 5: nested conditions that really are nested — course access decision
function accessMessage(user, course) {
  if (course.isPublished) {
    if (user.enrolledCourseIds.includes(course.id)) return "Continue learning";
    return course.price === 0 ? "Enroll for free" : `Buy for $${course.price}`;
  }
  return user.role === "admin" ? "Edit draft" : "Coming soon";
}
const studentUser = { role: "student", enrolledCourseIds: [1] };
show("Enrolled course", accessMessage(studentUser, { id: 1, isPublished: true, price: 49 }));
show("Paid course", accessMessage(studentUser, { id: 2, isPublished: true, price: 49 }));
show("Unpublished course", accessMessage(studentUser, { id: 3, isPublished: false, price: 0 }));

// 3.1.1 / 3.1.2 Practice & Challenge — FizzBuzz, a classic interview warm-up
const fizzBuzz = n => (n % 15 === 0 ? "FizzBuzz" : n % 3 === 0 ? "Fizz" : n % 5 === 0 ? "Buzz" : n);
show("FizzBuzz 1..15", Array.from({ length: 15 }, (_, i) => fizzBuzz(i + 1)).join(" "));


/* ============================================================================
 * 3.2 WHILE LOOPS
 * ============================================================================
 * WHAT    Repeat while a condition is true. Use when you DON'T know in advance
 *         how many iterations (retries, input until valid, until a goal).
 * SYNTAX  while (cond) { ... }          → may run 0 times
 *         do { ... } while (cond);      → always runs at least once (menus, prompts)
 * GOTCHA  Make sure something inside changes the condition → else infinite loop.
 */
lesson("3.2 While loops");

// APPLIED 1: login with max 3 attempts (simulated typed passwords)
const typedPasswords = ["1234", "password", "s3cret", "never-reached"];
let attempt = 0;
let loggedIn = false;
while (attempt < MAX_LOGIN_ATTEMPTS && !loggedIn) {
  const typed = typedPasswords[attempt];
  attempt++;
  loggedIn = typed === dbUser.password;
  note(`attempt ${attempt}: "${typed}" → ${loggedIn ? "success" : "fail"}`);
}
show("Logged in?", loggedIn);

// APPLIED 2: savings goal — how many months to afford a $600 bootcamp saving $75/month?
let saved = 0, months = 0;
while (saved < 600) {
  saved += 75;
  months++;
}
show("Months to save $600", months);

// APPLIED 3: compound growth — years for 1000 users to reach 10,000 at 40%/year
let users = 1000, years = 0;
while (users < 10000) {
  users = Math.round(users * 1.4);
  years++;
}
show("Years to 10k users", `${years} (users: ${users})`);

// APPLIED 4: do...while — show a menu at least once (simulated choices)
const menuChoices = ["1", "2", "0"];
let choice, step = 0;
do {
  choice = menuChoices[step++];
  note(`menu shown → user picked ${choice}`);
} while (choice !== "0");

// 3.2.1 / 3.2.2 Practice & Challenge — digit problems (classic while-loop exercises)
function sumOfDigits(n) {
  let sum = 0;
  n = Math.abs(n);
  while (n > 0) {
    sum += n % 10;          // last digit
    n = Math.floor(n / 10); // drop last digit
  }
  return sum;
}
function reverseDigits(n) {
  let reversed = 0;
  while (n > 0) {
    reversed = reversed * 10 + (n % 10);
    n = Math.floor(n / 10);
  }
  return reversed;
}
function gcd(a, b) {         // Euclid: used to simplify fractions / ratios
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}
show("sumOfDigits(98765)", sumOfDigits(98765));
show("reverseDigits(1234)", reverseDigits(1234));
show("12321 is palindrome?", reverseDigits(12321) === 12321);
show("Simplify 1920:1080 ratio", `${1920 / gcd(1920, 1080)}:${1080 / gcd(1920, 1080)}`); // 16:9


/* ============================================================================
 * 3.3 ARRAYS  /  3.3.1 ARRAYS AND OPERATIONS
 * ============================================================================
 * WHAT    Ordered, dynamic list (grows/shrinks), 0-indexed, any types inside.
 *         Arrays are objects → assigned/passed BY REFERENCE.
 *
 * CHEAT SHEET
 *   change the array (mutating):   push pop shift unshift splice sort reverse fill
 *   return something new:          slice concat map filter reduce find findIndex
 *                                  includes indexOf join some every flat toSorted
 */
lesson("3.3 Arrays");

// APPLIED: a student's watch list
const watchList = ["2.1 Variables", "2.2 Types"];
watchList.push("2.3 Operators");            // add to end
watchList.unshift("2.0 Setup");             // add to start
show("Watch list", watchList);
show("Count", watchList.length);
show("First / last", `${watchList[0]} / ${watchList.at(-1)}`);
show("Index 99 (no error!)", watchList[99]); // undefined — no IndexOutOfBounds

const finished = watchList.shift();          // remove from start, returns it
show("Finished & removed", finished);
watchList.pop();                             // remove from end
show("After shift + pop", watchList);

// splice(start, deleteCount, ...itemsToInsert) — the Swiss-army knife
const playlist = ["Intro", "Variables", "Loops", "Functions"];
playlist.splice(2, 0, "Conditions");         // insert at index 2
playlist.splice(playlist.indexOf("Intro"), 1); // remove "Intro" by value
show("Playlist", playlist);

// Searching
show("Has 'Loops'?", playlist.includes("Loops"));
show("Index of 'Functions'", playlist.indexOf("Functions"));
show("Index of 'Java'", playlist.indexOf("Java"));  // -1 = not found
show("First lecture longer than 45 min",
  javascriptBasics.find(l => l.duration && toSeconds(l.duration) > 45 * 60)?.title);

// slice(start, end) — copy a part (end excluded). Pagination!
const page = 2, perPage = 3;
const pageItems = javascriptBasics.slice((page - 1) * perPage, page * perPage);
show("Page 2 titles", pageItems.map(l => l.title));

// GOTCHA 1: sort() compares as STRINGS by default
const scores = [100, 25, 9, 80];
show("[100,25,9,80].sort()  ✗", [...scores].sort());              // [100, 25, 80, 9]
show("sort((a,b) => a-b)    ✓", [...scores].sort((a, b) => a - b)); // ascending
show("sort((a,b) => b-a)    ✓", [...scores].sort((a, b) => b - a)); // descending
// sort strings properly (accents / case aware):
show("Names sorted", ["sara", "Omar", "lina"].sort((a, b) => a.localeCompare(b)));

// GOTCHA 2: arrays are references
const original = ["a", "b"];
const sameArray = original;          // NOT a copy — two names, one array
const realCopy = [...original];      // spread = shallow copy
sameArray.push("c");
show("original (changed via alias)", original);
show("realCopy (unchanged)", realCopy);
show("[1,2] === [1,2]", [1, 2] === [1, 2]); // false — compares references
// Deep copy (arrays of objects): structuredClone(value)

// Combine, unique, flatten
const frontend = ["html", "css", "js"];
const backend = ["js", "node", "sql"];
const allSkills = [...frontend, ...backend];
show("All skills (unique via Set)", [...new Set(allSkills)]);
show("Common skills", frontend.filter(s => backend.includes(s)));
show("Flatten [[1,2],[3,[4]]]", [[1, 2], [3, [4]]].flat(Infinity));

// 2D array: a seating grid for a live session (rows × seats), true = taken
const seats = [
  [true, true, false],
  [false, true, true],
];
show("Row 2, seat 1 taken?", seats[1][0]);

// 3.3.1 Practice / 3.3.3 Challenge
const findMax = arr => arr.reduce((max, v) => (v > max ? v : max), -Infinity); // manual Math.max
const secondHighest = arr => [...new Set(arr)].sort((a, b) => b - a)[1];
const rotateLeft = (arr, k) => [...arr.slice(k % arr.length), ...arr.slice(0, k % arr.length)];
show("findMax([3,9,2])", findMax([3, 9, 2]));
show("secondHighest([4,9,9,7])", secondHighest([4, 9, 9, 7]));
show("rotateLeft([1,2,3,4,5], 2)", rotateLeft([1, 2, 3, 4, 5], 2));


/* ============================================================================
 * 3.4 FOR LOOPS AND ARRAY PROCESSING
 * ============================================================================
 * WHICH LOOP?
 *   for (let i = 0; i < n; i++)  → need the index / custom steps
 *   for (const item of array)    → just the values  (most common, supports break)
 *   for (const key in object)    → keys of an OBJECT (don't use on arrays)
 *   array.forEach(fn)            → run fn per item (can't break)
 *   array.map / filter / reduce  → transform / select / combine  (modern JS style)
 */
lesson("3.4 For loops and array processing");

// APPLIED 1: classic for — total duration of the section (should match the
// platform's "9 lectures • 3:43:47" header from your screenshot)
let totalSeconds = 0;
for (let i = 0; i < javascriptBasics.length; i++) {
  const lec = javascriptBasics[i];
  if (lec.duration === null) continue;      // assignments have no video
  totalSeconds += toSeconds(lec.duration);
}
show("Section duration (for loop)", formatHMS(totalSeconds));

// The SAME thing, modern style — filter + map + reduce
const totalModern = javascriptBasics
  .filter(lec => lec.duration !== null)     // keep videos only
  .map(lec => toSeconds(lec.duration))      // lecture → seconds
  .reduce((sum, sec) => sum + sec, 0);      // sum them (always give the start value!)
show("Section duration (modern)", formatHMS(totalModern));
show("Matches platform 3:43:47?", formatHMS(totalModern) === "3:43:47");

// APPLIED 2: for...of — print a numbered syllabus
for (const lec of javascriptBasics.slice(0, 3)) {
  note(`${LECTURE_ICONS[lec.type]} ${lec.title.padEnd(36)} ${lec.duration ?? "—"}`);
}
// need the index too? use .entries()
for (const [index, lec] of javascriptBasics.slice(0, 2).entries()) {
  note(`#${index + 1} ${lec.title}`);
}

// APPLIED 3: for...in / Object.entries — loop over an object's properties
const courseStats = { sections: 4, lectures: 35, hours: 12.5 };
for (const [key, value] of Object.entries(courseStats)) {
  note(`${key}: ${value}`);
}

// APPLIED 4: the big three, on platform data
const longest = javascriptBasics
  .filter(l => l.duration)
  .reduce((best, l) => (toSeconds(l.duration) > toSeconds(best.duration) ? l : best));
show("Longest lecture", `${longest.title} (${longest.duration})`);

const shortTitles = javascriptBasics.map(l => l.title.split(" ")[0]);   // map: transform each
show("Lecture numbers", shortTitles);

const under30min = javascriptBasics.filter(l => l.duration && toSeconds(l.duration) < 30 * 60);
show("Lectures under 30 min", under30min.length);

show("Any assignment?", javascriptBasics.some(l => l.type === "assignment"));
show("All have titles?", javascriptBasics.every(l => l.title.length > 0));

// APPLIED 5: reduce to an object — group / count (super common in real code)
const countByType = javascriptBasics.reduce((acc, l) => {
  acc[l.type] = (acc[l.type] ?? 0) + 1;
  return acc;
}, {});
show("Count by type", countByType);

// APPLIED 6: cart totals with an array of objects
const cart = [
  { item: "JS Course", price: 49.99, qty: 1 },
  { item: "React Course", price: 59.99, qty: 1 },
  { item: "Stickers", price: 2.5, qty: 4 },
];
const cartTotal = cart.reduce((sum, line) => sum + line.price * line.qty, 0);
show("Cart total", `$${cartTotal.toFixed(2)}`);
show("Receipt lines", cart.map(l => `${l.qty} × ${l.item} = $${(l.price * l.qty).toFixed(2)}`));

// APPLIED 7: nested for — weekly study calendar (days × time slots)
const days = ["Mon", "Wed", "Fri"];
const slots = ["09:00", "18:00"];
for (const day of days) {
  let row = day + ": ";
  for (const slot of slots) row += `[${slot}] `;
  note(row);
}

// GOTCHA: closures in loops — `let` creates a new variable per iteration, `var` doesn't
const withVar = [], withLet = [];
for (var v = 0; v < 3; v++) withVar.push(() => v);
for (let l = 0; l < 3; l++) withLet.push(() => l);
show("callbacks with var", withVar.map(f => f()));   // [3,3,3]
show("callbacks with let", withLet.map(f => f()));   // [0,1,2]

// 3.4.1 / 3.4.2 Practice & Challenge
function bubbleSort(input) {
  const arr = [...input];                     // don't mutate the caller's array
  for (let end = arr.length - 1; end > 0; end--) {
    let swapped = false;
    for (let j = 0; j < end; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break;                      // already sorted → stop early
  }
  return arr;
}
const countVowels = text => [...text.toLowerCase()].filter(ch => "aeiou".includes(ch)).length;
const wordFrequency = text =>
  text.toLowerCase().match(/[a-z]+/g).reduce((acc, w) => ({ ...acc, [w]: (acc[w] ?? 0) + 1 }), {});
show("bubbleSort([5,2,9,1])", bubbleSort([5, 2, 9, 1]));
show("vowels in 'JavaScript'", countVowels("JavaScript"));
show("wordFrequency", wordFrequency("to be or not to be"));


/* ============================================================================
 * 3.5 BREAK, CONTINUE, AND ADVANCED LOOP CONTROL
 * ============================================================================
 * break       → exit the loop now
 * continue    → skip to the next iteration
 * label:      → name an outer loop so break/continue can target it
 * some/every/find → array methods that stop early automatically
 * GOTCHA: you cannot break out of forEach — use for...of instead.
 */
lesson("3.5 Break, continue, advanced loop control");

// APPLIED 1: break — "Resume" button: find the first lecture not yet completed
const completedIds = new Set([1, 2, 3]);
let resumeLecture = null;
for (const lec of javascriptBasics) {
  if (!completedIds.has(lec.id)) {
    resumeLecture = lec;
    break;                                    // found it — no need to check the rest
  }
}
show("Resume from", resumeLecture.title);
show("Same with find()", javascriptBasics.find(l => !completedIds.has(l.id)).title);

// APPLIED 2: continue — total only VIDEO time, skip assignments
let videoSeconds = 0;
for (const lec of javascriptBasics) {
  if (lec.type !== "video") continue;         // skip this one, go to next
  videoSeconds += toSeconds(lec.duration);
}
show("Video time", formatHMS(videoSeconds));

// APPLIED 3: labeled break — search a lecture across ALL sections (nested data)
const course = [
  { section: "CS Fundamentals", lectures: ["1.1 How computers work", "1.2 Binary"] },
  { section: "JavaScript Basics", lectures: ["2.1 Variables", "2.2 Types"] },
  { section: "Conditional Logic and Loops", lectures: ["3.1 If-Else", "3.2 While Loops"] },
];
let foundAt = null;
search: for (const sec of course) {
  for (const title of sec.lectures) {
    if (title.includes("While")) {
      foundAt = `${sec.section} → ${title}`;
      break search;                           // exits BOTH loops at once
    }
  }
}
show("Search 'While'", foundAt);

// APPLIED 4: retry loop with break — call a flaky API up to 5 times
const fakeApiResponses = [500, 503, 200, 200];  // simulated HTTP status codes
let response;
for (let tryNo = 1; tryNo <= 5; tryNo++) {
  response = fakeApiResponses[tryNo - 1];
  note(`try ${tryNo} → HTTP ${response}`);
  if (response === 200) break;
}

// APPLIED 5: validate-until-correct loop (while(true) + break)
const simulatedInputs = ["abc", "-5", "200", "42"];
let validAge = null, idx = 0;
while (true) {
  const raw = simulatedInputs[idx++];
  validAge = parseIntInRange(raw, 0, 120);
  if (validAge !== null) break;
  note(`"${raw}" rejected, asking again...`);
}
show("Accepted age", validAge);

// 3.5.1 / 3.5.2 Practice & Challenge — primes with early exit
function primesUpTo(n) {
  const primes = [];
  for (let candidate = 2; candidate <= n; candidate++) {
    let isPrime = true;
    for (let d = 2; d * d <= candidate; d++) {
      if (candidate % d === 0) { isPrime = false; break; } // one divisor is enough
    }
    if (isPrime) primes.push(candidate);
  }
  return primes;
}
show("primesUpTo(30)", primesUpTo(30));


/* ============================================================================
 * A3. MODULE 3 ASSIGNMENT — NUMBER GUESSING GAME
 * ============================================================================
 * Uses: random numbers, input validation, while loop, if/else, break,
 *       continue, arrays (history), template strings.
 * Design: game logic is a pure function → we can test it with a bot player.
 */
lesson("A3. Assignment: Number Guessing Game");

function checkGuess(secret, guess) {
  if (guess === secret) return "correct";
  const distance = Math.abs(secret - guess);
  const hint = distance <= 5 ? " (very close!)" : distance <= 15 ? " (close)" : "";
  return (guess < secret ? "too low" : "too high") + hint;
}

// Bot player using binary search → always wins within 7 guesses for 1..100
function botPlays(secret) {
  let low = 1, high = 100;
  const history = [];
  while (low <= high) {
    const guess = Math.floor((low + high) / 2);
    const result = checkGuess(secret, guess);
    history.push(`${guess}:${result}`);
    if (result === "correct") break;
    if (result.startsWith("too low")) low = guess + 1;
    else high = guess - 1;
  }
  return history;
}
const secretForBot = randomInt(1, 100);
show(`Bot finds ${secretForBot}`, botPlays(secretForBot).join(" → "));

async function guessingGameInteractive(maxAttempts = 7) {
  const secret = randomInt(1, 100);
  const history = [];
  console.log(`I'm thinking of a number 1–100. You have ${maxAttempts} attempts.`);
  while (history.length < maxAttempts) {
    const raw = await ask(`Attempt ${history.length + 1}/${maxAttempts}: `);
    if (raw === null) break;                          // input closed (Ctrl+D)
    const guess = parseIntInRange(raw, 1, 100);
    if (guess === null) { console.log("Enter a whole number 1–100."); continue; } // doesn't cost an attempt
    if (history.includes(guess)) { console.log("Already tried that!"); continue; }
    history.push(guess);
    const result = checkGuess(secret, guess);
    if (result === "correct") {
      return console.log(`🎉 Correct! ${secret} in ${history.length} attempt(s).`);
    }
    console.log(`${result}   | tried: ${history.join(", ")}`);
  }
  console.log(`Game over. The number was ${secret}.`);
}


/* ============================================================================
 * 4.1 DECLARING AND CALLING FUNCTIONS
 * ============================================================================
 * THREE WAYS (same result, small differences):
 *   function name(a) { return a; }   declaration  — hoisted (callable before its line)
 *   const name = function (a) {...}  expression   — not hoisted
 *   const name = (a) => a;           arrow        — short; no own `this`
 *
 * Functions are VALUES: store them, pass them, return them.
 */
lesson("4.1 Declaring and calling functions");

// Declaration — hoisted: this call works even though the function is defined below it
show("formatPrice(1999) (hoisted)", formatPrice(1999));
function formatPrice(cents, currency = "$") {
  return `${currency}${(cents / 100).toFixed(2)}`;
}

// Expression
const isValidEmail = function (text) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
};
show("isValidEmail('a@b.com')", isValidEmail("a@b.com"));
show("isValidEmail('a@b')", isValidEmail("a@b"));

// Arrow — one expression → implicit return, no braces
const minutesToHours = minutes => +(minutes / 60).toFixed(1);
const fullNameOf = (first, last) => `${first} ${last}`;
const makeLecture = (title, duration) => ({ title, duration }); // object → wrap in ( )
show("minutesToHours(135)", minutesToHours(135));
show("makeLecture()", makeLecture("4.1 Functions", "27:51"));

// Functions as values: CALLBACKS — you pass behavior into another function
// This is how event handlers, array methods, and async code all work.
function notifyAll(users, sendFn) {
  for (const u of users) sendFn(u);
}
notifyAll(["Mohamad", "Sara"], u => note(`📧 sent "New lecture available" to ${u}`));

// Real-life callback: event listener (browser)
//   button.addEventListener("click", () => enroll(courseId));

// Methods: functions stored on objects; `this` = the object before the dot
const videoPlayer = {
  currentTime: 0,
  skip(seconds) { this.currentTime += seconds; return this; }, // return this → chaining
  rewind(seconds) { this.currentTime = Math.max(0, this.currentTime - seconds); return this; },
};
videoPlayer.skip(30).skip(30).rewind(10);
show("Player position (s)", videoPlayer.currentTime);
// GOTCHA: arrow functions don't have their own `this` → don't use them as object methods.


/* ============================================================================
 * 4.2 PARAMETERS AND RETURN VALUES
 * ============================================================================
 * - Missing arguments become undefined (no error). Extra ones are ignored.
 * - No overloading in JS: use default values / options objects instead.
 * - A function returns ONE value → return an object/array for several.
 * - No `return` → returns undefined.
 */
lesson("4.2 Parameters and return values");

// Default parameters
function createCourse(title, price = 0, level = "beginner") {
  return { title, price, level, isFree: price === 0 };
}
show("createCourse('JS')", createCourse("JS"));
show("createCourse('React', 59, 'intermediate')", createCourse("React", 59, "intermediate"));

// Options object + destructuring = "named parameters" (best for 3+ params)
function sendEmail({ to, subject, body = "", priority = "normal" }) {
  return `[${priority}] to=${to} subject="${subject}" body=${body.length} chars`;
}
show("sendEmail({...})", sendEmail({ to: "mo@example.com", subject: "Welcome!", priority: "high" }));
// order doesn't matter, self-documenting at the call site ✓

// Rest parameters: any number of arguments → a real array
function averageRating(...ratings) {
  if (ratings.length === 0) return null;
  const sum = ratings.reduce((a, r) => a + r, 0);
  return +(sum / ratings.length).toFixed(2);
}
show("averageRating(5, 4, 5, 3)", averageRating(5, 4, 5, 3));
const ratingsFromDb = [4, 4, 5];
show("averageRating(...array)", averageRating(...ratingsFromDb)); // spread array → arguments

// Returning several values: return an object, destructure on receipt
function courseStatsFor(lectures) {
  const videos = lectures.filter(l => l.duration);
  const seconds = videos.map(l => toSeconds(l.duration));
  return {
    count: lectures.length,
    totalTime: formatHMS(seconds.reduce((a, s) => a + s, 0)),
    shortest: formatHMS(Math.min(...seconds)),
    longest: formatHMS(Math.max(...seconds)),
  };
}
const { count, totalTime, longest: longestTime } = courseStatsFor(javascriptBasics); // rename while destructuring
show("count / total / longest", `${count} / ${totalTime} / ${longestTime}`);

// Return early for validation — a function that returns a result object
function enroll(user, courseId) {
  if (!user) return { ok: false, error: "Please log in" };
  if (user.enrolledCourseIds.includes(courseId)) return { ok: false, error: "Already enrolled" };
  return { ok: true, enrolledCourseIds: [...user.enrolledCourseIds, courseId] }; // new array, no mutation
}
show("enroll(no user)", enroll(null, 1));
show("enroll(already)", enroll(studentUser, 1));
show("enroll(new)", enroll(studentUser, 2));

// GOTCHA: primitives are copied, objects are shared
function applyDiscount(price, cartObj) {
  price = price * 0.5;          // local copy — caller's variable unchanged
  cartObj.discounted = true;    // same object — caller SEES this change
}
let myPrice = 100;
const myCart = {};
applyDiscount(myPrice, myCart);
show("price after call", myPrice);
show("cart after call", myCart);

// GOTCHA: never put a newline right after `return`
function brokenReturn() {
  return                        // JS inserts a ; here → returns undefined
    { ok: true };
}
show("brokenReturn()", brokenReturn());


/* ============================================================================
 * 4.3 REUSABLE CODE AND SCOPE
 * ============================================================================
 * SCOPE    Where a variable is visible: { block } → function → file → global.
 *          Inner code can see outer variables; outer code cannot see inner ones.
 * CLOSURE  A function REMEMBERS the variables around where it was created,
 *          even after the outer function has finished. Gives private state.
 */
lesson("4.3 Reusable code and scope");

// Scope chain
const platformFee = 0.05;                     // file-level: visible everywhere below
function instructorPayout(sales) {
  const gross = sales * 49.99;                // function scope: only inside this function
  if (gross > 1000) {
    const bonus = 50;                         // block scope: only inside this if
    return gross * (1 - platformFee) + bonus;
  }
  return gross * (1 - platformFee);
}
show("instructorPayout(30)", +instructorPayout(30).toFixed(2));
// console.log(gross);                        // ❌ ReferenceError — not visible outside

// APPLIED 1: closure → shopping cart with PRIVATE data (nobody can tamper with `items`)
function createCart() {
  const items = [];                           // private — only the functions below can reach it
  return {
    add(name, priceCents, qty = 1) {
      const existing = items.find(i => i.name === name);
      if (existing) existing.qty += qty;
      else items.push({ name, priceCents, qty });
    },
    remove(name) {
      const i = items.findIndex(item => item.name === name);
      if (i !== -1) items.splice(i, 1);
    },
    totalCents: () => items.reduce((sum, i) => sum + i.priceCents * i.qty, 0),
    list: () => items.map(i => `${i.qty}× ${i.name}`),
  };
}
const myShoppingCart = createCart();
myShoppingCart.add("JS Course", 4999);
myShoppingCart.add("Stickers", 250, 2);
myShoppingCart.add("Stickers", 250);          // merges quantity
myShoppingCart.remove("Nothing");             // safe no-op
show("Cart items", myShoppingCart.list());
show("Cart total", formatPrice(myShoppingCart.totalCents()));
show("Can we reach items directly?", myShoppingCart.items); // undefined — it's private ✓

// APPLIED 2: closure → unique ID generator
function createIdGenerator(prefix) {
  let next = 1;
  return () => `${prefix}-${String(next++).padStart(4, "0")}`;
}
const nextStudentId = createIdGenerator("STU");
const nextCourseId = createIdGenerator("CRS");    // independent counter
show("IDs", [nextStudentId(), nextStudentId(), nextCourseId()]);

// APPLIED 3: function factory → reusable validators from one template
const minLength = n => text => text.trim().length >= n;
const isValidUsername = minLength(3);
const isValidBio = minLength(20);
show("isValidUsername('mo')", isValidUsername("mo"));
show("isValidBio('I love JavaScript and coding')", isValidBio("I love JavaScript and coding"));

// APPLIED 4: memoize → cache slow results (e.g., expensive calculation / API call)
function memoize(fn) {
  const cache = new Map();                    // remembered between calls thanks to the closure
  return arg => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg);
  };
}
let realCalls = 0;
const slowExchangeRate = currency => { realCalls++; return { EUR: 0.92, LBP: 89500 }[currency]; };
const exchangeRate = memoize(slowExchangeRate);
exchangeRate("EUR"); exchangeRate("EUR"); exchangeRate("EUR");
show("3 lookups, real calls made", realCalls); // 1

// APPLIED 5: small reusable functions composed into a pipeline (DRY)
const pipe = (...fns) => input => fns.reduce((value, fn) => fn(value), input);
const cleanUsername = pipe(
  s => s.trim(),
  s => s.toLowerCase(),
  s => s.replace(/[^a-z0-9_]/g, ""),
  s => s.slice(0, 15),
);
show("cleanUsername('  Mohamad Danach!! ')", cleanUsername("  Mohamad Danach!! "));

// Reuse across files = MODULES
//   utils.js:   export function formatPrice(c) { ... }
//   app.js:     import { formatPrice } from "./utils.js";
//   (Node CommonJS:  module.exports = { formatPrice };   const { formatPrice } = require("./utils");)


/* ============================================================================
 * 4.4 RECURSION
 * ============================================================================
 * WHAT   A function that calls itself on a smaller piece of the problem.
 * NEEDS  1) a BASE CASE that stops   2) a step that moves TOWARD the base case.
 * WHEN   Naturally nested data: folders, menus, comment threads, course trees, JSON.
 * GOTCHA Too deep (~10,000 calls) → "RangeError: Maximum call stack size exceeded".
 */
lesson("4.4 Recursion");

// Classic first example
function factorial(n) {
  if (n <= 1) return 1;            // base case
  return n * factorial(n - 1);     // smaller problem
}
show("factorial(5)", factorial(5));

// APPLIED 1: the whole course as a TREE (course → sections → lectures)
const courseTree = {
  title: "Foundations of Programming",
  children: [
    { title: "CS Fundamentals", children: [
      { title: "1.1 Intro", duration: "58:30" },
      { title: "1.2 Binary", duration: "58:19" },
    ]},
    { title: "JavaScript Basics", children: javascriptBasics },
    { title: "Functions", children: [
      { title: "4.1 Declaring and Calling Functions", duration: "27:51" },
      { title: "Extras", children: [{ title: "4.4 Recursion", duration: "20:54" }] }, // nested deeper
    ]},
  ],
};
// Works for ANY depth — that's why recursion is the right tool here
function totalDuration(node) {
  if (!node.children) return node.duration ? toSeconds(node.duration) : 0; // base: a lecture
  return node.children.reduce((sum, child) => sum + totalDuration(child), 0); // recurse
}
function countLectures(node) {
  if (!node.children) return 1;
  return node.children.reduce((n, child) => n + countLectures(child), 0);
}
show("Whole course duration", formatHMS(totalDuration(courseTree)));
show("Whole course lectures", countLectures(courseTree));

// APPLIED 2: print the tree as an indented outline (sidebar menu)
function printOutline(node, depth = 0) {
  note("  ".repeat(depth) + (node.children ? "📁 " : "▸ ") + node.title);
  if (node.children && depth < 1) node.children.forEach(child => printOutline(child, depth + 1));
}
printOutline(courseTree);

// APPLIED 3: nested comment thread (Community page) — count all replies at any depth
const thread = {
  text: "How do closures work?", replies: [
    { text: "A function remembers its scope", replies: [
      { text: "Thanks!", replies: [] },
      { text: "See lesson 4.3", replies: [{ text: "👍", replies: [] }] },
    ]},
    { text: "Check MDN", replies: [] },
  ],
};
const countReplies = comment =>
  comment.replies.reduce((total, r) => total + 1 + countReplies(r), 0);
show("Total replies in thread", countReplies(thread));

// APPLIED 4: find a lecture anywhere in the tree (returns the path)
function findPath(node, title, path = []) {
  const here = [...path, node.title];
  if (node.title === title) return here;                 // base: found
  for (const child of node.children ?? []) {
    const result = findPath(child, title, here);
    if (result) return result;                           // bubble the answer up
  }
  return null;                                           // not in this branch
}
show("Path to '4.4 Recursion'", findPath(courseTree, "4.4 Recursion")?.join(" › "));

// APPLIED 5: Fibonacci — naive recursion is O(2^n), memoized is O(n)
function fib(n, memo = new Map()) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);
  const value = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, value);
  return value;
}
show("fib(50)", fib(50));

// More practice
const sumList = list => (list.length === 0 ? 0 : list[0] + sumList(list.slice(1)));
const reverseText = s => (s === "" ? "" : reverseText(s.slice(1)) + s[0]);
const power = (base, exp) => (exp === 0 ? 1 : base * power(base, exp - 1));
function binarySearch(sorted, target, lo = 0, hi = sorted.length - 1) {
  if (lo > hi) return -1;
  const mid = Math.floor((lo + hi) / 2);
  if (sorted[mid] === target) return mid;
  return sorted[mid] < target ? binarySearch(sorted, target, mid + 1, hi) : binarySearch(sorted, target, lo, mid - 1);
}
show("sumList([1,2,3,4])", sumList([1, 2, 3, 4]));
show("reverseText('hello')", reverseText("hello"));
show("power(2, 10)", power(2, 10));
show("binarySearch([1,3,5,7,9], 7)", binarySearch([1, 3, 5, 7, 9], 7));


/* ============================================================================
 * A4. MODULE 4 ASSIGNMENT — GRADE CALCULATOR
 * ============================================================================
 * Uses: functions with defaults, validation + errors, arrays of objects,
 *       map/filter/reduce/sort, if/else, closures (config), formatted output.
 */
lesson("A4. Assignment: Grade Calculator");

const GRADE_SCALE = [            // must stay sorted high → low (find() takes the first match)
  { min: 90, letter: "A", gpa: 4.0 },
  { min: 80, letter: "B", gpa: 3.0 },
  { min: 70, letter: "C", gpa: 2.0 },
  { min: 60, letter: "D", gpa: 1.0 },
  { min: 0,  letter: "F", gpa: 0.0 },
];
const DEFAULT_WEIGHTS = { assignments: 0.3, midterm: 0.3, final: 0.4 };

function isValidScore(score) {
  return typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 100;
}

function gradeFor(score) {
  if (!isValidScore(score)) throw new RangeError(`Invalid score: ${score}`); // fail loudly
  return GRADE_SCALE.find(g => score >= g.min);
}

function weightedAverage(student, weights = DEFAULT_WEIGHTS) {
  let total = 0, weightSum = 0;
  for (const [part, weight] of Object.entries(weights)) {
    const raw = student[part];
    // assignments can be a list → average it first
    const score = Array.isArray(raw) ? raw.reduce((a, s) => a + s, 0) / raw.length : raw;
    if (!isValidScore(score)) throw new RangeError(`${student.name}: invalid ${part} (${raw})`);
    total += score * weight;
    weightSum += weight;
  }
  return total / weightSum;
}

function reportCard(student) {
  const average = +weightedAverage(student).toFixed(1);
  const { letter, gpa } = gradeFor(average);
  return { name: student.name, average, letter, gpa, status: average >= 60 ? "PASS" : "FAIL" };
}

function classReport(students) {
  const cards = [], errors = [];
  for (const s of students) {
    try {
      cards.push(reportCard(s));
    } catch (err) {
      errors.push(err.message);              // one bad record doesn't kill the report
      continue;
    }
  }
  cards.sort((a, b) => b.average - a.average);  // rank: best first
  const averages = cards.map(c => c.average);
  return {
    cards,
    errors,
    classAverage: +(averages.reduce((a, v) => a + v, 0) / averages.length).toFixed(1),
    top: cards[0]?.name,
    passRate: `${Math.round((cards.filter(c => c.status === "PASS").length / cards.length) * 100)}%`,
    distribution: cards.reduce((acc, c) => ({ ...acc, [c.letter]: (acc[c.letter] ?? 0) + 1 }), {}),
  };
}

const classStudents = [
  { name: "Mohamad", assignments: [95, 100, 90], midterm: 88, final: 92 },
  { name: "Sara",    assignments: [80, 75, 85],  midterm: 82, final: 74 },
  { name: "Omar",    assignments: [60, 50, 70],  midterm: 55, final: 58 },
  { name: "Lina",    assignments: [90, 85, 88],  midterm: 91, final: 79 },
  { name: "Ghost",   assignments: [100],         midterm: 140, final: 90 }, // bad data on purpose
];
const report = classReport(classStudents);
console.table(report.cards);
show("Class average", report.classAverage);
show("Top student", report.top);
show("Pass rate", report.passRate);
show("Distribution", report.distribution);
show("Rejected records", report.errors);

async function gradeCalculatorInteractive() {
  const scores = [];
  console.log("Enter scores 0–100, one per line. Empty line to finish.");
  while (true) {
    const raw = await ask(`Score #${scores.length + 1}: `);
    if (!raw?.trim()) break;                       // empty line or input closed
    const score = parseNumber(raw);
    if (!isValidScore(score)) { console.log("❌ Must be a number 0–100."); continue; }
    scores.push(score);
  }
  if (scores.length === 0) return console.log("No scores entered.");
  const avg = scores.reduce((a, s) => a + s, 0) / scores.length;
  const { letter, gpa } = gradeFor(avg);
  console.log(`Average ${avg.toFixed(1)} → ${letter} (GPA ${gpa}) | best ${Math.max(...scores)} | worst ${Math.min(...scores)}`);
}


/* ============================================================================
 * ★ CHEAT SHEET — THE 20 JAVASCRIPT GOTCHAS (read this before any interview)
 * ============================================================================
 *  1. Use === and !==. Never == (it converts types: 0 == "" is true).
 *  2. const by default, let when reassigning, never var.
 *  3. const object ≠ immutable object (use Object.freeze if needed).
 *  4. One number type: 7 / 2 = 3.5. Integer division: Math.trunc(a / b).
 *  5. 0.1 + 0.2 !== 0.3 → store money in cents.
 *  6. NaN !== NaN → use Number.isNaN(x).
 *  7. Falsy: false 0 "" null undefined NaN (and -0, 0n). [] and {} are TRUTHY.
 *  8. typeof null === "object"; typeof [] === "object" → Array.isArray().
 *  9. "5" + 1 = "51" but "5" - 1 = 4. Convert input with Number().
 * 10. || replaces 0 and "" too → use ?? for "only if null/undefined".
 * 11. obj?.a?.b → undefined instead of a crash on missing data.
 * 12. arr.sort() sorts as STRINGS → arr.sort((a, b) => a - b).
 * 13. Out-of-range index → undefined, not an exception.
 * 14. Arrays/objects are references: copy with [...arr], {...obj}, structuredClone().
 * 15. [1] === [1] is false (reference comparison).
 * 16. for...of → values; for...in → object keys. Don't use for...in on arrays.
 * 17. forEach can't break → use for...of, or find/some/every.
 * 18. Missing arguments = undefined. No overloading; use defaults/options objects.
 * 19. Never put a line break right after `return`.
 * 20. Arrow functions have no own `this` → don't use them as object methods.
 */


/* ============================================================================
 * RUN THE INTERACTIVE ASSIGNMENTS (only with --interactive)
 * ============================================================================ */
async function main() {
  if (!process.argv.includes("--interactive")) {
    lesson("✔ Done. Run with --interactive to play the 3 assignments yourself.");
    return;
  }
  lesson("A1 (interactive): Temperature Converter");
  await temperatureConverterInteractive();
  lesson("A3 (interactive): Number Guessing Game");
  await guessingGameInteractive();
  lesson("A4 (interactive): Grade Calculator");
  await gradeCalculatorInteractive();
  rl?.close();
}
main();
