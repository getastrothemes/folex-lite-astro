const cache = new Map<string, string>();

export default function uniqueIdGenerator(str: string): string {
  // Check if the result for this input is already cached
  if (cache.has(str)) {
    return cache.get(str)!;
  }

  // Randomize the sentence
  const words = str.split(" ");
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  const randomizedSentence = words.join(" ");

  // Generate a unique, short ID (use a hash function like a simple checksum)
  let hash = 0;
  for (let i = 0; i < randomizedSentence.length; i++) {
    hash = (hash * 31 + randomizedSentence.charCodeAt(i)) % 1000000; // Limit to 6 digits
  }
  const uniqueId = hash.toString(36); // Convert to base36 for compactness

  // Cache the result
  cache.set(str, uniqueId);

  // Return the randomized sentence and unique ID
  return uniqueId;
}
