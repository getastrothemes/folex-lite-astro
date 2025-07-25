export default function removeEmptyKeys(obj: any) {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    // Remove if value is empty string, empty array, or empty object
    if (
      value === "" ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "object" &&
        value !== null &&
        typeof value === "undefined" &&
        value &&
        Object.keys(value).length === 0)
    ) {
      delete obj[key];
    }
    // Recursively check nested objects
    else if (
      typeof value === "object" &&
      typeof value !== "undefined" &&
      value !== null &&
      value !== undefined
    ) {
      removeEmptyKeys(value);

      // Delete the key if the nested object becomes empty after cleanup
      if (Object.keys(value).length === 0) {
        delete obj[key];
      }
    }
  });

  return obj;
}
