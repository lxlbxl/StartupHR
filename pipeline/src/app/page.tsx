import Image from "next/image";
import Link from "next/link";
import { TalentRequestForm } from "@/components/TalentRequestForm";
import { FUNCTIONS, HIRING_MODES } from "@/lib/talent-request-schema";

const PROBLEMS = [
  "CV databases full of unqualified candidates",
  "Job boards with high volume and poor signal",
  "Recruiters buried in first-round screening",
  "No way to tell what has actually been verified",
];

const STEPS = [
  {
    title: "Tell us the role",
    body: "Share the function, seniority, budget and must-haves. It takes about five minutes.",
  },
  {
    title: "We route it to a Pipeline",
    body: "Your role goes to the matching Talent Pipeline, for example Marketing — Senior.",
  },
  {
    title: "Verified talent opts in",
    body: "Pre-screened members are matched against your criteria and confirm they're interested.",
  },
  {
    title: "You meet your Top 10",
    body: "Our recruiters review the ranking. You get a shortlist with the evidence behind every match.",
  },
];

const VERIFICATION = [
  "Profile & CV reviewed",
  "LinkedIn verified",
  "Experience verified",
  "Skills assessed",
  "Recruiter screened",
];

const MATCH = [
  ["Skills", 98],
  ["Experience", 95],
  ["Seniority", 100],
  ["Location", 100],
  ["Budget", 100],
] as const;

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#2debbe_1px,transparent_1px),linear-gradient(90deg,#2debbe_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pt-16 pb-24 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-24 lg:pb-32">
            <div>
              <p className="eyebrow">Verified talent network · Africa</p>
              <h1 className="mt-5 font-mono text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Hire from a <span className="text-mint-400">verified</span> talent pipeline.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/75">
                Pre-screened talent. Smarter matching. Faster hiring. Pipeline is the verified talent
                network for companies building Africa&apos;s startups.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#request" className="btn-primary">
                  Request talent <span aria-hidden>→</span>
                </a>
                <a href="#how-it-works" className="btn-ghost">
                  How it works
                </a>
              </div>
            </div>

            <MatchCard />
          </div>
        </section>

        {/* Problem */}
        <section className="border-y border-white/10 bg-teal-950">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="eyebrow">The problem</p>
              <h2 className="mt-4 font-mono text-3xl font-bold tracking-tight sm:text-4xl">
                Hiring shouldn&apos;t start from zero every time.
              </h2>
            </div>
            <div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {PROBLEMS.map((p) => (
                  <li key={p} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-white/80">
                    <span className="font-mono text-red-300">×</span>
                    {p}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-white/70">
                Pipeline builds a persistent, verified talent identity. Candidates are vetted once and
                stay in the network, so the next role you open is matched against people we already
                know.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-4 max-w-2xl font-mono text-3xl font-bold tracking-tight sm:text-4xl">
              Talent belongs to Pipelines. Jobs are routed to Pipelines.
            </h2>
            <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="bg-teal-900 p-6">
                  <span className="font-mono text-sm text-mint-400">0{i + 1}</span>
                  <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Pipelines */}
        <section id="pipelines" className="scroll-mt-20 bg-teal-950">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Pipelines</p>
              <h2 className="mt-4 font-mono text-3xl font-bold tracking-tight sm:text-4xl">
                Organised by function and seniority.
              </h2>
              <p className="mt-5 text-white/70">
                Every member sits in one or more Pipelines, from Entry to Executive. Only verified
                members get the strongest matching, and every score comes with its evidence: no
                invented experience, no unexplained numbers.
              </p>
              <ul className="mt-8 space-y-3">
                {VERIFICATION.map((v) => (
                  <li key={v} className="flex items-center gap-3 text-white/85">
                    <Check /> {v}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap content-start gap-2.5">
              {FUNCTIONS.filter((f) => f !== "Other").map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-mint-400/25 bg-mint-400/[0.06] px-4 py-2 font-mono text-sm text-mint-300"
                >
                  {f}
                </span>
              ))}
              <div className="mt-6 w-full rounded-xl border border-white/10 p-5 font-mono text-sm">
                <p className="text-white/50">{"// talent"}</p>
                <p className="mt-1">
                  Jane <Arrow /> Marketing <Arrow /> Senior <Arrow />{" "}
                  <span className="text-mint-400">Verified</span>
                </p>
                <p className="mt-4 text-white/50">{"// job"}</p>
                <p className="mt-1">
                  Head of Marketing <Arrow /> <span className="text-mint-400">Marketing — Senior</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Hiring modes */}
        <section id="hiring-modes" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
            <p className="eyebrow">Ways to hire</p>
            <h2 className="mt-4 font-mono text-3xl font-bold tracking-tight sm:text-4xl">
              As hands-on as you need.
            </h2>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {HIRING_MODES.filter((m) => m.value !== "Not sure yet").map((m, i) => (
                <div
                  key={m.value}
                  className={`rounded-2xl border p-7 ${i === 1 ? "border-mint-400/50 bg-mint-400/[0.06]" : "border-white/10"}`}
                >
                  <span className="font-mono text-sm text-mint-400">0{i + 1}</span>
                  <h3 className="mt-3 font-mono text-xl font-bold">{m.value}</h3>
                  <p className="mt-3 text-white/70">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Request form */}
        <section id="request" className="scroll-mt-16 bg-paper text-teal-900">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_2fr]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="eyebrow text-mint-600">Request talent</p>
              <h2 className="mt-4 font-mono text-3xl font-bold tracking-tight sm:text-4xl">
                Tell us who you&apos;re hiring.
              </h2>
              <p className="mt-5 text-teal-900/70">
                Share the role and we&apos;ll route it to the right Pipeline. A StartupHR recruiter
                follows up to confirm the brief before matching begins.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-teal-900/80">
                {["Takes about five minutes", "Your details stay private", "Human review on every shortlist"].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <Check dark /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <TalentRequestForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-teal-900/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="Pipeline by StartupHR, home">
          <Image src="/pipeline-logo.jpg" alt="Pipeline by StartupHR" width={2127} height={709} priority className="h-9 w-auto" />
        </Link>
        <nav className="flex items-center gap-7 text-sm text-white/75">
          <a href="#how-it-works" className="hidden hover:text-white md:inline">How it works</a>
          <a href="#pipelines" className="hidden hover:text-white md:inline">Pipelines</a>
          <a href="#hiring-modes" className="hidden hover:text-white md:inline">Ways to hire</a>
          <a href="#request" className="btn-primary px-4 py-2 text-sm">Request talent</a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-teal-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© {new Date().getFullYear()} StartupHR Africa. Pipeline by StartupHR.</p>
        <Link href="/admin" className="hover:text-mint-400">Team login</Link>
      </div>
    </footer>
  );
}

function MatchCard() {
  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-6 rounded-[2rem] bg-mint-400/10 blur-3xl" />
      <div className="relative rounded-2xl border border-white/10 bg-teal-950/80 p-6 shadow-2xl backdrop-blur sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold">Jane D.</p>
            <p className="text-sm text-white/60">Senior Marketing Manager · Lagos</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-3xl font-bold text-mint-400">96%</p>
            <p className="text-xs text-white/50">Job match</p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {MATCH.map(([label, v]) => (
            <div key={label} className="grid grid-cols-[90px_1fr_40px] items-center gap-3 text-sm">
              <span className="text-white/65">{label}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full rounded-full bg-mint-400" style={{ width: `${v}%` }} />
              </span>
              <span className="text-right font-mono text-white/80">{v}%</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5">
          {["LinkedIn", "Skills", "Assessment", "Recruiter screen"].map((v) => (
            <span key={v} className="inline-flex items-center gap-1.5 rounded-full bg-mint-400/10 px-3 py-1 text-xs text-mint-300">
              ✓ {v}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between rounded-lg bg-white/[0.04] px-4 py-3 font-mono text-xs">
          <span className="text-white/60">Marketing — Senior</span>
          <span>
            Pipeline Score <span className="text-mint-400">91</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function Check({ dark }: { dark?: boolean }) {
  return (
    <span
      className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full text-xs ${dark ? "bg-teal-900 text-mint-400" : "bg-mint-400 text-teal-900"}`}
    >
      ✓
    </span>
  );
}

function Arrow() {
  return <span className="text-white/40">→</span>;
}
