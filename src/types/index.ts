export interface BankRecord {
  itemid: string;
  details: string;
  amount: number;
}

export interface MatchResult {
  record1Id: string;
  record2Id: string;
  score: number;
  record1: BankRecord;
  record2: BankRecord;
}

export interface MatchingReport {
  matched: MatchResult[];
  unmatchedInRecord1: BankRecord[];
  unmatchedInRecord2: BankRecord[];
}

