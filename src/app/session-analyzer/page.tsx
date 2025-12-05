"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SessionPrompt = {
  id: number;
  text: string;
  type: string;
  growth: number;
  dependency: number;
};

const SESSION_DAILY_LIMIT = 5;
const SESSION_USAGE_KEY = "ai-mind-playground-session-usage";

export default function SessionAnalyzerPage() {
  const [rawText, setRawText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prompts, setPrompts] = useState<SessionPrompt[]>([]);
  const [overallGrowth, setOverallGrowth] = useState<number | null>(null);
  const [overallDependency, setOverallDependency] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [remainingToday, setRemainingToday] = useState<number | null>(null);

  // ----- daily limit helpers -----

  const initDailyUsage = () => {
    if (typeof window === "undefined") return;

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const raw = localStorage.getItem(SESSION_USAGE_KEY);

    if (!raw) {
      localStorage.setItem(
        SESSION_USAGE_KEY,
        JSON.stringify({ date: today, count: 0 })
      );
      setRemainingToday(SESSION_DAILY_LIMIT);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { date: string; count: number };

      if (parsed.date === today) {
        const remaining = Math.max(
          SESSION_DAILY_LIMIT - (parsed.count || 0),
          0
        );
        setRemainingToday(remaining);
      } else {
        // New day -> reset
        localStorage.setItem(
          SESSION_USAGE_KEY,
          JSON.stringify({ date: today, count: 0 })
        );
        setRemainingToday(SESSION_DAILY_LIMIT);
      }
    } catch {
      // corrupted -> reset
      localStorage.setItem(
        SESSION_USAGE_KEY,
        JSON.stringify({ date: today, count: 0 })
      );
      setRemainingToday(SESSION_DAILY_LIMIT);
    }
  };

  const incrementUsage = () => {
    if (typeof window === "undefined") return;

    const today = new Date().toISOString().slice(0, 10);
    let date = today;
    let count = 0;

    const raw = localStorage.getItem(SESSION_USAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { date: string; count: number };
        date = parsed.date;
        count = parsed.count || 0;
      } catch {
        // ignore, will reset below
      }
    }

    if (date !== today) {
      date = today;
      count = 0;
    }

    count += 1;

    localStorage.setItem(
      SESSION_USAGE_KEY,
      JSON.stringify({ date, count })
    );

    const remaining = Math.max(SESSION_DAILY_LIMIT - count, 0);
    setRemainingToday(remaining);
  };

  useEffect(() => {
    initDailyUsage();
  }, []);

  const handleAnalyzeSession = () => {
    const text = rawText.trim();

    if (!text) {
      alert("Paste some conversation or prompts first.");
      return;
    }

    if (remainingToday !== null && remainingToday <= 0) {
      alert(
        `Daily limit reached. You can analyze ${SESSION_DAILY_LIMIT} sessions per day. Please come back tomorrow.`
      );
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length === 0) {
        setError("No valid lines found. Paste at least one prompt.");
        setPrompts([]);
        setOverallGrowth(null);
        setOverallDependency(null);
        return;
      }

      const analyzed: SessionPrompt[] = [];

      for (const line of lines) {
        const lower = line.toLowerCase();

        let learning = 0;
        let delegation = 0;
        let creation = 0;
        let trivial = 0;

        if (
          lower.includes("explain") ||
          lower.includes("why") ||
          lower.includes("how does") ||
          lower.includes("teach me") ||
          lower.includes("help me understand")
        ) {
          learning += 1;
        }

        if (
          lower.includes("write full") ||
          lower.includes("write an essay") ||
          lower.includes("do this for me") ||
          lower.includes("generate complete") ||
          lower.includes("solve this for me")
        ) {
          delegation += 1;
        }

        if (
          lower.includes("improve my") ||
          lower.includes("review my") ||
          lower.includes("refactor") ||
          lower.includes("critique") ||
          lower.includes("polish")
        ) {
          creation += 1;
        }

        if (lower.split(" ").length <= 4) {
          trivial += 1;
        }

        let type = "Mixed";
        const maxVal = Math.max(learning, delegation, creation, trivial);

        if (maxVal === learning && learning > 0) type = "Learning";
        else if (maxVal === delegation && delegation > 0) type = "Delegation";
        else if (maxVal === creation && creation > 0) type = "Creation";
        else if (maxVal === trivial && trivial > 0) type = "Trivial";

        let growth = 50;
        let dependency = 50;

        if (type === "Learning") {
          growth = 85;
          dependency = 20;
        } else if (type === "Creation") {
          growth = 75;
          dependency = 35;
        } else if (type === "Delegation") {
          growth = 35;
          dependency = 80;
        } else if (type === "Trivial") {
          growth = 20;
          dependency = 60;
        }

        const wordCount = lower.split(/\s+/).length;
        if (wordCount > 20) {
          growth += 5;
          dependency -= 5;
        } else if (wordCount < 6) {
          growth -= 5;
          dependency += 5;
        }

        growth = Math.max(0, Math.min(100, growth));
        dependency = Math.max(0, Math.min(100, dependency));

        analyzed.push({
          id: Date.now() + Math.random(),
          text: line,
          type,
          growth,
          dependency,
        });
      }

      setPrompts(analyzed);

      const totalGrowth = analyzed.reduce((sum, p) => sum + p.growth, 0);
      const totalDependency = analyzed.reduce(
        (sum, p) => sum + p.dependency,
        0
      );

      setOverallGrowth(Math.round(totalGrowth / analyzed.length));
      setOverallDependency(Math.round(totalDependency / analyzed.length));

      // count one session analysis
      incrementUsage();
    } catch (err) {
      console.error(err);
      setError("Something went wrong while analyzing the session.");
      setPrompts([]);
      setOverallGrowth(null);
      setOverallDependency(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalPrompts = prompts.length;
  const typeCounts = prompts.reduce(
    (acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const isLimitReached =
    remainingToday !== null && remainingToday <= 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Top bar with nav */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Session Analyzer
            </h1>
            <p className="text-sm md:text-base text-slate-400">
              Paste a set of prompts or conversation from any LLM and get a
              session-level growth vs dependency report.
            </p>
          </div>
          <nav className="flex flex-col items-end gap-1 text-xs md:text-sm">
            <div className="flex gap-2">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500"
              >
                Playground
              </Link>
              <span className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-600 text-slate-100">
                Session Analyzer
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Daily limit: {SESSION_DAILY_LIMIT} analyses •{" "}
              {remainingToday !== null
                ? `${Math.max(remainingToday, 0)} remaining today`
                : "Loading..."}
            </p>
          </nav>
        </div>

        {/* Input area */}
        <section className="space-y-3">
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Paste Your Prompts / Conversation
          </label>
          <textarea
            className="w-full h-56 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm md:text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 resize-none"
            placeholder={`Example:\nExplain overfitting in machine learning.\nWrite full essay on AI ethics.\nImprove my paragraph about gradient descent...`}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <button
            onClick={handleAnalyzeSession}
            disabled={isAnalyzing || isLimitReached}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-500 hover:bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLimitReached
              ? "Daily Limit Reached"
              : isAnalyzing
              ? "Analyzing Session..."
              : "Analyze Session"}
          </button>
          {error && (
            <p className="text-sm text-red-400 mt-1">{error}</p>
          )}
        </section>

        {/* Summary */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Session Summary</h2>
          {overallGrowth === null || overallDependency === null ? (
            <p className="text-sm text-slate-500">
              No session analyzed yet. Paste prompts and click{" "}
              <span className="font-medium text-slate-300">
                Analyze Session
              </span>
              .
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Total Prompts
                </p>
                <p className="text-2xl font-semibold">{totalPrompts}</p>
              </div>
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Avg Brain Growth Score
                </p>
                <p className="text-2xl font-semibold">
                  {overallGrowth}/100
                </p>
              </div>
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Avg Dependency Score
                </p>
                <p className="text-2xl font-semibold">
                  {overallDependency}/100
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Type breakdown */}
        {prompts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Prompt Type Breakdown</h2>
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              {Object.entries(typeCounts).map(([type, count]) => {
                const percent = Math.round((count / totalPrompts) * 100);
                return (
                  <div
                    key={type}
                    className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                  >
                    <p className="font-medium">{type}</p>
                    <p className="text-xs text-slate-400">
                      {count} prompts • {percent}%
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Per-prompt list */}
        {prompts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Analyzed Prompts</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {prompts.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm space-y-1"
                >
                  <p className="text-slate-200">{item.text}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700">
                      {item.type}
                    </span>
                    <span>
                      Growth:{" "}
                      <span className="text-slate-100 font-semibold">
                        {item.growth}
                      </span>
                    </span>
                    <span>
                      Dependency:{" "}
                      <span className="text-slate-100 font-semibold">
                        {item.dependency}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
