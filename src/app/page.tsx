"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type PromptRecord = {
  id: number;
  text: string;
  type: string;
  growth: number;
  dependency: number;
  source: "gemini" | "local";
  createdAt: string;
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [growthScore, setGrowthScore] = useState<number | null>(null);
  const [dependencyScore, setDependencyScore] = useState<number | null>(null);
  const [promptType, setPromptType] = useState<string | null>(null);
  const [history, setHistory] = useState<PromptRecord[]>([]);

  const handleAnalyze = async () => {
    const text = prompt.toLowerCase().trim();

    if (!text) {
      alert("Please enter a prompt first.");
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        console.warn("Gemini API error, falling back to local logic.");
        throw new Error("Gemini API error");
      }

      const data = await res.json();

      const type = data.promptType ?? "Unknown";
      const growth = data.growthScore ?? null;
      const dependency = data.dependencyScore ?? null;
      const shortFeedback = data.shortFeedback ?? null;

      setPromptType(type);
      setGrowthScore(growth);
      setDependencyScore(dependency);
      setFeedback(shortFeedback);

      if (growth !== null && dependency !== null) {
        setHistory((prev) => [
          {
            id: Date.now(),
            text: prompt,
            type,
            growth,
            dependency,
            source: "gemini",
            createdAt: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error("Error analyzing with Gemini, using fallback:", err);

      let learning = 0;
      let delegation = 0;
      let creation = 0;
      let trivial = 0;

      if (
        text.includes("explain") ||
        text.includes("why") ||
        text.includes("how does") ||
        text.includes("teach me") ||
        text.includes("help me understand")
      ) {
        learning += 1;
      }

      if (
        text.includes("write full") ||
        text.includes("write an essay") ||
        text.includes("do this for me") ||
        text.includes("generate complete") ||
        text.includes("solve this for me")
      ) {
        delegation += 1;
      }

      if (
        text.includes("improve my") ||
        text.includes("review my") ||
        text.includes("refactor") ||
        text.includes("critique") ||
        text.includes("polish")
      ) {
        creation += 1;
      }

      if (text.split(" ").length <= 4) {
        trivial += 1;
      }

      let type = "Mixed / Neutral";
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

      const wordCount = text.split(/\s+/).length;
      if (wordCount > 20) {
        growth += 5;
        dependency -= 5;
      } else if (wordCount < 6) {
        growth -= 5;
        dependency += 5;
      }

      growth = Math.max(0, Math.min(100, growth));
      dependency = Math.max(0, Math.min(100, dependency));

      setPromptType(type);
      setGrowthScore(growth);
      setDependencyScore(dependency);
      setFeedback(
        "Using offline heuristic analysis because the AI analysis is not available right now."
      );

      setHistory((prev) => [
        {
          id: Date.now(),
          text: prompt,
          type,
          growth,
          dependency,
          source: "local",
          createdAt: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasHistory = history.length > 0;

  const avgGrowth =
    history.length > 0
      ? Math.round(
          history.reduce((sum, item) => sum + item.growth, 0) / history.length
        )
      : 0;

  const avgDependency =
    history.length > 0
      ? Math.round(
          history.reduce((sum, item) => sum + item.dependency, 0) /
            history.length
        )
      : 0;

  const chartData = [
    { name: "Avg Growth", value: avgGrowth },
    { name: "Avg Dependency", value: avgDependency },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Top bar with nav */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              AI Mind Playground
            </h1>
            <p className="text-sm md:text-base text-slate-400">
              Type a prompt you would normally ask ChatGPT/Gemini and see
              whether it grows your mind or makes you more dependent.
            </p>
          </div>
          <nav className="flex gap-2 text-xs md:text-sm">
            <span className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-600 text-slate-100">
              Playground
            </span>
            <Link
              href="/session-analyzer"
              className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500"
            >
              Session Analyzer
            </Link>
          </nav>
        </div>

        {/* Prompt input */}
        <section className="space-y-3">
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Your Prompt
          </label>
          <textarea
            className="w-full h-40 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm md:text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 resize-none"
            placeholder="Example: Explain the difference between supervised and unsupervised learning with real-world analogies..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-500 hover:bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Analyzing..." : "Analyze Prompt"}
          </button>
        </section>

        {/* Session Overview / Chart */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Session Overview</h2>
          {!hasHistory ? (
            <p className="text-sm text-slate-500">
              Analyze a few prompts to see your average Brain Growth and
              Dependency scores for this session.
            </p>
          ) : (
            <div className="w-full h-56 rounded-xl bg-slate-950 border border-slate-800 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Single prompt report */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Prompt Intelligence Report</h2>
          {growthScore === null && dependencyScore === null ? (
            <p className="text-sm text-slate-500">
              No analysis yet. Enter a prompt and click{" "}
              <span className="font-medium text-slate-300">Analyze Prompt</span>
              .
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Brain Growth Score
                  </p>
                  <p className="text-2xl font-semibold">{growthScore}/100</p>
                </div>
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Dependency Score
                  </p>
                  <p className="text-2xl font-semibold">
                    {dependencyScore}/100
                  </p>
                </div>
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Detected Prompt Type
                  </p>
                  <p className="text-sm font-medium">{promptType ?? "—"}</p>
                </div>
              </div>

              {feedback && (
                <p className="mt-3 text-sm text-slate-400">
                  <span className="font-semibold text-slate-200">Insight:</span>{" "}
                  {feedback}
                </p>
              )}
            </>
          )}
        </section>

        {/* Prompt history */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Prompt History</h2>
          {history.length === 0 ? (
            <p className="text-sm text-slate-500">
              No prompts analyzed yet. Your recent prompts will appear here with
              their growth and dependency scores.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
                >
                  <div className="space-y-1 flex-1">
                    <p className="text-slate-200 line-clamp-2">
                      {item.text}
                    </p>
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
                      <span className="opacity-70">
                        Source:{" "}
                        {item.source === "gemini" ? "Gemini AI" : "Local rules"}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 md:text-right">
                    {item.createdAt}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
