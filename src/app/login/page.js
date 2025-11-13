"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    // ❗ Dacă există o eroare
    if (res?.error) {
      // 🔍 dacă este eroarea specială de acces blocat (fără diacritice!)
      if (res.error.startsWith("ACCES_BLOCATI_")) {
        const parts = res.error.split("_"); // ex: ["ACCES", "BLOCATI", "09:00", "17:00"]
        const start = parts[2];
        const end = parts[3];

        setError(`Acces restricționat. Programul tău este între ${start} - ${end}.`);
        return;
      }

        if (res.error === "ACCOUNT_DISABLED") {
      setError("Contul acestui utilizator este dezactivat.");
      return;
      }

      // ❌ orice altă eroare — email/parolă
      setError("Email sau parolă incorecte!");
      return;
    }

    // 🔓 Login reușit
    router.push("/devices");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100">
          🔐 Autentificare CRM
        </h2>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-center">
            {error}
          </div>
        )}

        <div>
          <label className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
            Parolă
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Se autentifică...
            </>
          ) : (
            "Autentificare"
          )}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} ProComputer CRM
        </p>
      </form>
    </div>
  );
}