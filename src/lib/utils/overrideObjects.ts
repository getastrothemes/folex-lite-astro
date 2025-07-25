export default function overrideObjects(target: any, source: any): any {
  // Create a new object by shallow copying the target
  const result = structuredClone(target);

  // Iterate over all properties in the source object
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) && // Ensure it's not an array
      result[key] &&
      typeof result[key] === "object"
    ) {
      // Recursively merge nested objects
      result[key] = overrideObjects(result[key], source[key]);
    } else {
      // Otherwise, just overwrite or add the value in the result object
      result[key] = source[key];
    }
  }

  return result;
}
