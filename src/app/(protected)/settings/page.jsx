"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "",
    email: "",
    phone: "",
    theme: "system",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(true);

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
        body: JSON.stringify(settings),
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
    <div className="w-full max-w-screen-lg mx-auto px-4 sm:px-5 lg:px-6 py-6">
      <h1 className="text-2xl font-semibold mb-6 text-center md:text-left">
        ⚙️ CRM Settings
      </h1>

      {/* grid sigur pe mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Card stânga */}
        <div className="card w-full min-w-0 p-4 sm:p-6 space-y-4">
          <div className="min-w-0">
            <label className="label">Company Name</label>
            <input
              name="companyName"
              type="text"
              className="input mt-1 w-full"
              value={settings.companyName}
              onChange={handleChange}
            />
          </div>

          <div className="min-w-0">
            <label className="label">Email</label>
            <input
              name="email"
              type="email"
              className="input mt-1 w-full"
              value={settings.email}
              onChange={handleChange}
            />
          </div>

          <div className="min-w-0">
            <label className="label">Phone</label>
            <input
              name="phone"
              type="text"
              className="input mt-1 w-full"
              value={settings.phone}
              onChange={handleChange}
            />
          </div>

          <div className="min-w-0">
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

        {/* Card dreapta */}
        <div className="card w-full min-w-0 p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
          <label className="label text-center">Company Logo</label>

          {/* container logo care NU depășește ecranul */}
          <div className="w-full max-w-[9rem] sm:max-w-[10rem] aspect-square border rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-hidden">
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
      </div>

      {/* buton full pe mobile, auto pe desktop */}
      <div className="mt-6 flex justify-center md:justify-end">
        <button onClick={handleSave} className="btn-blue w-full md:w-auto">
          Save Settings
        </button>
      </div>
    </div>
  );
}