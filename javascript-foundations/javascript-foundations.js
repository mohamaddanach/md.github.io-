/******************************************************************************
 * JAVASCRIPT FOUNDATIONS — THE WHOLE COURSE IN ONE FILE
 * ----------------------------------------------------------------------------
 * Written for someone who already knows programming (C / Java / Python) and
 * only needs to know "how does JavaScript do it, and where does it bite?".
 *
 * HOW TO RUN
 *   node javascript-foundations.js                -> runs every section
 *   node javascript-foundations.js --interactive  -> also plays the
 *                                                    interactive assignments
 *   (or paste any section into the browser DevTools console / an online
 *    compiler such as https://onecompiler.com/javascript)
 *
 * TABLE OF CONTENTS (mirrors the course outline)
 *   1.   Computer Science Fundamentals (JS-specific view)
 *   2.0  Setup + first code execution
 *   2.1  Variables and constants
 *   2.2  Numbers, strings, booleans (+ null / undefined / typeof / coercion)
 *   2.3.1 Arithmetic operators
 *   2.3.2 Logical & comparison operators
 *   2.3.3 Complex operations (ternary, precedence, ??, ?., bitwise)
 *   2.4  Taking user input
 *   A1   Assignment: Temperature Converter
 *   3.1  If / else, nested conditions, switch
 *   3.2  While and do-while loops
 *   3.3  Arrays and array operations
 *   3.4  For loops and array processing (for, for...of, for...in, map/filter/reduce)
 *   3.5  Break, continue, labels, advanced loop control
 *   A3   Module 3 Assignment: Number Guessing Game
 *   4.1  Declaring and calling functions
 *   4.2  Parameters and return values
 *   4.3  Reusable code and scope (closures)
 *   4.4  Recursion
 *   A4   Module 4 Assignment: Grade Calculator
 *   X    Bonus: objects in 30 seconds + "gotchas" cheat sheet
 ******************************************************************************/

"use strict"; // Opt-in to strict mode: turns silent mistakes into errors
              // (e.g. assigning to an undeclared variable throws instead of
              // silently creating a global). Always use it (ES modules & classes
              // are strict automatically).

// Tiny helper so the output is readable when you run the file.
function section(title) {
  console.log("\n" + "=".repeat(70) + "\n" + title + "\n" + "=".repeat(70));
}

/* ============================================================================
 * 1. COMPUTER SCIENCE FUNDAMENTALS — THE JS VIEW
 * ============================================================================
 * - JavaScript (ECMAScript standard) is a high-level, dynamically typed,
 *   garbage-collected, multi-paradigm language (procedural + OOP + functional).
 * - It is JIT-compiled by an engine: V8 (Chrome, Node.js), SpiderMonkey
 *   (Firefox), JavaScriptCore (Safari). Source -> parse -> bytecode ->
 *   optimized machine code for hot paths.
 * - Runtimes: the BROWSER (has `window`, `document`, `alert`, `prompt`) and
 *   NODE.JS (has `process`, `require`, file system, no DOM).
 * - Single-threaded with an EVENT LOOP: one call stack; async work
 *   (timers, I/O, network) is handed off and its callback is queued back.
 * - Dynamically typed: variables have no type, VALUES do.
 * - Everything that isn't a primitive is an object (arrays and functions too).
 */
section("1. CS Fundamentals");
console.log("Running on Node", typeof process !== "undefined" ? process.version : "(browser)");

/* ============================================================================
 * 2.0.1 SETUP  /  2.0.2 YOUR FIRST CODE EXECUTION
 * ============================================================================
 * Options: browser DevTools console (F12), Node.js (`node file.js`), or an
 * online compiler. `console.log` is your print().
 */
section("2.0 First code execution");
console.log("Hello, World!");
console.log("Multiple", "args", 42, true);    // space-separated
console.log("Formatted: %s is %d years", "Ali", 25); // printf-style
console.error("This goes to stderr");          // also: console.warn, console.table
console.table([{ lang: "JS", year: 1995 }, { lang: "Java", year: 1995 }]);

/* ============================================================================
 * 2.1 VARIABLES AND CONSTANTS
 * ============================================================================
 *            scope      re-assign  re-declare  hoisted?
 *   var     function      yes        yes       yes (initialized to undefined)
 *   let     block         yes        no        yes, but in "TDZ" until declared
 *   const   block         no         no        same as let
 *
 * RULE: use `const` by default, `let` when you must reassign, never `var`.
 */
section("2.1 Variables and Constants");

let age = 25;          // can change
age = 26;
const PI = 3.14159;    // cannot be reassigned
// PI = 3;             // TypeError: Assignment to constant variable.

// const means the BINDING is constant, not the value. Objects stay mutable:
const user = { name: "Mohamad" };
user.name = "Mo";      // OK — mutating the object, not rebinding `user`
// user = {};          // TypeError
const frozen = Object.freeze({ x: 1 }); // shallow immutability if you need it

// Block scope vs function scope
if (true) {
  var fnScoped = "var leaks out of blocks";
  let blockScoped = "let stays inside";
}
console.log(fnScoped);                 // works
// console.log(blockScoped);           // ReferenceError

// Hoisting
console.log(hoisted);                  // undefined (declaration hoisted, not value)
var hoisted = "now I have a value";
// console.log(tdz);                   // ReferenceError: Cannot access before init (TDZ)
// let tdz = 1;

// Multiple declarations, destructuring (very common in modern JS)
let a = 1, b = 2;
[a, b] = [b, a];                        // swap without temp
const { name } = user;                  // pull property into a variable
console.log({ age, PI, a, b, name });   // shorthand object -> prints names + values

// Naming: camelCase for variables/functions, PascalCase for classes,
// UPPER_SNAKE for true constants. Identifiers may contain letters, digits, _ and $
// (cannot start with a digit). Case-sensitive.

/* ============================================================================
 * 2.2 NUMBERS, STRINGS, AND BOOLEANS
 * ============================================================================
 * 7 primitive types: number, string, boolean, undefined, null, bigint, symbol.
 * Everything else is an object.
 */
section("2.2 Numbers, Strings, Booleans");

