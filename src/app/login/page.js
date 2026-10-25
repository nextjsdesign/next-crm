"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Loader2, Eye, EyeOff, ShieldCheck, ClipboardList, Wrench, ArrowRight, CheckCircle2, Sun, Moon, Monitor, Clock3, Users, BarChart3, Headset, Mail, LockKeyhole, Settings2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
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
    <div className="min-h-screen bg-[#edf3fb] text-slate-900 transition-colors dark:bg-[#07101e] dark:text-white lg:flex lg:items-center lg:justify-center lg:p-5">
      <div className="mx-auto min-h-screen w-full max-w-[1600px] overflow-hidden lg:grid lg:min-h-[min(860px,calc(100vh-40px))] lg:grid-cols-[1.07fr_0.93fr] lg:rounded-[26px] lg:shadow-2xl">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#071c38] px-10 py-11 text-white lg:flex xl:px-16">
          <div className="pointer-events-none absolute inset-0 opacity-80" style={{background:"radial-gradient(ellipse at 85% 45%,rgba(37,99,235,.32),transparent 50%),linear-gradient(135deg,#081529 0%,#102b51 55%,#061426 100%)"}} />
          <div className="pointer-events-none absolute -bottom-24 -right-32 h-[430px] w-[520px] rotate-[-22deg] rounded-[90px] border border-blue-400/20 bg-blue-500/5 shadow-[0_0_90px_30px_rgba(37,99,235,0.10)]" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/15 text-blue-400"><Settings2 size={31} strokeWidth={2.4}/></div>
            <span className="text-2xl font-bold leading-6 tracking-tight">Devize<br/><span className="text-blue-400">Service</span></span>
          </div>
          <div className="relative max-w-lg py-8">
            <p className="mb-7 text-sm font-medium tracking-wide text-blue-200">CRM pentru service-uri de laptopuri,<br/> calculatoare și echipamente IT</p>
            <h1 className="mb-7 text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">Simplu. Organizat.<br/><span className="text-blue-400">Eficient.</span></h1>
            <div className="max-w-md space-y-4">
              {[{Icon:ClipboardList,text:"Gestionează fișele de service"},{Icon:Clock3,text:"Urmărește statusul reparațiilor"},{Icon:Wrench,text:"Generează devize rapid"},{Icon:Users,text:"Administrează clienți și dispozitive"},{Icon:BarChart3,text:"Rapoarte și statistici"},{Icon:Headset,text:"Acces securizat pentru echipă"}].map(({Icon,text})=>(
                <div key={text} className="flex items-center gap-4 border-b border-white/10 pb-3 text-[15px] text-slate-100"><Icon size={20} className="shrink-0 text-blue-400"/><span>{text}</span></div>
              ))}
            </div>
          </div>
          <p className="relative text-sm text-slate-400">© {new Date().getFullYear()} Devize Service</p>
        </section>
        <main className="flex min-h-screen flex-col justify-center px-4 py-7 sm:px-10 lg:min-h-0 lg:bg-[#f7f9fd] lg:px-12 lg:dark:bg-[#0d1829] xl:px-20">
          <div className="mx-auto mb-7 flex w-full max-w-[450px] items-center gap-3 px-2 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20"><Settings2 size={26}/></div>
            <span className="text-xl font-bold tracking-tight text-[#101f38] dark:text-white">Devize<span className="text-blue-600">Service</span></span>
          </div>
          <div className="mx-auto w-full max-w-[450px] rounded-[30px] border border-white/80 bg-white px-6 py-8 shadow-[0_18px_55px_rgba(18,48,89,.10)] dark:border-slate-700 dark:bg-[#101e32] sm:px-9 sm:py-10 lg:border-slate-200/70 lg:shadow-[0_12px_40px_rgba(18,48,89,.07)] lg:dark:border-slate-700">
            <div className="mb-7">
              <div className="mb-5 hidden h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 lg:flex dark:bg-blue-500/10"><ShieldCheck size={24}/></div>
              <p className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">Bun venit în</p>
              <h2 className="text-[28px] font-extrabold tracking-tight text-[#102747] dark:text-white">Devize <span className="text-blue-600">Service</span></h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Conectează-te pentru a continua</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                  <input id="login-email" type="email" autoComplete="username" value={email} onChange={(e)=>setEmail(e.target.value)} required placeholder="nume@companie.ro" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-[#192a40] dark:text-white dark:focus:ring-blue-900/30"/>
                </div>
              </div>
              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Parolă</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                  <input id="login-password" type={showPassword?"text":"password"} autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} required placeholder="Introdu parola" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-11 pr-12 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-[#192a40] dark:text-white dark:focus:ring-blue-900/30"/>
                  <button type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?"Ascunde parola":"Arată parola"} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-blue-600">{showPassword?<EyeOff size={19}/>:<Eye size={19}/>}</button>
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-3 py-1 text-[13px] text-slate-600 dark:text-slate-300">
                <input type="checkbox" checked={rememberMe} onChange={(e)=>setRememberMe(e.target.checked)} className="h-4 w-4 accent-blue-600"/>
                Ține-mă minte timp de 30 de zile
              </label>
              <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0874f9] font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-60">
                {loading?<><Loader2 size={19} className="animate-spin"/> Se autentifică...</>:<>Conectează-te <ArrowRight size={18}/></>}
              </button>
            </form>
            <div className="mt-7 border-t border-slate-100 pt-5 text-center dark:border-slate-700">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400"><ShieldCheck size={17} className="text-blue-500"/> Acces securizat · Datele tale sunt protejate</div>
            </div>
          </div>
          <div className="mx-auto mt-7 flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800" aria-label="Aspect interfață">
            {[{value:"light",label:"Zi",Icon:Sun},{value:"dark",label:"Noapte",Icon:Moon},{value:"system",label:"Automat",Icon:Monitor}].map(({value,label,Icon})=>(
              <button key={value} type="button" onClick={()=>setTheme(value)} aria-label={label} aria-pressed={theme===value} className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors ${theme===value?"bg-blue-600 text-white":"text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"}`}><Icon size={15}/>{label}</button>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-400 lg:hidden">© {new Date().getFullYear()} Devize Service</p>
        </main>
      </div>
    </div>
  );
}
