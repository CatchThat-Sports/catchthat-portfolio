/** Add entries here as they are ready to publish. The public journal filters drafts. */
export type JournalEntry = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  excerpt: string;
  category: "Development" | "Design" | "Mechanics" | "Release";
  published: boolean;
  paragraphs: string[];
};

export const journalEntries: JournalEntry[] = [];
export const publishedEntries = journalEntries.filter((entry) => entry.published).sort((a, b) => b.date.localeCompare(a.date));