// ---------- NUMBERS ----------
// ONE number type: IEEE-754 64-bit double. No separate int/float.
console.log(7 / 2);                     // 3.5  (no integer division!)
console.log(Math.trunc(7 / 2));         // 3    (integer division equivalent)
console.log(0.1 + 0.2);                 // 0.30000000000000004 (float precision)
console.log((0.1 + 0.2).toFixed(2));    // "0.30" (a STRING)
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON); // true: compare floats this way
console.log(Number.MAX_SAFE_INTEGER);   // 9007199254740991 (2^53 - 1)
console.log(10 / 0, -10 / 0);           // Infinity -Infinity (no exception!)
console.log(0 / 0, "abc" * 2);         // NaN NaN ("Not a Number" — itself a number type)
console.log(NaN === NaN);               // false! NaN is never equal to anything
console.log(Number.isNaN(NaN));         // true  -> correct way to test
console.log(1_000_000, 0xff, 0b1010, 0o17, 2e3); // separators, hex, binary, octal, exponent
console.log(123456789012345678901234567890n * 2n); // BigInt: arbitrary precision ints (suffix n)

// Parsing / converting
console.log(Number("42"), Number("42px"), Number(""));  // 42 NaN 0
console.log(parseInt("42px"), parseFloat("3.14abc"));   // 42 3.14 (parses prefix)
console.log(parseInt("ff", 16));                        // 255 (always pass radix)
console.log((255).toString(2), (3.14159).toFixed(2));   // "11111111" "3.14"
console.log(Number.isInteger(5.0));                     // true

// ---------- STRINGS ----------
// Immutable, UTF-16. Single, double quotes are identical; backticks = template literals.
const first = "Mohamad";
const greeting = `Hello ${first}, 2 + 3 = ${2 + 3}`; // interpolation of any expression
const multiline = `line 1
line 2`;                                            // multi-line allowed in backticks
console.log(greeting);
console.log(multiline);

const s = "JavaScript";
console.log(s.length);                   // 10
console.log(s[0], s.at(-1));             // "J" "t"   (at() supports negative index)
console.log(s.toUpperCase(), s.toLowerCase());
console.log(s.slice(0, 4), s.slice(-6)); // "Java" "Script"
console.log(s.substring(4));             // "Script"
console.log(s.indexOf("a"), s.lastIndexOf("a"), s.indexOf("z")); // 1 3 -1
console.log(s.includes("Script"), s.startsWith("Java"), s.endsWith("x"));
console.log("  pad  ".trim() + "|");     // "pad|" (also trimStart / trimEnd)
console.log("a,b,c".split(","));         // ["a","b","c"]
console.log("ha".repeat(3));             // "hahaha"
console.log("5".padStart(3, "0"));       // "005"
console.log("cat cat".replace("cat", "dog"), "cat cat".replaceAll("cat", "dog"));
console.log("a" < "b", "Z" < "a");       // lexicographic by code unit: true true
// s[0] = "X";  // silently ignored (strict mode: TypeError) — strings are immutable

// ---------- BOOLEANS ----------
const isAdult = age >= 18;               // true
console.log(isAdult, typeof isAdult);

// TRUTHY / FALSY — critical in JS. Exactly these are falsy:
//   false, 0, -0, 0n, "", null, undefined, NaN
// EVERYTHING else is truthy — including "0", "false", [], {}  (unlike Python!)
console.log(Boolean(""), Boolean("0"), Boolean([]), Boolean({}), !!0); // false true true true false

// ---------- null vs undefined ----------
let notAssigned;                          // undefined = "no value yet" (engine default)
const empty = null;                       // null      = "intentionally nothing" (you set it)
console.log(notAssigned, empty);

// ---------- typeof ----------
console.log(typeof 42, typeof "x", typeof true, typeof undefined, typeof 10n,
            typeof Symbol(), typeof {}, typeof [], typeof null, typeof function () {});
// number string boolean undefined bigint symbol object object object(!) function
// typeof null === "object" is a famous historical bug. Use Array.isArray([]) for arrays.

// ---------- TYPE COERCION & EQUALITY ----------
console.log("5" + 3);   // "53"  -> + with a string concatenates
console.log("5" - 3);   // 2     -> other math ops convert to number
console.log("5" * "2"); // 10
console.log(true + 1);  // 2
console.log([] + {});   // "[object Object]"  — just don't
console.log(5 == "5", 5 === "5");          // true false
console.log(null == undefined, null === undefined); // true false
console.log(0 == "", 0 == "0", "" == "0");  // true true false  (non-transitive!)
// RULE: always use === and !== (strict, no coercion). Convert explicitly:
console.log(String(42), Number("42"), Boolean(1), `${42}`, +"42");

/* ============================================================================
 * 2.3.1 ARITHMETIC OPERATORS
 * ============================================================================ */
section("2.3.1 Arithmetic Operators");
const x = 17, y = 5;
console.log(x + y, x - y, x * y, x / y); // 22 12 85 3.4
console.log(x % y);                      // 2   remainder (sign follows dividend: -17 % 5 = -2)
console.log(((-17 % 5) + 5) % 5);        // 3   true mathematical modulo
console.log(x ** 2, 2 ** 0.5);           // 289 1.414...  exponent (same as Math.pow)

let counter = 0;
console.log(counter++);                  // 0  post-increment: returns old value
console.log(++counter);                  // 2  pre-increment: returns new value
counter += 10; counter -= 2; counter *= 3; counter /= 2; counter %= 7; counter **= 2;
console.log(counter);                    // compound assignment operators

// Unary
console.log(-x, +"3", +true);            // -17 3 1  (unary + converts to number)

// Math object (static helpers)
console.log(Math.round(2.5), Math.round(-2.5)); // 3 -2  (rounds half toward +∞)
console.log(Math.floor(-2.5), Math.ceil(2.1), Math.trunc(-2.9)); // -3 3 -2
console.log(Math.max(3, 9, 1), Math.min(...[4, 2, 8]));           // 9 2 (spread array)
console.log(Math.sqrt(16), Math.cbrt(27), Math.abs(-4), Math.sign(-3));
console.log(Math.floor(Math.random() * 6) + 1); // random int 1..6
// randomInt(min, max) inclusive — you'll use this in the guessing game:
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/* ============================================================================
 * 2.3.2 LOGICAL (AND COMPARISON) OPERATORS
 * ============================================================================ */
