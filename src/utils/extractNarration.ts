export function extractNarration(text: string): string {
  if (!text) return "";

  text = text.replace(/\s+/g, " ").trim();

  // Extract after "Narration:"
  let idx = text.toLowerCase().indexOf("narration:");
  if (idx !== -1) {
    text = text.substring(idx + "narration:".length);
  }

  // Remove useless trailing info
  text = text.replace(/ref.*/i, "");
  text = text.replace(/debits.*/i, "");
  text = text.replace(/credits.*/i, "");
  text = text.replace(/balance.*/i, "");

  return text.trim();
}

