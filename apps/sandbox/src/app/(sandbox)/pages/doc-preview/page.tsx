"use client";

import { useState, useEffect } from "react";
import * as stylex from "@stylexjs/stylex";
import { XDSHStack } from "@xds/core/Layout";
import { XDSText } from "@xds/core/Text";
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from "@xds/core/SegmentedControl";
import { XDSSpinner } from "@xds/core/Spinner";
import type { ReferenceDoc } from "@xds/core";
import { DocPreview } from "./DocPreview";
import { XDSThemeContext } from "@xds/core/theme";
import { useContext } from "react";

const styles = stylex.create({
  page: {
    minHeight: "100vh",
  },
  topBar: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    backgroundColor: "var(--color-background-body)",
    borderBottom: "1px solid var(--color-border)",
    padding: "12px 32px",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 64,
  },
});

/** Foundational doc topics — the section docs that have tokenCategory */
const TOPICS = [
  { value: "color", label: "Color" },
  { value: "spacing", label: "Spacing" },
  { value: "typography", label: "Typography" },
  { value: "elevation", label: "Elevation" },
  { value: "shape", label: "Shape" },
  { value: "motion", label: "Motion" },
] as const;

export default function DocPreviewPage() {
  const [topic, setTopic] = useState<string>("color");
  const [docs, setDocs] = useState<Record<string, ReferenceDoc>>({});
  const [version, setVersion] = useState('');
  const [loading, setLoading] = useState(true);

  // Load pre-generated doc data
  useEffect(() => {
    import("../../../../generated/foundationDocs.json")
      .then((mod) => {
        const data = mod.default as Record<string, unknown>;
        setVersion((data.__version as string) ?? '');
        const {__version: _, ...topics} = data;
        setDocs(topics as Record<string, ReferenceDoc>);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const ctx = useContext(XDSThemeContext);
  const doc = docs[topic] ?? null;

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.topBar)}>
        <XDSHStack gap={4} align="center">
          <XDSText type="label" color="secondary">
            Foundations
          </XDSText>
          <XDSSegmentedControl
            value={topic}
            onChange={setTopic}
            label="Doc topic"
            size="sm"
          >
            {TOPICS.map((t) => (
              <XDSSegmentedControlItem
                key={t.value}
                value={t.value}
                label={t.label}
              />
            ))}
          </XDSSegmentedControl>
        </XDSHStack>
      </div>
      {loading ? (
        <div {...stylex.props(styles.loading)}>
          <XDSSpinner size="md" />
        </div>
      ) : doc ? (
        ctx?.theme ? <DocPreview doc={doc} version={version} theme={ctx.theme} /> : null
      ) : (
        <div {...stylex.props(styles.loading)}>
          <XDSText color="secondary">No doc found for &quot;{topic}&quot;</XDSText>
        </div>
      )}
    </div>
  );
}