section("2.3.2 Logical Operators");
// Comparison: <  >  <=  >=  ===  !==  (==, != exist but avoid them)
console.log(3 > 2, 3 >= 3, "10" < "9", 10 < 9); // true true true(!string compare) false

// && || ! — BUT in JS they return one of the OPERANDS, not necessarily a boolean.
//   a || b -> a if a is truthy, else b
//   a && b -> a if a is falsy,  else b
console.log(true && false, true || false, !true);  // false true false
console.log("hi" || "default");     // "hi"
console.log("" || "default");       // "default"
console.log(0 && "never");          // 0
console.log("a" && "b");            // "b"

// Short-circuit evaluation: right side runs only if needed
const loggedIn = false;
loggedIn && console.log("will NOT print");
loggedIn || console.log("prints because left side is falsy");

// ?? (nullish coalescing): fallback ONLY for null/undefined, not 0 or ""
const volume = 0;
console.log(volume || 50);   // 50  (wrong — 0 is a valid volume!)
console.log(volume ?? 50);   // 0   (correct)

// Logical assignment
let opts = { retries: 0 };
opts.retries ||= 3;          // assigns if falsy        -> 3
opts.timeout ??= 1000;       // assigns if null/undef   -> 1000
opts.debug &&= "never";      // assigns if truthy       -> stays undefined
console.log(opts);

// De Morgan works as usual: !(a && b) === (!a || !b)

/* ============================================================================
 * 2.3.3 COMPLEX OPERATIONS
 * ============================================================================ */
section("2.3.3 Complex Operations");

// Ternary: condition ? ifTrue : ifFalse  (an EXPRESSION — returns a value)
const score = 73;
const status = score >= 50 ? "pass" : "fail";
const tier = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "F"; // chainable, keep it short
console.log(status, tier);

// Operator precedence (high -> low, abridged):
//   ()  >  ?. [] call  >  ! unary+ - ++ -- typeof  >  **  >  * / %  >  + -
//   >  < <= > >=  >  === !==  >  &&  >  ||  ??  >  ? :  >  = += ...  >  ,
console.log(2 + 3 * 4 ** 2);        // 50  (** first, then *, then +)
console.log((2 + 3) * 4);           // 20  parentheses win — use them for clarity
console.log(-(2 ** 2));             // -4  (-2 ** 2 is a SyntaxError: ambiguous)
// console.log(a || b ?? c);        // SyntaxError: must parenthesize when mixing ?? with ||/&&

// Optional chaining ?. — stops and returns undefined instead of throwing
const profile = { address: { city: "Beirut" } };
console.log(profile.address?.city);      // "Beirut"
console.log(profile.job?.title);         // undefined (no TypeError)
console.log(profile.job?.title ?? "N/A");// "N/A"  (?. + ?? is a common combo)
console.log(profile.greet?.());          // undefined — optional call

// Bitwise (work on 32-bit ints): & | ^ ~ << >> >>>
console.log(5 & 3, 5 | 3, 5 ^ 3, ~5, 1 << 4, -16 >> 2, -16 >>> 28); // 1 7 6 -6 16 -4 15
console.log((n => (n & 1) === 0)(10));   // even check via bitwise

// Comma operator & chained assignment (rare, but you'll see them)
let p, q;
p = q = 10;
console.log(p, q);

// A "complex" expression combining everything:
const cart = [{ price: 20, qty: 2 }, { price: 5, qty: 0 }];
const hasDiscount = true;
const total = cart.reduce((sum, it) => sum + it.price * it.qty, 0) * (hasDiscount ? 0.9 : 1);
console.log(`Total: ${total.toFixed(2)}`); // 36.00

/* ============================================================================
 * 2.4 TAKING USER INPUT
 * ============================================================================
 * BROWSER:
 *     const name = prompt("Your name?");      // returns a STRING, or null on Cancel
 *     const n = Number(prompt("A number?"));  // ALWAYS convert + validate
 *     alert("Hi " + name);  confirm("Sure?") // -> true/false
 *
 * NODE.JS: no prompt(). Use the built-in `readline` module (async).
 *   Below is a reusable `ask()` helper based on promises + async/await:
 *     const answer = await ask("Question? ");
 *   `await` pauses this async function until the user presses Enter, without
 *   blocking the event loop.
 */
section("2.4 Taking User Input");

let rl = null, lines = null; // created lazily only in interactive mode
function ask(question) {
  if (!rl) {
    const readline = require("readline");
    rl = readline.createInterface({ input: process.stdin });
    lines = rl[Symbol.asyncIterator](); // buffers lines, so piped input works too
  }
  process.stdout.write(question);
  return lines.next().then(r => (r.done ? null : r.value)); // null when input ends
}

// Validation pattern you'll use everywhere: input is a string -> convert -> check
function parseNumber(input) {
  const n = Number(String(input).trim());
  if (String(input).trim() === "" || Number.isNaN(n)) return null; // invalid
  return n;
}
console.log(parseNumber("42"), parseNumber(" 3.5 "), parseNumber("abc"), parseNumber("")); // 42 3.5 null null

/* ============================================================================
 * ASSIGNMENT: TEMPERATURE CONVERTER
 * ============================================================================
 *   C -> F : F = C * 9/5 + 32
 *   F -> C : C = (F - 32) * 5/9
 *   C -> K : K = C + 273.15
 */
section("Assignment: Temperature Converter");

function celsiusToFahrenheit(c) { return c * 9 / 5 + 32; }
function fahrenheitToCelsius(f) { return (f - 32) * 5 / 9; }
function celsiusToKelvin(c)     { return c + 273.15; }

function convertTemperature(value, unit) {
  // Normalize input: accept "c", "C", " celsius " etc.
  const u = String(unit).trim().toUpperCase()[0];
  switch (u) {
    case "C": return { C: value, F: celsiusToFahrenheit(value), K: celsiusToKelvin(value) };
    case "F": { const c = fahrenheitToCelsius(value); return { C: c, F: value, K: celsiusToKelvin(c) }; }
    case "K": { const c = value - 273.15;             return { C: c, F: celsiusToFahrenheit(c), K: value }; }
    default:  return null; // unknown unit
  }
}

