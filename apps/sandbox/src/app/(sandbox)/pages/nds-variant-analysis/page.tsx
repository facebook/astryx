"use client";

import { useState, useMemo } from "react";

// Top 10 NDS components by usage in Nest apps (Liya's analysis, top Nest apps by MAU)
// Official = defined in NDS source. Custom = added by individual app teams.
const DATA = [
  {"rank":1,"name":"Card","usage":246613,"official":[],"custom":[{"name":"elevated","count":34},{"name":"outlined","count":28},{"name":"horizon","count":6},{"name":"filled","count":4},{"name":"warning","count":1},{"name":"danger","count":1},{"name":"success","count":1}],"storybook":"https://nds-storybook.nest.x2p.facebook.net/storybook/index.html?path=/docs/containers-card--docs"},
  {"rank":2,"name":"Button","usage":207825,"official":[{"name":"default","count":77},{"name":"destructive","count":71},{"name":"outline","count":2911},{"name":"secondary","count":174},{"name":"ghost","count":1128},{"name":"link","count":14}],"custom":[{"name":"primary","count":32},{"name":"solid","count":9},{"name":"flat","count":8},{"name":"tertiary","count":4},{"name":"primaryDestructive","count":2},{"name":"sz: sm","count":3129},{"name":"icon","count":166},{"name":"icon-sm","count":78},{"name":"lg","count":73}],"storybook":"https://nds-storybook.nest.x2p.facebook.net/storybook/index.html?path=/docs/calls-to-action-button--docs"},
  {"rank":3,"name":"Badge","usage":150250,"official":[{"name":"default","count":472},{"name":"destructive","count":526},{"name":"outline","count":3428},{"name":"secondary","count":3337},{"name":"success","count":195},{"name":"warning","count":138},{"name":"error","count":91},{"name":"info","count":65}],"custom":[{"name":"cancelled","count":21},{"name":"solid","count":8},{"name":"pending","count":7},{"name":"critical","count":5},{"name":"cta","count":4},{"name":"subtle","count":4}],"storybook":"https://nds-storybook.nest.x2p.facebook.net/storybook/index.html?path=/docs/communication-badge--docs"},
  {"rank":4,"name":"CardContent","usage":130740,"official":[],"custom":[],"storybook":"https://nds-storybook.nest.x2p.facebook.net/storybook/index.html?path=/docs/containers-card--docs"},
  {"rank":5,"name":"CardHeader","usage":99361,"official":[],"custom":[],"storybook":"https://nds-storybook.nest.x2p.facebook.net/storybook/index.html?path=/docs/containers-card--docs"},
  {"rank":6,"name":"CardTitle","usage":96504,"official":[],"custom":[],"storybook":"https://nds-storybook.nest.x2p.facebook.net/storybook/index.html?path=/docs/containers-card--docs"},
  {"rank":7,"name":"Input","usage":78708,"official":[],"custom":[{"name":"ghost","count":6}],"storybook":"https://nds-storybook.nest.x2p.facebook.net/storybook/index.html?path=/docs/inputs-input--docs"},
  {"rank":8,"name":"Avatar","usage":64158,"official":[],"custom":[{"name":"user","count":4},{"name":"assistant","count":3},{"name":"sz: sm","count":45},{"name":"small","count":39},{"name":"md","count":30},{"name":"xs","count":13},{"name":"lg","count":10}],"storybook":"https://nds-storybook.nest.x2p.facebook.net/storybook/index.html?path=/docs/communication-avatar--docs"},
  {"rank":9,"name":"AvatarFallback","usage":64030,"official":[],"custom":[],"storybook":"https://nds-storybook.nest.x2p.facebook.net/storybook/index.html?path=/docs/communication-avatar--docs"},
  {"rank":10,"name":"Skeleton","usage":58498,"official":[],"custom":[{"name":"chart","count":38},{"name":"text","count":27},{"name":"table","count":24},{"name":"avatar","count":14},{"name":"rectangular","count":10},{"name":"metric","count":6},{"name":"circular","count":4}],"storybook":"https://nds-storybook.nest.x2p.facebook.net/storybook/index.html?path=/docs/performance-skeleton--docs"}
];

type Variant = { name: string; count: number };
type Component = typeof DATA[0];

function VariantPill({ v, type }: { v: Variant; type: "official" | "custom" }) {
  const style =
    type === "official"
      ? "bg-blue-100 text-blue-800 border border-blue-200"
      : "bg-amber-100 text-amber-800 border border-amber-200";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style}`}
      title={`${v.count.toLocaleString()} usages`}
    >
      {v.name}
      <span className="opacity-60 font-normal">{v.count.toLocaleString()}</span>
    </span>
  );
}

function UsageBar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(2, (value / max) * 100);
  return (
    <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function NDSVariantAnalysis() {
  const [filter, setFilter] = useState<"all" | "has-official" | "has-custom" | "has-variants">("all");

  const maxUsage = Math.max(...DATA.map((d) => d.usage));

  const filtered = useMemo(() => {
    return DATA.filter((c) => {
      return (
        filter === "all" ||
        (filter === "has-official" && c.official.length > 0) ||
        (filter === "has-custom" && c.custom.length > 0) ||
        (filter === "has-variants" && (c.official.length > 0 || c.custom.length > 0))
      );
    });
  }, [filter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">NDS Component Variant Analysis</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Top 10 NDS components by usage across Nest apps ·{" "}
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  official
                </span>
                {" vs "}
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  custom
                </span>
              </p>
            </div>
            <a
              href="https://docs.google.com/spreadsheets/d/1RR0Zjh0Rr7u11_CacP2GU4pfBnGt89frYQea32YRtZ8/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              Full sheet (253 components) ↗
            </a>
          </div>
          <div className="flex gap-1">
            {(["all", "has-variants", "has-official", "has-custom"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f === "all" ? "All" : f === "has-variants" ? "Has variants" : f === "has-official" ? "Official" : "Custom only"}
              </button>
            ))}
            <span className="text-xs text-gray-400 ml-auto self-center">{filtered.length} shown</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left w-10">#</th>
                <th className="px-4 py-3 text-left w-44">Component</th>
                <th className="px-4 py-3 text-left w-40">Usages</th>
                <th className="px-4 py-3 text-left">Official variants</th>
                <th className="px-4 py-3 text-left">Custom variants</th>
                <th className="px-4 py-3 text-left w-24">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <tr key={c.rank} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.rank}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <UsageBar value={c.usage} max={maxUsage} />
                      <span className="text-gray-600 tabular-nums text-xs">{c.usage.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {c.official.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {c.official.map((v) => <VariantPill key={v.name} v={v} type="official" />)}
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.custom.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {c.custom.map((v) => <VariantPill key={v.name} v={v} type="custom" />)}
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.storybook ? (
                      <a href={c.storybook} target="_blank" rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-xs hover:underline whitespace-nowrap">
                        Storybook ↗
                      </a>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
