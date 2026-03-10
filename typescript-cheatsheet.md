# TypeScript Cheat Sheet

This cheat sheet provides examples of types, interfaces, and generics in TypeScript.

## Basic Types

```typescript
// Primitive types
let str: string = "Hello, world!";
let num: number = 42;
let bool: boolean = true;
let undef: undefined = undefined;
let nul: null = null;

// Any type (use sparingly)
let anything: any = "could be anything";
```

## Arrays and Tuples

```typescript
// Arrays
let numbers: number[] = [1, 2, 3, 4, 5];
let strings: Array<string> = ["a", "b", "c"];

// Tuples
let tuple: [string, number] = ["hello", 10];
let mixedTuple: [string, number, boolean] = ["world", 20, true];
```

## Objects

```typescript
// Object type
let person: { name: string; age: number } = {
  name: "John Doe",
  age: 30
};

// Optional properties
let optionalPerson: { name: string; age?: number } = {
  name: "Jane Doe"
};
```

## Interfaces

```typescript
interface Person {
  name: string;
  age: number;
  email?: string; // Optional property
}

let john: Person = {
  name: "John",
  age: 30,
  email: "john@example.com"
};

// Interface extending another
interface Employee extends Person {
  department: string;
}

let employee: Employee = {
  name: "Jane",
  age: 25,
  department: "Engineering"
};
```

## Generics

```typescript
// Generic function
function identity<T>(arg: T): T {
  return arg;
}

let result1 = identity<string>("Hello");
let result2 = identity<number>(42);

// Generic interface
interface Container<T> {
  value: T;
}

let stringContainer: Container<string> = { value: "Hello" };
let numberContainer: Container<number> = { value: 123 };

// Generic class
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }
}

let stringStack = new Stack<string>();
stringStack.push("Hello");
stringStack.push("World");
```

## Common Mistakes and Fixes

Here are 10 intentionally broken TypeScript snippets, followed by their fixes:

1. **Broken:** `let x = "hello"; x = 5;`  
   **Fix:** `let x: string | number = "hello"; x = 5;`

2. **Broken:** `function add(a, b) { return a + b; }`  
   **Fix:** `function add(a: number, b: number): number { return a + b; }`

3. **Broken:** `let arr = [1, "two", true];`  
   **Fix:** `let arr: (number | string | boolean)[] = [1, "two", true];`

4. **Broken:** 
   ```typescript
   interface Person { name: string; }
   let p: Person = { name: "John", age: 30 };
   ```
   **Fix:** 
   ```typescript
   interface Person { name: string; age?: number; }
   let p: Person = { name: "John", age: 30 };
   ```

5. **Broken:** `let tuple: [string, number] = ["hello", "world"];`  
   **Fix:** `let tuple: [string, number] = ["hello", 10];`

6. **Broken:** 
   ```typescript
   function identity(arg) { return arg; }
   let result = identity<string>("test");
   ```
   **Fix:** 
   ```typescript
   function identity<T>(arg: T): T { return arg; }
   let result = identity<string>("test");
   ```

7. **Broken:** `let obj = { name: "John" }; obj.age = 30;`  
   **Fix:** `let obj: { name: string; age?: number } = { name: "John" }; obj.age = 30;`

8. **Broken:** 
   ```typescript
   interface Animal { name: string; }
   let dog: Animal = { name: "Buddy", breed: "Labrador" };
   ```
   **Fix:** 
   ```typescript
   interface Animal { name: string; breed?: string; }
   let dog: Animal = { name: "Buddy", breed: "Labrador" };
   ```

9. **Broken:** `let num: number = "42";`  
   **Fix:** `let num: number = 42;`

10. **Broken:** 
    ```typescript
    class Stack<T> {
      private items: T[] = [];
      push(item) { this.items.push(item); }
    }
    ```
    **Fix:** 
    ```typescript
    class Stack<T> {
      private items: T[] = [];
      push(item: T): void { this.items.push(item); }
    }
    ```

## Additional Instructions

• Read every line. Type each example by hand in a scratch file
• Prompt Gemini: "Quiz me on TypeScript types"
• Fix 10 intentionally broken TS snippets (ask AI to generate them)

## Tailwind CSS Classes Journal

Here are 20 Tailwind CSS classes I now understand:

1. `min-h-screen` - Sets minimum height to 100vh
2. `flex` - Applies flexbox layout
3. `flex-col` - Sets flex direction to column
4. `items-center` - Centers items vertically in flex container
5. `justify-center` - Centers items horizontally in flex container
6. `bg-gray-100` - Sets background color to light gray
7. `p-4` - Adds padding on all sides
8. `max-w-sm` - Sets maximum width to small breakpoint
9. `w-full` - Sets width to 100%
10. `bg-white` - Sets background color to white
11. `rounded-lg` - Applies large border radius
12. `shadow-lg` - Applies large box shadow
13. `overflow-hidden` - Hides overflow content
14. `md:flex` - Applies flex on medium screens and up
15. `md:max-w-2xl` - Sets max width on medium screens
16. `md:flex-shrink-0` - Prevents shrinking on medium screens
17. `h-48` - Sets height to 12rem
18. `object-cover` - Scales image to cover container
19. `md:h-full` - Sets height to 100% on medium screens
20. `md:w-48` - Sets width to 12rem on medium screens