function formatTemps(t) {
  return `${t.C.toFixed(2)}°C = ${t.F.toFixed(2)}°F = ${t.K.toFixed(2)}K`;
}
console.log(formatTemps(convertTemperature(100, "C"))); // 100.00°C = 212.00°F = 373.15K
console.log(formatTemps(convertTemperature(98.6, "f"))); // 37.00°C = ...
console.log(convertTemperature(10, "X"));               // null

async function temperatureConverterInteractive() {
  const value = parseNumber(await ask("Temperature value: "));
  if (value === null) return console.log("Invalid number.");
  const result = convertTemperature(value, await ask("Unit (C/F/K): "));
  console.log(result ? formatTemps(result) : "Unknown unit.");
}

/* ============================================================================
 * 3.1 IF-ELSE AND NESTED CONDITIONS (+ switch)
 * ============================================================================ */
section("3.1 If-Else and Nested Conditions");

function classifyNumber(n) {
  if (typeof n !== "number" || Number.isNaN(n)) {
    return "not a number";
  } else if (n === 0) {
    return "zero";
  } else if (n > 0) {
    // nested condition
    if (n % 2 === 0) return "positive even";
    else return "positive odd";
  } else {
    return n % 2 === 0 ? "negative even" : "negative odd";
  }
}
console.log([7, -4, 0, NaN].map(classifyNumber));

// Prefer GUARD CLAUSES (early return) over deep nesting:
function canRentCar(person) {
  if (!person) return false;
  if (person.age < 21) return false;
  if (!person.hasLicense) return false;
  return true;
}
console.log(canRentCar({ age: 25, hasLicense: true }), canRentCar({ age: 19, hasLicense: true }));

