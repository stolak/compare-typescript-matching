import { extractNarration } from "../utils/extractNarration.js";
import { getEmbedding, cosineSimilarity } from "./embeddings.service.js";
import type {
  BankRecord,
  MatchResult,
  MatchingReport,
} from "../types/index.js";

export async function matchRecords(
  record1: BankRecord[],
  record2: BankRecord[]
): Promise<MatchingReport> {
  // Preprocess and embed Record2
  const embeddings2 = [];
  for (let i = 0; i < record2.length; i++) {
    const r2 = record2[i];
    if (!r2) continue;
    const narration2 = extractNarration(r2.details);
    embeddings2.push({
      id: r2.itemid,
      index: i,
      amount: r2.amount,
      emb: await getEmbedding(narration2),
      record: r2,
    });
  }

  const matches: MatchResult[] = [];
  const matchedRecord2Indices = new Set<number>();

  for (const r1 of record1) {
    const narration1 = extractNarration(r1.details);
    const emb1 = await getEmbedding(narration1);

    let bestMatch: {
      id: string;
      index: number;
      score: number;
      record: BankRecord;
    } | null = null;

    for (const r2 of embeddings2) {
      // Skip if this record2 has already been matched
      if (matchedRecord2Indices.has(r2.index)) continue;

      if (r1.amount !== r2.amount) continue; // strict rule

      const sim = cosineSimilarity(emb1, r2.emb);

      if (sim > (bestMatch?.score ?? 0) && sim >= 0.25) {
        const record = r2.record;
        if (record) {
          bestMatch = { id: r2.id, index: r2.index, score: sim, record };
        }
      }
    }

    if (bestMatch) {
      matches.push({
        record1Id: r1.itemid,
        record2Id: bestMatch.id,
        score: bestMatch.score,
        record1: r1,
        record2: bestMatch.record,
      });
      matchedRecord2Indices.add(bestMatch.index);
    }
  }

  // Find unmatched records
  const matchedRecord1Ids = new Set(matches.map((m) => m.record1Id));
  const unmatchedInRecord1 = record1.filter(
    (r) => !matchedRecord1Ids.has(r.itemid)
  );
  const unmatchedInRecord2 = record2.filter(
    (_, index) => !matchedRecord2Indices.has(index)
  );

  return {
    matched: matches,
    unmatchedInRecord1,
    unmatchedInRecord2,
  };
}

