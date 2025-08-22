
import React from 'react';

// Convert any value into a safe string
function toSafeString(val: unknown): string {
  if (val == null) return '';
  // primitives
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }
  // React element: flatten it to the text of its children or a placeholder
  if (React.isValidElement(val)) {
    const element = val as React.ReactElement<any>;
    const child = element.props?.children;
    if (typeof child === 'string' || typeof child === 'number') {
      return String(child);
    }
    // fallback if children aren't simple primitives
    return `[react-element]`;
  }
  // Array: convert each item and join
  if (Array.isArray(val)) {
    return val.map((item) => toSafeString(item)).join(', ');
  }
  // Object: stringify (catch circular refs)
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

// Recursively sanitise an object/array by converting all leaf values to strings
function sanitize<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => sanitize(item)) as unknown as T;
  }
  if (input && typeof input === 'object' && !React.isValidElement(input)) {
    const result: any = {};
    for (const key in input) {
      result[key] = sanitize((input as any)[key]);
    }
    return result;
  }
  // any non-object (including React elements) to safe string
  return toSafeString(input) as unknown as T;
}

export { toSafeString, sanitize };