// Leap year — classic nested-logic exercise, shown as one boolean expression
const isLeap = yr => (yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0;
console.log(isLeap(2024), isLeap(1900), isLeap(2000)); // true false true

// switch uses STRICT (===) comparison. Don't forget `break` (fall-through!).
function dayType(day) {
  switch (day.toLowerCase()) {
    case "saturday":
    case "sunday":            // intentional fall-through: groups cases
      return "weekend";
    case "monday":
    case "tuesday":
    case "wednesday":
    case "thursday":
    case "friday":
      return "weekday";
    default:
      return "invalid day";
  }
}
console.log(dayType("Sunday"), dayType("friday"), dayType("funday"));

// switch(true) trick for ranges:
function bmiCategory(bmi) {
  switch (true) {
    case bmi < 18.5: return "underweight";
    case bmi < 25:   return "normal";
    case bmi < 30:   return "overweight";
    default:         return "obese";
  }
}
console.log(bmiCategory(22.3));

// Object lookup — often cleaner than switch:
const HTTP = { 200: "OK", 404: "Not Found", 500: "Server Error" };
console.log(HTTP[404] ?? "Unknown");

// 3.1.1 / 3.1.2 Practice & challenge: FizzBuzz (conditions + loop)
const fizzBuzz = n => (n % 15 === 0 ? "FizzBuzz" : n % 3 === 0 ? "Fizz" : n % 5 === 0 ? "Buzz" : n);
console.log(Array.from({ length: 15 }, (_, i) => fizzBuzz(i + 1)).join(" "));

/* ============================================================================
 * 3.2 WHILE LOOPS (and do...while)
 * ============================================================================ */
section("3.2 While Loops");

// while: checks condition BEFORE each iteration (may run 0 times)
let i = 1;
while (i <= 5) {
  process.stdout.write(i + " ");
  i++;                            // forget this -> infinite loop
}
console.log();

// do...while: body runs AT LEAST once, condition checked after
let attempts = 0;
do {
  attempts++;
} while (attempts < 3);
console.log("attempts:", attempts);

// Typical use: unknown number of iterations
// 3.2.1 Practice: sum of digits
function sumDigits(n) {
  n = Math.abs(n);
  let sum = 0;
  while (n > 0) {
    sum += n % 10;
    n = Math.floor(n / 10);
  }
  return sum;
}
console.log(sumDigits(98765)); // 35

// 3.2.2 Challenge: reverse a number, check palindrome, Collatz steps, GCD
function reverseNumber(n) {
  let rev = 0;
  while (n > 0) { rev = rev * 10 + (n % 10); n = Math.floor(n / 10); }
  return rev;
}
const isPalindromeNumber = n => n === reverseNumber(n);

function collatzSteps(n) {
  let steps = 0;
  while (n !== 1) { n = n % 2 === 0 ? n / 2 : 3 * n + 1; steps++; }
  return steps;
}

function gcd(a, b) {             // Euclid's algorithm
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}
console.log(reverseNumber(1234), isPalindromeNumber(12321), collatzSteps(27), gcd(48, 18)); // 4321 true 111 6

/* ============================================================================
 * 3.3 ARRAYS  /  3.3.1 ARRAYS AND OPERATIONS
 * ============================================================================
 * JS arrays are dynamic, 0-indexed, can hold mixed types, and are OBJECTS
 * (passed/assigned by reference).
 */
section("3.3 Arrays");

const nums = [5, 3, 8, 1];
const mixed = [1, "two", true, null, [3, 4], { five: 5 }];
const zeros = new Array(3).fill(0);               // [0,0,0]
const range = Array.from({ length: 5 }, (_, k) => k * 2); // [0,2,4,6,8]
console.log(nums, mixed.length, zeros, range);

// Access
console.log(nums[0], nums[nums.length - 1], nums.at(-1)); // 5 1 1
console.log(nums[99]);                            // undefined (no IndexOutOfBounds!)

// ---- MUTATING methods (change the original array) ----
const arr = [1, 2, 3];
arr.push(4, 5);       // add to end        -> returns new length
arr.pop();            // remove from end   -> returns removed (5)
arr.unshift(0);       // add to start
arr.shift();          // remove from start
console.log(arr);     // [1,2,3,4]

const letters = ["a", "b", "c", "d", "e"];
letters.splice(1, 2);             // remove 2 items at index 1 -> ["a","d","e"]
letters.splice(1, 0, "X", "Y");   // insert at index 1          -> ["a","X","Y","d","e"]
console.log(letters);
letters.reverse();                // in-place
console.log(letters);

// SORT GOTCHA: default sort compares as STRINGS
console.log([10, 1, 5, 100].sort());               // [1, 10, 100, 5]  !!
console.log([10, 1, 5, 100].sort((m, n) => m - n)); // [1, 5, 10, 100] ascending
console.log(["b", "a", "C"].sort((m, n) => m.localeCompare(n)));

// ---- NON-mutating methods (return new arrays/values) ----
console.log(nums.slice(1, 3));            // [3, 8] (end exclusive)
console.log(nums.concat([9, 10]));        // [5,3,8,1,9,10]
console.log([...nums, 9]);                // spread — same idea
console.log(nums.indexOf(8), nums.includes(42));   // 2 false
console.log(nums.join(" - "));            // "5 - 3 - 8 - 1"
console.log(nums.toSorted((m, n) => m - n), nums); // ES2023: sorted copy, original intact
console.log([1, [2, [3, [4]]]].flat(Infinity));    // [1,2,3,4]

// REFERENCE semantics
const original = [1, 2, 3];
const alias = original;           // same array!
const copy = [...original];       // shallow copy (also: original.slice(), Array.from)
alias.push(99);
console.log(original, copy);      // [1,2,3,99] [1,2,3]
console.log([1, 2] === [1, 2]);   // false — compares references, not contents
const deep = structuredClone([{ a: 1 }]); // deep copy

// Destructuring
const [firstNum, secondNum, ...rest] = nums;
console.log(firstNum, secondNum, rest);   // 5 3 [8, 1]

// 2D arrays (matrix)
const grid = [[1, 2, 3], [4, 5, 6]];
console.log(grid[1][2]);                  // 6
console.log(Array.isArray(grid));         // true

// 3.3.1 Practice / 3.3.3 Challenge: find max, remove duplicates, second largest
const findMax = list => list.reduce((m, v) => (v > m ? v : m), -Infinity);
const unique = list => [...new Set(list)];          // Set = unique values
const secondLargest = list => unique(list).sort((m, n) => n - m)[1];
console.log(findMax([3, 9, 2]), unique([1, 1, 2, 3, 3]), secondLargest([4, 9, 9, 7])); // 9 [1,2,3] 7

/* ============================================================================
 * 3.4 FOR LOOPS AND ARRAY PROCESSING
 * ============================================================================ */
section("3.4 For Loops and Array Processing");

const fruits = ["apple", "banana", "cherry"];

// Classic C-style for — when you need the index or custom stepping
for (let k = 0; k < fruits.length; k++) {
  console.log(k, fruits[k]);
}
for (let k = 10; k > 0; k -= 3) process.stdout.write(k + " "); // 10 7 4 1
console.log();

// for...of — iterates VALUES of any iterable (arrays, strings, Sets, Maps)
for (const fruit of fruits) console.log("of:", fruit);
for (const ch of "hey") process.stdout.write(ch + "|");
console.log();
for (const [idx, fruit] of fruits.entries()) console.log(idx, fruit); // value + index

// for...in — iterates KEYS of an object. DON'T use it on arrays.
const car = { brand: "BMW", year: 2020 };
for (const key in car) console.log(key, "=>", car[key]);
// Modern alternatives: Object.keys(car), Object.values(car), Object.entries(car)
for (const [key, val] of Object.entries(car)) console.log(`${key}: ${val}`);

// forEach — callback per element (cannot break out of it!)
fruits.forEach((fruit, idx) => console.log(`#${idx} ${fruit}`));

// ---- Higher-order array methods: the JS way to process arrays ----
const prices = [12, 45, 7, 30, 99];
const doubled  = prices.map(p => p * 2);                  // transform each -> new array
const cheap    = prices.filter(p => p < 40);              // keep matching -> new array
const sum      = prices.reduce((acc, p) => acc + p, 0);   // fold to one value (always give initial!)
const firstBig = prices.find(p => p > 40);                // first match or undefined
const bigIndex = prices.findIndex(p => p > 40);           // index or -1
const anyFree  = prices.some(p => p === 0);               // true if ANY passes
const allPos   = prices.every(p => p > 0);                // true if ALL pass
console.log({ doubled, cheap, sum, avg: sum / prices.length, firstBig, bigIndex, anyFree, allPos });

// Chaining: total of prices > 10 after 10% tax
const taxed = prices.filter(p => p > 10).map(p => p * 1.1).reduce((a, p) => a + p, 0);
console.log(taxed.toFixed(2));

// reduce to build an object: count word frequencies
const words = "the cat and the hat and the bat".split(" ");
const freq = words.reduce((acc, w) => { acc[w] = (acc[w] ?? 0) + 1; return acc; }, {});
console.log(freq);

// Nested loops: multiplication table
for (let r = 1; r <= 3; r++) {
  let row = "";
  for (let c = 1; c <= 5; c++) row += String(r * c).padStart(4);
  console.log(row);
}

// Closure-in-loop gotcha: `let` creates a fresh binding per iteration, `var` doesn't
const fnsVar = [], fnsLet = [];
for (var v = 0; v < 3; v++) fnsVar.push(() => v);
for (let l = 0; l < 3; l++) fnsLet.push(() => l);
console.log(fnsVar.map(f => f()), fnsLet.map(f => f())); // [3,3,3] [0,1,2]

// 3.4.1 / 3.4.2 Challenge: bubble sort, linear search, count vowels, primes
function bubbleSort(input) {
  const a = [...input];                      // don't mutate caller's array
  for (let end = a.length - 1; end > 0; end--) {
    let swapped = false;
    for (let j = 0; j < end; j++) {
      if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; swapped = true; }
    }
    if (!swapped) break;                     // already sorted
  }
  return a;
}
const countVowels = str => [...str.toLowerCase()].filter(ch => "aeiou".includes(ch)).length;
console.log(bubbleSort([5, 2, 9, 1, 5, 6]), countVowels("JavaScript Foundations"));

/* ============================================================================
 * 3.5 BREAK, CONTINUE, AND ADVANCED LOOP CONTROL
 * ============================================================================ */
section("3.5 Break, Continue, Advanced Loop Control");

// break — exit the loop immediately
for (const n of [3, 7, 12, 5, 20]) {
  if (n > 10) { console.log("first > 10:", n); break; }
}

// continue — skip the rest of this iteration
const odds = [];
for (let n = 1; n <= 10; n++) {
  if (n % 2 === 0) continue;
  odds.push(n);
}
console.log("odds:", odds);

