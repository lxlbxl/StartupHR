"use client";

import { startTransition, useActionState, useState, type ReactNode } from "react";
import { submitTalentRequest, type SubmitState } from "@/app/actions";
import {
  BUDGET_PERIODS,
  COMPANY_SIZES,
  CURRENCIES,
  EMPLOYMENT_TYPES,
  FUNCTIONS,
  HIRING_MODES,
  REFERRAL_SOURCES,
  SENIORITY,
  START_TIMELINES,
  WORK_ARRANGEMENTS,
  type FieldErrors,
} from "@/lib/talent-request-schema";

type Name = keyof FieldErrors;

export function TalentRequestForm() {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitTalentRequest, {
    status: "idle",
  });
  // Fields edited since the last submit hide their stale error.
  const [edited, setEdited] = useState<Set<string>>(new Set());
  const errors: FieldErrors =
    state.status === "error"
      ? Object.fromEntries(Object.entries(state.errors).filter(([k]) => !edited.has(k)))
      : {};

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-mint-600/30 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-mint-400/20 text-mint-600">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="font-mono text-2xl font-bold text-teal-900">Request received.</h3>
        <p className="mx-auto mt-3 max-w-md text-teal-900/70">
          {state.pipeline ? (
            <>
              We&apos;re routing your role to the{" "}
              <span className="font-mono font-semibold text-teal-900">{state.pipeline}</span>{" "}
              Pipeline. A StartupHR recruiter will be in touch shortly.
            </>
          ) : (
            "A StartupHR recruiter will be in touch shortly."
          )}
        </p>
        {state.id > 0 && (
          <p className="mt-4 font-mono text-xs text-teal-900/50">Reference #PL-{String(state.id).padStart(5, "0")}</p>
        )}
      </div>
    );
  }

  return (
    <form
      noValidate
      // Submit via onSubmit so React doesn't reset the fields when validation fails.
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setEdited(new Set());
        startTransition(() => action(fd));
      }}
      onChange={(e) => {
        const name = (e.target as unknown as HTMLInputElement).name;
        if (name && !edited.has(name)) setEdited((prev) => new Set(prev).add(name));
      }}
      className="space-y-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-teal-900/5 sm:p-10"
    >
      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Fax number <input type="text" name="fax_number" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Section n="01" title="Your company">
        <Field name="company_name" label="Company name" errors={errors} required>
          <input className="field-input" name="company_name" id="company_name" autoComplete="organization" aria-invalid={!!errors.company_name} />
        </Field>
        <Field name="company_website" label="Website" errors={errors}>
          <input className="field-input" name="company_website" id="company_website" placeholder="yourcompany.com" inputMode="url" aria-invalid={!!errors.company_website} />
        </Field>
        <Field name="industry" label="Industry" errors={errors} required>
          <input className="field-input" name="industry" id="industry" placeholder="e.g. Fintech, Healthtech, Logistics" aria-invalid={!!errors.industry} />
        </Field>
        <Field name="company_size" label="Company size" errors={errors} required>
          <Select name="company_size" options={COMPANY_SIZES} placeholder="Number of employees" invalid={!!errors.company_size} />
        </Field>
        <Field name="company_location" label="Headquarters" errors={errors} required wide>
          <input className="field-input" name="company_location" id="company_location" placeholder="City, Country" aria-invalid={!!errors.company_location} />
        </Field>
      </Section>

      <Section n="02" title="Your details">
        <Field name="contact_name" label="Full name" errors={errors} required>
          <input className="field-input" name="contact_name" id="contact_name" autoComplete="name" aria-invalid={!!errors.contact_name} />
        </Field>
        <Field name="contact_title" label="Job title" errors={errors} required>
          <input className="field-input" name="contact_title" id="contact_title" autoComplete="organization-title" placeholder="e.g. Founder, Head of People" aria-invalid={!!errors.contact_title} />
        </Field>
        <Field name="contact_email" label="Work email" errors={errors} required>
          <input className="field-input" type="email" name="contact_email" id="contact_email" autoComplete="email" aria-invalid={!!errors.contact_email} />
        </Field>
        <Field name="contact_phone" label="Phone / WhatsApp" errors={errors} required>
          <input className="field-input" type="tel" name="contact_phone" id="contact_phone" autoComplete="tel" placeholder="+234 …" aria-invalid={!!errors.contact_phone} />
        </Field>
      </Section>

      <Section n="03" title="The role">
        <Field name="role_title" label="Role title" errors={errors} required wide>
          <input className="field-input" name="role_title" id="role_title" placeholder="e.g. Senior Marketing Manager" aria-invalid={!!errors.role_title} />
        </Field>
        <Field name="function" label="Function" errors={errors} required>
          <Select name="function" options={FUNCTIONS} placeholder="Choose a function" invalid={!!errors.function} />
        </Field>
        <Field name="seniority" label="Seniority" errors={errors} required>
          <Select name="seniority" options={SENIORITY} placeholder="Choose a level" invalid={!!errors.seniority} />
        </Field>
        <Field name="employment_type" label="Employment type" errors={errors} required>
          <Select name="employment_type" options={EMPLOYMENT_TYPES} defaultValue="Full-time" invalid={!!errors.employment_type} />
        </Field>
        <Field name="openings" label="Number of openings" errors={errors} required>
          <input className="field-input" type="number" min={1} max={500} name="openings" id="openings" defaultValue={1} aria-invalid={!!errors.openings} />
        </Field>
        <Field name="work_arrangement" label="Work arrangement" errors={errors} required>
          <Select name="work_arrangement" options={WORK_ARRANGEMENTS} placeholder="Choose one" invalid={!!errors.work_arrangement} />
        </Field>
        <Field name="job_location" label="Job location" errors={errors} required>
          <input className="field-input" name="job_location" id="job_location" placeholder="e.g. Lagos, Nigeria" aria-invalid={!!errors.job_location} />
        </Field>

        <div className="sm:col-span-2">
          <span className="field-label">Budget</span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[110px_1fr_1fr_130px]">
            <Select name="budget_currency" options={CURRENCIES} defaultValue="NGN" ariaLabel="Currency" />
            <input className="field-input" name="budget_min" placeholder="Min" inputMode="numeric" aria-label="Budget minimum" aria-invalid={!!errors.budget_min} />
            <input className="field-input" name="budget_max" placeholder="Max" inputMode="numeric" aria-label="Budget maximum" aria-invalid={!!errors.budget_max} />
            <Select name="budget_period" options={BUDGET_PERIODS} defaultValue="Annual" ariaLabel="Budget period" />
          </div>
          {(errors.budget_min || errors.budget_max) && (
            <p className="field-error">{errors.budget_min || errors.budget_max}</p>
          )}
          <p className="field-hint">Gross salary range. Leave blank if you&apos;d like our recommendation.</p>
        </div>

        <Field name="start_timeline" label="When do you need them?" errors={errors} required>
          <Select name="start_timeline" options={START_TIMELINES} placeholder="Choose a timeline" invalid={!!errors.start_timeline} />
        </Field>
        <Field name="jd_link" label="Job description link" errors={errors} hint="Google Doc, Notion, PDF link…">
          <input className="field-input" name="jd_link" id="jd_link" placeholder="https://" inputMode="url" aria-invalid={!!errors.jd_link} />
        </Field>
        <Field
          name="requirements"
          label="Key requirements"
          errors={errors}
          required
          wide
          hint="Must-haves, nice-to-haves and deal breakers: years of experience, skills, industry background, tools."
        >
          <textarea className="field-input min-h-32" name="requirements" id="requirements" rows={5} aria-invalid={!!errors.requirements} />
        </Field>
      </Section>

      <Section n="04" title="How would you like to hire?">
        <fieldset className="sm:col-span-2">
          <legend className="sr-only">Hiring mode</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {HIRING_MODES.map((m) => (
              <label
                key={m.value}
                className="group relative flex cursor-pointer gap-3 rounded-xl border border-teal-900/15 bg-white p-4 transition hover:border-mint-600 has-checked:border-mint-600 has-checked:bg-mint-400/10 has-checked:ring-2 has-checked:ring-mint-400/40"
              >
                <input type="radio" name="hiring_mode" value={m.value} className="mt-1 accent-teal-900" />
                <span>
                  <span className="block font-semibold text-teal-900">{m.value}</span>
                  <span className="mt-0.5 block text-sm text-teal-900/65">{m.description}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.hiring_mode && <p className="field-error">{errors.hiring_mode}</p>}
        </fieldset>

        <Field name="referral_source" label="How did you hear about Pipeline?" errors={errors}>
          <Select name="referral_source" options={REFERRAL_SOURCES} placeholder="Choose one" />
        </Field>
        <div className="hidden sm:block" />
        <Field name="notes" label="Anything else we should know?" errors={errors} wide>
          <textarea className="field-input" name="notes" id="notes" rows={3} />
        </Field>
      </Section>

      <div className="space-y-5 border-t border-teal-900/10 pt-8">
        <label className="flex items-start gap-3 text-sm text-teal-900/80">
          <input type="checkbox" name="consent" className="mt-0.5 size-4 accent-teal-900" aria-invalid={!!errors.consent} />
          <span>
            I agree that StartupHR Africa may store these details and contact me about this request.
          </span>
        </label>
        {errors.consent && <p className="field-error -mt-3">{errors.consent}</p>}

        {state.status === "error" && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-primary w-full bg-teal-900 text-white hover:bg-teal-800 sm:w-auto">
          {pending ? "Submitting…" : "Submit talent request"}
          {!pending && <span aria-hidden>→</span>}
        </button>
      </div>
    </form>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-5 flex items-baseline gap-3 font-mono text-lg font-bold text-teal-900">
        <span className="text-sm text-mint-600">{n}</span>
        {title}
      </h3>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  name,
  label,
  errors,
  required,
  wide,
  hint,
  children,
}: {
  name: Name;
  label: string;
  errors: FieldErrors;
  required?: boolean;
  wide?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={name} className="field-label">
        {label}
        {required && <span className="text-mint-600"> *</span>}
      </label>
      {children}
      {errors[name] ? <p className="field-error">{errors[name]}</p> : hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

function Select({
  name,
  options,
  placeholder,
  defaultValue,
  invalid,
  ariaLabel,
}: {
  name: string;
  options: readonly string[];
  placeholder?: string;
  defaultValue?: string;
  invalid?: boolean;
  ariaLabel?: string;
}) {
  return (
    <select
      id={name}
      name={name}
      defaultValue={defaultValue ?? ""}
      aria-invalid={invalid}
      aria-label={ariaLabel}
      className="field-input field-select"
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
