"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "tab_style_preference_v1";

export const TAB_STYLES = {
  classic: "Classic Clean",
  glass: "Liquid Glass",
  ios: "iOS Segmented",
  ripple: "Ripple Effect",
  color: "Color Slider",
};

export default function useTabStyle() {
  const [style, setStyle] = useState("classic");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && TAB_STYLES[saved]) {
      setStyle(saved);
    }
  }, []);

  const updateStyle = (newStyle) => {
    setStyle(newStyle);
    localStorage.setItem(STORAGE_KEY, newStyle);
  };

  return { style, updateStyle, TAB_STYLES };
}