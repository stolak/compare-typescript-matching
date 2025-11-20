import { preprocess, buildVectors, isSimilar } from "./vectorizer.js";

interface RecordItem {
  itemid: string;
  details: string;
  amount: number;
}

/**
 * Match Record1 with Record2 efficiently
 */
export function matchRecords(
  record1: RecordItem[],
  record2: RecordItem[]
): void {
  // Precompute vectors for Record2
  const { vectors: record2Vectors } = buildVectors(
    record2.map((r) => r.details)
  );

  for (let i = 0; i < record1.length; i++) {
    const r1 = record1[i];
    if (!r1) continue;

    const r1Vec = buildVectors([r1.details]).vectors[0];
    if (!r1Vec) continue;

    let matchId = "0";

    for (let j = 0; j < record2.length; j++) {
      const r2 = record2[j];
      if (!r2) continue;

      const r2Vec = record2Vectors[j];
      if (!r2Vec) continue;

      if (r1.amount === r2.amount && isSimilar(r1Vec, r2Vec)) {
        matchId = r2.itemid;
        break; // stop at first match
      }
    }

    console.log(
      `Record1 itemid: ${r1.itemid} matches Record2 itemid: ${matchId}`
    );
  }
}
