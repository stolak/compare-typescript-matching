import { pipeline } from "@xenova/transformers";

let embedder: any = null;

export async function loadEmbedder() {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedder;
}

export async function getEmbedding(text: string): Promise<number[]> {
  const extractor = await loadEmbedder();

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true, // unit vector
  });

  return Array.from(output.data);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    magA = 0,
    magB = 0;

  for (let i = 0; i < a.length; i++) {
    const aVal = a[i] ?? 0;
    const bVal = b[i] ?? 0;
    dot += aVal * bVal;
    magA += aVal * aVal;
    magB += bVal * bVal;
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
