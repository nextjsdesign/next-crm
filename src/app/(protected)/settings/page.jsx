"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import useTabStyle, { TAB_STYLES } from "@/hooks/useTabStyle";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "",
    email: "",
    phone: "",
    theme: "system",
    logoUrl: "",
  });

  const [loading, setLoading] = useState(true);

  // 🎨 Stil tab-uri
  const { style, updateStyle } = useTabStyle();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setSettings({
          companyName: data.companyName || "",
          email: data.email || "",
          phone: data.phone || "",
          theme: data.theme || "system",
          logoUrl: data.logoUrl || "",
        });
      } catch (e) {
        console.error(e);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

const handleSave = async () => {
  try {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...settings,
        tabStyle: style, // 🔵 trebuie trimis explicit în DB
      }),
    });

    if (res.ok) toast.success("✅ Settings saved successfully!");
    else toast.error("❌ Failed to save settings");
  } catch (e) {
    console.error(e);
    toast.error("❌ Error while saving");
  }
};

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSettings((prev) => ({ ...prev, logoUrl: url }));
  };

  if (loading) {
    return (
      <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-300">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-lg mx-auto px-4 sm:px-5 lg:px-6 py-6 space-y-8">

      {/* 🔵 TITLU PAGINĂ */}
      <h1 className="text-2xl font-semibold mb-2">⚙️ CRM Settings</h1>

      {/* ░░░░░░░░░░░░░░░░ SECTION 1 — COMPANY SETTINGS ░░░░░░░░░░░░░░░░ */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
          🏢 Company Information
        </h2>

        <div className="card p-4 sm:p-6 space-y-4">
          <div>
            <label className="label">Company Name</label>
            <input
              name="companyName"
              type="text"
              className="input mt-1 w-full"
              value={settings.companyName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              name="email"
              type="email"
              className="input mt-1 w-full"
              value={settings.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Phone</label>
            <input
              name="phone"
              type="text"
              className="input mt-1 w-full"
              value={settings.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Default Theme</label>
            <select
              name="theme"
              className="input mt-1 w-full"
              value={settings.theme}
              onChange={handleChange}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      </section>

      {/* ░░░░░░░░░░░░░░░░ SECTION 2 — BRANDING ░░░░░░░░░░░░░░░░ */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
          🎨 Branding
        </h2>

        <div className="card p-4 sm:p-6 space-y-4 flex flex-col items-center">
          <label className="label">Company Logo</label>

          <div className="w-full max-w-[9rem] sm:max-w-[10rem] aspect-square border rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo preview"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <span className="text-gray-400 text-sm">No Logo</span>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="w-full text-sm"
          />
        </div>
      </section>

      {/* ░░░░░░░░░░░░░░░░ SECTION 3 — TAB STYLE ░░░░░░░░░░░░░░░░ */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
          🖥 Status Tabs Style
        </h2>

        <div className="space-y-3">
          {Object.entries(TAB_STYLES).map(([key, label]) => {
            const selected = style === key;

            return (
              <button
                key={key}
                onClick={() => updateStyle(key)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border shadow-sm transition-all backdrop-blur-md
                  ${
                    selected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-400"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  }
                `}
              >
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {label}
                </span>

                <span
                  className={`w-5 h-5 rounded-full border-2 transition ${
                    selected
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-400 dark:border-gray-600"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* ░░░░░░░░░░░░░░░░ SAVE BUTTON ░░░░░░░░░░░░░░░░ */}
      <div className="mt-6 flex justify-center md:justify-end">
        <button onClick={handleSave} className="btn-blue w-full md:w-auto">
          Save Settings
        </button>
      </div>
    </div>
  );
}