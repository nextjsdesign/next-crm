"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, ShieldCheck, ClipboardList, Wrench, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      rememberMe: rememberMe ? "true" : "false",
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
    router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900 lg:grid lg:grid-cols-2">
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#101f38] px-12 py-12 text-white lg:flex xl:px-20">
        <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/20"><ClipboardList size={25} /></div>
          <span className="text-xl font-bold tracking-tight">Devize<span className="text-blue-400">Service</span></span>
        </div>
        <div className="relative max-w-lg">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-blue-200"><ShieldCheck size={15} /> PLATFORMĂ DE MANAGEMENT SERVICE</div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight xl:text-6xl">Service-ul tău.<br /><span className="text-blue-400">Sub control.</span></h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-slate-300">Gestionează fișele de reparație, clienții și echipa într-un singur loc. Mai multă organizare, mai puțin timp pierdut.</p>
          <div className="mt-10 grid max-w-md gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4"><ClipboardList className="text-blue-300" size={22} /><span>Fișe și devize organizate</span><CheckCircle2 className="ml-auto text-blue-300" size={18} /></div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4"><Wrench className="text-blue-300" size={22} /><span>Urmărirea reparațiilor în timp real</span><CheckCircle2 className="ml-auto text-blue-300" size={18} /></div>
          </div>
        </div>
        <p className="relative text-sm text-slate-400">© {new Date().getFullYear()} Devize Service · Platformă pentru profesioniști</p>
      </section>

      <main className="flex min-h-screen flex-col px-5 py-8 sm:px-10 lg:justify-center lg:px-16 xl:px-24">
        <div className="mb-12 flex items-center gap-3 lg:hidden">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563eb] text-white"><ClipboardList size={23} /></div>
          <span className="text-xl font-bold text-[#101f38]">Devize<span className="text-blue-600">Service</span></span>
        </div>
        <div className="mx-auto w-full max-w-[430px]">
          <div className="mb-9">
            <div className="mb-4 hidden h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 lg:flex"><ShieldCheck size={27} /></div>
            <h2 className="text-3xl font-bold tracking-tight text-[#101f38]">Bine ai revenit!</h2>
            <p className="mt-2 text-slate-500">Autentifică-te pentru a accesa panoul de administrare.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-slate-700">Adresă de email</label>
              <input id="login-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="nume@companie.ro" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-slate-700">Parolă</label>
              <div className="relative">
                <input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Introdu parola" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ascunde parola" : "Arată parola"} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-blue-600" />
              Ține-mă minte timp de 30 de zile
            </label>
            <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70">
              {loading ? <><Loader2 className="animate-spin" size={19} /> Se autentifică...</> : <>Autentificare <ArrowRight size={19} /></>}
            </button>
          </form>
          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-400"><ShieldCheck size={16} /> Conexiune securizată · Acces doar pentru utilizatori autorizați</div>
        </div>
        <p className="mt-12 text-center text-xs text-slate-400 lg:hidden">© {new Date().getFullYear()} Devize Service</p>
      </main>
    </div>
  );
}
