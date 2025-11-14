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

  // 🔵 1. Citește stilul din server (MongoDB)
  useEffect(() => {
    async function loadServerStyle() {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        const data = await res.json();

        if (data?.tabStyle && TAB_STYLES[data.tabStyle]) {
          setStyle(data.tabStyle);
          localStorage.setItem(LOCAL_STORAGE_KEY, data.tabStyle);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Nu pot încărca tabStyle din server:", err);
      }

      // fallback → stilul local
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local && TAB_STYLES[local]) {
        setStyle(local);
      }

      setLoading(false);
    }

    loadServerStyle();
  }, []);

  // 🔵 2. Când utilizatorul schimbă stilul → salvează în DB + localStorage
  const updateStyle = async (newStyle) => {
    if (!TAB_STYLES[newStyle]) return;

    setStyle(newStyle);
    localStorage.setItem(LOCAL_STORAGE_KEY, newStyle);

    try {
      await fetch("/api/settings", {
        method: "POST",
        body: JSON.stringify({ tabStyle: newStyle }),
      });
    } catch (err) {
      console.warn("Nu am putut salva tabStyle în server:", err);
    }
  };

  return { style, updateStyle, TAB_STYLES, loading };
}