// Labels — break/continue an OUTER loop from an inner one
outer: for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 3; c++) {
    if (c === 1) continue outer;            // jump to next r
    if (r === 2) break outer;               // leave both loops
    console.log(`r=${r} c=${c}`);
  }
}

// Search in a 2D array with a label
function findInMatrix(matrix, target) {
  let pos = null;
  search: for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === target) { pos = [r, c]; break search; }
    }
  }
  return pos;
}
console.log(findInMatrix([[1, 2], [3, 4]], 4)); // [1, 1]

// forEach can't break — use for...of, or some()/every() which stop early
[1, 2, 3, 4].some(n => { console.log("visit", n); return n === 2; }); // stops at 2

// "Loop forever until a condition" pattern
let tries = 0;
while (true) {
  tries++;
  if (tries === 4) break;
}
console.log("tries:", tries);

// 3.5.1 / 3.5.2 Challenge: primes up to N with break (trial division)
function primesUpTo(n) {
  const primes = [];
  for (let cand = 2; cand <= n; cand++) {
    let isPrime = true;
    for (let d = 2; d * d <= cand; d++) {
      if (cand % d === 0) { isPrime = false; break; } // stop at first divisor
    }
    if (isPrime) primes.push(cand);
  }
  return primes;
}
console.log(primesUpTo(30));

/* ============================================================================
 * MODULE 3 ASSIGNMENT: NUMBER GUESSING GAME
 * ============================================================================
 * Uses: random numbers, input + validation, while loop, if/else, break,
 *       continue, arrays (history), template strings.
 */
section("Module 3 Assignment: Number Guessing Game");

// Pure game logic (testable without input)
function checkGuess(secret, guess) {
  if (guess === secret) return "correct";
  return guess < secret ? "too low" : "too high";
}

// Automated demo: a "player" that uses binary search — always wins in <= 7 tries for 1..100
function simulateGuessingGame(secret, min = 1, max = 100) {
  let lo = min, hi = max;
  const history = [];
  while (lo <= hi) {
    const guess = Math.floor((lo + hi) / 2);
    const result = checkGuess(secret, guess);
    history.push(`${guess} (${result})`);
    if (result === "correct") break;
    if (result === "too low") lo = guess + 1;
    else hi = guess - 1;
  }
  return history;
}
console.log(simulateGuessingGame(randomInt(1, 100)).join(" -> "));

async function guessingGameInteractive(maxAttempts = 7) {
  const secret = randomInt(1, 100);
  const history = [];
  console.log(`I'm thinking of a number 1-100. You have ${maxAttempts} attempts.`);
  while (history.length < maxAttempts) {
    const raw = await ask(`Attempt ${history.length + 1}: `);
    if (raw === null) break;                  // input closed (Ctrl+D)
    const guess = parseNumber(raw);
    if (guess === null || !Number.isInteger(guess) || guess < 1 || guess > 100) {
      console.log("Please enter a whole number between 1 and 100.");
      continue;                               // invalid input doesn't cost an attempt
    }
    if (history.includes(guess)) { console.log("You already tried that!"); continue; }
    history.push(guess);
    const result = checkGuess(secret, guess);
    if (result === "correct") {
      console.log(`🎉 Correct! ${secret} in ${history.length} attempt(s).`);
      return;
    }
    console.log(`${result}. Guesses so far: ${history.join(", ")}`);
  }
  console.log(`Out of attempts. The number was ${secret}.`);
}

/* ============================================================================
 * 4.1 DECLARING AND CALLING FUNCTIONS
 * ============================================================================
 * Functions are first-class VALUES: store them in variables, pass them as
 * arguments, return them from other functions.
 */
section("4.1 Declaring and Calling Functions");

// (1) Function DECLARATION — hoisted: callable before its line
console.log(add(2, 3));
function add(m, n) {
  return m + n;
}

// (2) Function EXPRESSION — not hoisted (const is in TDZ until this line)
const multiply = function (m, n) {
  return m * n;
};

// (3) ARROW function — concise; no own `this`/`arguments`; can't be used with `new`
const square = n => n * n;                 // one param: parens optional; implicit return
const sumThree = (m, n, o) => m + n + o;
const makePoint = (px, py) => ({ x: px, y: py }); // returning an object literal: wrap in ()
const logAndDouble = n => {                // block body needs explicit return
  console.log("doubling", n);
  return n * 2;
};
console.log(multiply(3, 4), square(5), sumThree(1, 2, 3), makePoint(1, 2), logAndDouble(4));

// Functions as values / callbacks / higher-order functions
const applyTwice = (fn, val) => fn(fn(val));
console.log(applyTwice(square, 3));        // 81
const ops = { add, multiply, square };     // functions stored in an object
console.log(ops.add(1, 1));

// IIFE — Immediately Invoked Function Expression (old-school private scope)
(function () { console.log("IIFE ran"); })();

// Methods & `this` (quick version): regular functions get `this` from the CALLER
const counterObj = {
  count: 0,
  inc() { this.count++; return this; },    // method shorthand -> `this` = counterObj
};
counterObj.inc().inc();                    // chaining because inc returns this
console.log(counterObj.count);             // 2

/* ============================================================================
 * 4.2 PARAMETERS AND RETURN VALUES
 * ============================================================================ */
section("4.2 Parameters and Return Values");

// Missing args are `undefined`; extra args are ignored. No overloading in JS.
function show(m, n) { return `${m}, ${n}`; }
console.log(show(1), show(1, 2, 3));       // "1, undefined" "1, 2"

// Default parameters (applied when arg is undefined)
function greet(who = "stranger", punctuation = "!") {
  return `Hello, ${who}${punctuation}`;
}
console.log(greet(), greet("Mo"), greet("Mo", "?"));

// Rest parameters — variable number of args collected into a real array
function average(...values) {
  if (values.length === 0) return 0;
  return values.reduce((acc, val) => acc + val, 0) / values.length;
}
console.log(average(1, 2, 3, 4), average(...[10, 20])); // spread array into args

// "Named parameters" via object destructuring (+ defaults) — very common
function createUser({ username, role = "student", active = true } = {}) {
  return { username, role, active };
}
console.log(createUser({ username: "mo" }), createUser({ username: "admin", role: "admin" }));

