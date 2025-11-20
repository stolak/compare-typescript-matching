import natural from "natural";

/**
 * Preprocess text: lowercase, remove punctuation, trim
 */
export function preprocess(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

/**
 * Build TF-IDF vectors for multiple documents
 */
export function buildVectors(documents: string[]) {
  const tfidf = new natural.TfIdf();
  documents.forEach((doc) => tfidf.addDocument(preprocess(doc)));
  const vectors = documents.map((_, idx) =>
    tfidf.listTerms(idx).reduce((acc: Record<string, number>, item) => {
      acc[item.term] = item.tfidf;
      return acc;
    }, {})
  );
  return { tfidf, vectors };
}

/**
 * Cosine similarity between two vectors
 */
export function cosineSimilarity(
  vec1: Record<string, number>,
  vec2: Record<string, number>
): number {
  const allKeys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
  let dot = 0,
    mag1 = 0,
    mag2 = 0;

  allKeys.forEach((key) => {
    const v1 = vec1[key] || 0;
    const v2 = vec2[key] || 0;
    dot += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  });

  return mag1 === 0 || mag2 === 0
    ? 0
    : dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

/**
 * Check if narrations are similar
 */
export function isSimilar(
  vec1: Record<string, number>,
  vec2: Record<string, number>,
  threshold = 0.45
): boolean {
  return cosineSimilarity(vec1, vec2) >= threshold;
}
