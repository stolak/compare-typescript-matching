// export interface BankRecord {
//   itemid: string;
//   details: string;
//   amount: number;
// }

export interface BankRecord1 {
  itemid: string;
  details: string;
  amount: number;
  date: string;
}

export interface BankRecord2 {
  itemid: string;
  details: string;
  amount: number;
  date: string;
  transactionType: string;
}

export interface MatchResult {
  record1Id: string;
  record2Id: string;
  score: number;
  record1: BankRecord1;
  record2: BankRecord2;
}

export interface MatchingReport {
  matched: MatchResult[];
  unmatchedInRecord1: BankRecord1[];
  unmatchedInRecord2: BankRecord2[];
}