// Return values: one value only; return an array/object for "multiple"
function minMax(list) {
  return { min: Math.min(...list), max: Math.max(...list) };
}
const { min, max } = minMax([4, 8, 1]);
console.log(min, max);
// No `return` (or bare `return;`) -> returns undefined
function noReturn() {}
console.log(noReturn());
// ASI gotcha: a newline right after `return` ends the statement!
function asiBug() {
  return              // <- returns undefined, the object below is dead code
  { ok: true };
}
console.log(asiBug());

// Pass-by-value... of references: primitives are copied, objects share the reference
function mutate(num, obj) { num = 100; obj.changed = true; }
const prim = 1, objArg = {};
mutate(prim, objArg);
console.log(prim, objArg);                 // 1 { changed: true }

// Pure function (no side effects, same input -> same output) — prefer these
const addTax = (amount, rate = 0.11) => +(amount * (1 + rate)).toFixed(2);
console.log(addTax(100));

/* ============================================================================
 * 4.3 REUSABLE CODE AND SCOPE
 * ============================================================================
 * Scope chain: block -> function -> module/script -> global.
 * Inner scopes can read outer variables; not vice versa (lexical scoping).
 */
section("4.3 Reusable Code and Scope");

const globalVar = "global";
function outerFn() {
  const outerVar = "outer";
  function innerFn() {
    const innerVar = "inner";
    return `${innerVar} sees ${outerVar} and ${globalVar}`;
  }
  return innerFn();
}
console.log(outerFn());

// Shadowing: inner declaration hides the outer one
const shadow = "outer";
{ const shadow = "inner"; console.log(shadow); } // "inner"
console.log(shadow);                              // "outer"

// CLOSURES: a function remembers the variables of the scope it was created in,
// even after that scope has returned. This gives you private state.
function makeCounter(start = 0) {
  let value = start;                     // private — not reachable from outside
  return {
    increment: () => ++value,
    decrement: () => --value,
    get: () => value,
  };
}
const c1 = makeCounter(), c2 = makeCounter(10);
c1.increment(); c1.increment(); c2.decrement();
console.log(c1.get(), c2.get());         // 2 9 — independent states

// Function factories (closures for reuse)
const multiplier = factor => n => n * factor;
const triple = multiplier(3);
console.log(triple(7));                  // 21

