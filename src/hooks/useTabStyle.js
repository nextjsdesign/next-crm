"use client";

import { useEffect, useState } from "react";

const LOCAL_STORAGE_KEY = "tab_style_preference_v1";

export const TAB_STYLES = {
  classic: "Classic Clean",
  glass: "Liquid Glass",
  ios: "iOS Segmented",
  ripple: "Ripple Effect",
  color: "Color Slider",
};

export default function useTabStyle() {
  const [style, setStyle] = useState("classic");
  const [loading, setLoading] = useState(true);

  // 🔵 1. Load from server (Mongo)
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        const data = await res.json();

        if (data?.tabStyle && TAB_STYLES[data.tabStyle]) {
          setStyle(data.tabStyle);
          localStorage.setItem(LOCAL_STORAGE_KEY, data.tabStyle);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Nu pot încărca tabStyle din server:", e);
      }

      // 🔁 fallback → localStorage
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local && TAB_STYLES[local]) {
        setStyle(local);
      }

      setLoading(false);
    }

    load();
  }, []);

  // 🔵 2. Update in DB + localStorage
  const updateStyle = async (newStyle) => {
    if (!TAB_STYLES[newStyle]) return;

    setStyle(newStyle);
    localStorage.setItem(LOCAL_STORAGE_KEY, newStyle);

    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // 👈 OBLIGATORIU
        body: JSON.stringify({
          tabStyle: newStyle,
        }),
      });
    } catch (e) {
      console.warn("Nu pot salva tabStyle în server:", e);
    }
  };

  return { style, updateStyle, TAB_STYLES, loading };
}