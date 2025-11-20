// import { matchRecords } from "./matchRecords.js";
import { matchRecords } from "./matcher.js";

const record1 = [
  {
    itemid: "ae628341-e022-4d18-9d7b-a46d140a55e5",
    details:
      "TRF FRM RCCG HOUSE OF OBEDEDOM PARISH II TO AKINBOBOLA STEPHEN OLAWOLE AT GTB - GTBank Plc Ref/Cheque No.: PSM00068676151167501249 Debits: 106,000.00",
    amount: 106000,
  },
  {
    itemid: "de96a753-f582-4116-9691-450a571c6248",
    details:
      "GABRIEL SAMUEL/App To Access Bank RCCG HOUSE OF OBEDEDOM PARISH II Ref/Cheque No.: 000003240604164527003146 Credits: 17,000.00",
    amount: 17000,
  },

  {
    itemid: "de96a753-f582-4116-9691-450a571c624v",
    details:
      "Idowum Gabriel/App To Access Bank RCCG HOUSE OF OBEDEDOM PARISH II Ref/Cheque No.: 000003240604164527003146 Credits: 1,000.00",
    amount: 1000,
  },
];

const record2 = [
  {
    itemid: "29e2a7c0-1028-4432-b51e-f585b60ad0ee",
    details: "Payment received from GABRIEL SAMUEL Credits: 17,000.00",
    amount: 17000,
  },
  {
    itemid: "26cb0a06-6588-4c07-a8bb-79b6ae7f2654",
    details: "Impress payable TO AKINBOBOLA STEPHEN OLAWOLE Debits: 106,000.00",
    amount: 106000,
  },
  {
    itemid: "26cb0a06-6588-4c07-a8bb-79b6ae7f2654",
    details: "Impress payable TO AKINBOBOLA STEPHEN OLAWOLE Debits: 1,000.00",
    amount: 1000,
  },
  {
    itemid: "26cb0a06-6588-4c07-a8bb-79b6ae7f2654",
    details: "Impress payable TO AKINBOBOLA STEPHEN OLAWOLE Debits: 23,000.00",
    amount: 23000,
  },
];

async function main() {
  const report = await matchRecords(record1, record2);

  // Report 1: Matched records
  console.log("\n" + "=".repeat(80));
  console.log("REPORT 1: MATCHED RECORDS");
  console.log("=".repeat(80));
  if (report.matched.length === 0) {
    console.log("No matches found.");
  } else {
    report.matched.forEach((match, index) => {
      console.log(`\nMatch ${index + 1}:`);
      console.log(`  Record1 ID: ${match.record1Id}`);
      console.log(`  Record2 ID: ${match.record2Id}`);
      console.log(`  Similarity Score: ${match.score.toFixed(4)}`);
      console.log(`  Amount: ${match.record1.amount.toLocaleString()}`);
      console.log(
        `  Record1 Details: ${match.record1.details.substring(0, 80)}...`
      );
      console.log(
        `  Record2 Details: ${match.record2.details.substring(0, 80)}...`
      );
    });
  }

  // Report 2: Unmatched records from Record1
  console.log("\n" + "=".repeat(80));
  console.log("REPORT 2: UNMATCHED RECORDS FROM RECORD1");
  console.log("=".repeat(80));
  if (report.unmatchedInRecord1.length === 0) {
    console.log("All records from Record1 were matched.");
  } else {
    report.unmatchedInRecord1.forEach((record, index) => {
      console.log(`\nUnmatched Record ${index + 1}:`);
      console.log(`  ID: ${record.itemid}`);
      console.log(`  Amount: ${record.amount.toLocaleString()}`);
      console.log(`  Details: ${record.details}`);
    });
  }

  // Report 3: Unmatched records from Record2
  console.log("\n" + "=".repeat(80));
  console.log("REPORT 3: UNMATCHED RECORDS FROM RECORD2");
  console.log("=".repeat(80));
  if (report.unmatchedInRecord2.length === 0) {
    console.log("All records from Record2 were matched.");
  } else {
    report.unmatchedInRecord2.forEach((record, index) => {
      console.log(`\nUnmatched Record ${index + 1}:`);
      console.log(`  ID: ${record.itemid}`);
      console.log(`  Amount: ${record.amount.toLocaleString()}`);
      console.log(`  Details: ${record.details}`);
    });
  }

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log("SUMMARY");
  console.log("=".repeat(80));
  console.log(`Total Record1 entries: ${record1.length}`);
  console.log(`Total Record2 entries: ${record2.length}`);
  console.log(`Matched: ${report.matched.length}`);
  console.log(`Unmatched in Record1: ${report.unmatchedInRecord1.length}`);
  console.log(`Unmatched in Record2: ${report.unmatchedInRecord2.length}`);
  console.log("=".repeat(80) + "\n");
}

main().catch(console.error);