// Memoization — reusable caching wrapper built on a closure
function memoize(fn) {
  const cache = new Map();
  return function (arg) {
    if (cache.has(arg)) return cache.get(arg);
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}
const slowSquare = n => { for (let k = 0; k < 1e6; k++); return n * n; };
const fastSquare = memoize(slowSquare);
console.log(fastSquare(9), fastSquare(9)); // second call is cached

// DRY: write small, single-purpose functions and compose them
const compose = (...fns) => input => fns.reduceRight((acc, fn) => fn(acc), input);
const slugify = compose(
  str => str.replace(/[^a-z0-9]+/g, "-"),
  str => str.trim().toLowerCase()
);
console.log(slugify("  Hello World JS  ")); // "hello-world-js"

// Modules (reuse across files):
//   // math.js                         // main.js
//   export const add = (a,b) => a+b;    import { add } from "./math.js";
//   export default function sub() {}    import sub from "./math.js";
// Node CommonJS:  module.exports = { add };   const { add } = require("./math");

/* ============================================================================
 * 4.4 RECURSION
 * ============================================================================
 * A function that calls itself. Needs: (1) a BASE CASE that stops,
 * (2) a RECURSIVE CASE that moves toward the base case.
 * JS has no tail-call optimization in practice -> deep recursion (~10k frames)
 * throws "RangeError: Maximum call stack size exceeded".
 */
section("4.4 Recursion");

function factorial(n) {
  if (n <= 1) return 1;                  // base case
  return n * factorial(n - 1);           // recursive case
}
console.log(factorial(5), factorial(20)); // 120 2432902008176640000

// Naive Fibonacci is O(2^n); memoized is O(n)
function fib(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  return (memo[n] = fib(n - 1, memo) + fib(n - 2, memo));
}
console.log(fib(50));                     // 12586269025

const sumArray = list => (list.length === 0 ? 0 : list[0] + sumArray(list.slice(1)));
const power = (base, exp) => (exp === 0 ? 1 : base * power(base, exp - 1));
const reverseStr = str => (str === "" ? "" : reverseStr(str.slice(1)) + str[0]);
const isPalindrome = str => {
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (clean.length <= 1) return true;
  if (clean[0] !== clean.at(-1)) return false;
  return isPalindrome(clean.slice(1, -1));
};
console.log(sumArray([1, 2, 3, 4]), power(2, 10), reverseStr("hello"), isPalindrome("A man, a plan, a canal: Panama"));

// Where recursion really shines: nested / tree data
function flatten(list) {
  const out = [];
  for (const item of list) {
    if (Array.isArray(item)) out.push(...flatten(item)); // recurse into sub-arrays
    else out.push(item);
  }
  return out;
}
console.log(flatten([1, [2, [3, [4, 5]]], 6]));

const fileTree = {
  name: "root", children: [
    { name: "a.js", size: 10 },
    { name: "src", children: [{ name: "b.js", size: 20 }, { name: "c.js", size: 5 }] },
  ],
};
const totalSize = node => node.children ? node.children.reduce((acc, ch) => acc + totalSize(ch), 0) : node.size;
console.log("tree size:", totalSize(fileTree)); // 35

// Binary search (recursive) and Tower of Hanoi
function binarySearch(sorted, target, lo = 0, hi = sorted.length - 1) {
  if (lo > hi) return -1;
  const mid = Math.floor((lo + hi) / 2);
  if (sorted[mid] === target) return mid;
  return sorted[mid] < target
    ? binarySearch(sorted, target, mid + 1, hi)
    : binarySearch(sorted, target, lo, mid - 1);
}
function hanoi(n, from = "A", to = "C", via = "B", moves = []) {
  if (n === 0) return moves;
  hanoi(n - 1, from, via, to, moves);
  moves.push(`${from}->${to}`);
  hanoi(n - 1, via, to, from, moves);
  return moves;
}
console.log(binarySearch([1, 3, 5, 7, 9, 11], 7), hanoi(3).join(" "));

/* ============================================================================
 * MODULE 4 ASSIGNMENT: GRADE CALCULATOR
 * ============================================================================
 * Uses functions with defaults, validation, arrays of objects, reduce,
 * map/filter, sorting, switch/if, and formatted output.
 */
section("Module 4 Assignment: Grade Calculator");

const GRADE_SCALE = [
  { min: 90, letter: "A" },
  { min: 80, letter: "B" },
  { min: 70, letter: "C" },
  { min: 60, letter: "D" },
  { min: 0,  letter: "F" },
];

function isValidScore(score) {
  return typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 100;
}

function letterGrade(score, scale = GRADE_SCALE) {
  if (!isValidScore(score)) throw new RangeError(`Invalid score: ${score}`);
  return scale.find(g => score >= g.min).letter; // scale sorted high -> low
}

// Weighted average: [{ score, weight }] — weights don't need to sum to 1
function weightedAverage(items) {
  const totalWeight = items.reduce((acc, it) => acc + it.weight, 0);
  if (totalWeight === 0) return 0;
  return items.reduce((acc, it) => acc + it.score * it.weight, 0) / totalWeight;
}

function studentReport(student, weights = { homework: 0.3, midterm: 0.3, final: 0.4 }) {
  const parts = Object.entries(weights).map(([key, weight]) => ({ score: student[key], weight }));
  const avg = weightedAverage(parts);
  return { name: student.name, average: +avg.toFixed(2), grade: letterGrade(avg), passed: avg >= 60 };
}

function classSummary(students) {
  const reports = students.map(s => studentReport(s)).sort((m, n) => n.average - m.average);
  const averages = reports.map(r => r.average);
  const distribution = reports.reduce((acc, r) => ({ ...acc, [r.grade]: (acc[r.grade] ?? 0) + 1 }), {});
  return {
    reports,
    classAverage: +(averages.reduce((acc, v) => acc + v, 0) / averages.length).toFixed(2),
    highest: reports[0],
    lowest: reports.at(-1),
    passRate: `${Math.round((reports.filter(r => r.passed).length / reports.length) * 100)}%`,
    distribution,
  };
}

const students = [
  { name: "Mohamad", homework: 95, midterm: 88, final: 92 },
  { name: "Sara",    homework: 78, midterm: 82, final: 74 },
  { name: "Omar",    homework: 60, midterm: 55, final: 58 },
  { name: "Lina",    homework: 85, midterm: 91, final: 79 },
];
const summary = classSummary(students);
console.table(summary.reports);
console.log("Class average:", summary.classAverage, "| Pass rate:", summary.passRate);
console.log("Top:", summary.highest.name, "| Lowest:", summary.lowest.name, "| Distribution:", summary.distribution);

// Error handling (try/catch) for bad input
try {
  letterGrade(150);
} catch (err) {
  console.log(`${err.name}: ${err.message}`);
} finally {
  console.log("finally always runs");
}

async function gradeCalculatorInteractive() {
  const scores = [];
  console.log("Enter scores (0-100). Empty line to finish.");
  while (true) {
    const raw = await ask(`Score #${scores.length + 1}: `);
    if (!raw?.trim()) break;               // empty line or input closed
    const n = parseNumber(raw);
    if (!isValidScore(n)) { console.log("Invalid, try again."); continue; }
    scores.push(n);
  }
  if (scores.length === 0) return console.log("No scores entered.");
  const avg = scores.reduce((acc, v) => acc + v, 0) / scores.length;
  console.log(`Average: ${avg.toFixed(2)} -> ${letterGrade(avg)} | max ${Math.max(...scores)} | min ${Math.min(...scores)}`);
}

/* ============================================================================
 * X. BONUS: OBJECTS IN 30 SECONDS + GOTCHAS CHEAT SHEET
 * ============================================================================ */
section("X. Objects + Gotchas");

const book = {
  title: "Eloquent JavaScript",
  "page count": 472,                  // keys with spaces need quotes + bracket access
  tags: ["js", "programming"],
  describe() { return `${this.title} (${this["page count"]} pages)`; },
};
book.year = 2024;                     // add property
delete book.tags;                     // remove property
const dynamicKey = "title";
console.log(book[dynamicKey], "year" in book, book.describe());
const clone = { ...book, title: "Copy" };   // spread copy + override
console.log(Object.keys(clone));

// Class syntax (sugar over prototypes) — familiar if you know Java
class Animal {
  #secret = "private field";          // # = truly private
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound`; }
  static create(name) { return new Animal(name); }
}
class Dog extends Animal {
  speak() { return `${super.speak()} — woof`; }
}
console.log(new Dog("Rex").speak());

/*
 * GOTCHAS CHEAT SHEET (coming from Java / C / Python)
 *  - Use === / !==, never == / != (coercion surprises).
 *  - const/let, never var. const doesn't make objects immutable.
 *  - Only one number type (double). 7/2 = 3.5; use Math.trunc for int division.
 *  - 0.1 + 0.2 !== 0.3. For money use integer cents or BigInt.
 *  - NaN !== NaN -> use Number.isNaN().
 *  - [] and {} and "0" are TRUTHY. Empty array check: arr.length === 0.
 *  - typeof null === "object"; typeof [] === "object" -> Array.isArray().
 *  - arr.sort() sorts as strings unless you pass (a, b) => a - b.
 *  - Out-of-range index returns undefined, no exception.
 *  - Arrays/objects are references: copy with [...arr] / {...obj} / structuredClone.
 *  - `||` replaces 0 and ""; use `??` for "only if null/undefined".
 *  - Never put a newline right after `return`.
 *  - for...in = object keys; for...of = iterable values.
 *  - forEach can't break; use for...of / some / every.
 *  - Missing function args are undefined; no overloading.
 *  - Arrow functions don't have their own `this`; don't use them as object methods.
 *  - Strings are immutable; all string methods return new strings.
 */

/* ============================================================================
 * RUN THE INTERACTIVE ASSIGNMENTS (only with --interactive)
 * ============================================================================ */
async function main() {
  if (!process.argv.includes("--interactive")) {
    section("Done. Run with --interactive to play the assignments.");
    return;
  }
  section("Interactive: Temperature Converter");
  await temperatureConverterInteractive();
  section("Interactive: Number Guessing Game");
  await guessingGameInteractive();
  section("Interactive: Grade Calculator");
  await gradeCalculatorInteractive();
  rl?.close();
}
main();
