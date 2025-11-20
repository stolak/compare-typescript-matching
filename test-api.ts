/**
 * Test script for the matching API
 * Run this after starting the server with: npm run server
 */

const testData = {
  record1: [
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
  ],
  record2: [
    {
      itemid: "29e2a7c0-1028-4432-b51e-f585b60ad0ee",
      details: "Payment received from GABRIEL SAMUEL Credits: 17,000.00",
      amount: 17000,
    },
    {
      itemid: "26cb0a06-6588-4c07-a8bb-79b6ae7f2654",
      details:
        "Impress payable TO AKINBOBOLA STEPHEN OLAWOLE Debits: 106,000.00",
      amount: 106000,
    },
    {
      itemid: "26cb0a06-6588-4c07-a8bb-79b6ae7f2654",
      details: "Impress payable TO AKINBOBOLA STEPHEN OLAWOLE Debits: 1,000.00",
      amount: 1000,
    },
    {
      itemid: "26cb0a06-6588-4c07-a8bb-79b6ae7f2654",
      details:
        "Impress payable TO AKINBOBOLA STEPHEN OLAWOLE Debits: 23,000.00",
      amount: 23000,
    },
  ],
};

async function testAPI() {
  try {
    const response = await fetch("http://localhost:3005/api/match", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Body:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

testAPI();
