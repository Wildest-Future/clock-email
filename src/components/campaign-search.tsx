"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "most-clocks", label: "Most clocks" },
  { value: "most-active", label: "Most active" },
];

interface CampaignSearchProps {
  currentSort: string;
  currentQuery: string;
}

export function CampaignSearch({ currentSort, currentQuery }: CampaignSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(currentQuery);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`/campaigns?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q: query.trim() || null });
  }

  return (
    <div className="mt-6 flex flex-col sm:flex-row gap-3">
      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search campaigns..."
          className="flex-1 bg-paper border border-sand-300 rounded-lg px-4 py-2 text-sm text-ink placeholder:text-warmgray focus:outline-none focus:border-velvet-300 focus:ring-1 focus:ring-velvet-300 transition-colors"
        />
        <button
          type="submit"
          className="bg-velvet-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-velvet-600 transition-colors"
        >
          Search
        </button>
        {currentQuery && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              updateParams({ q: null });
            }}
            className="text-sm text-warmgray hover:text-oxide transition-colors px-2"
          >
            Clear
          </button>
        )}
      </form>

      <select
        value={currentSort}
        onChange={(e) => updateParams({ sort: e.target.value === "newest" ? null : e.target.value })}
        className="bg-paper border border-sand-300 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-velvet-300 focus:ring-1 focus:ring-velvet-300 transition-colors"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
