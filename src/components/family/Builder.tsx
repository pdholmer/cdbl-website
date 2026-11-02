import { cn } from "@/lib/utils";

export const BUILDER_STEPS = ["Player", "Program", "Forms", "Pay"] as const;

/** Four-segment progress: done = foreground, current = CDBL Blue, to-do = border. */
export const BuilderProgress = ({ step, className }: { step: number; className?: string }) => (
  <div className={cn("flex gap-1.5", className)} role="img" aria-label={`Step ${step} of 4`}>
    {BUILDER_STEPS.map((s, i) => (
      <span
        key={s}
        className={cn("h-1.5 flex-1 rounded-full", i + 1 < step ? "bg-foreground" : i + 1 === step ? "bg-primary" : "bg-border")}
      />
    ))}
  </div>
);

/** Shrinks the name so long names never overflow the stage. */
const nameSize = (name: string) => {
  const n = Math.max(name.length, 1);
  const scale = n > 7 ? 7 / n : 1;
  return `clamp(${Math.round(36 * scale)}px, ${(7.2 * scale).toFixed(2)}vw, ${Math.round(84 * scale)}px)`;
};

export const builderMeta = (step: number) => `Household · Step ${step} of 4 · ${BUILDER_STEPS[step - 1]}`;

interface StageProps {
  label: string;
  name: string;
  step: number;
}

/** Left "lit stage" on iPad and desktop. On phones the lit header carries the same facts. */
export const BuilderStage = ({ label, name, step }: StageProps) => (
  <div className="ngb-stage tex-twill relative hidden overflow-hidden border-r border-border md:flex md:flex-col md:justify-end md:px-6 md:py-10 lg:px-10">
    <span
      aria-hidden
      className="pointer-events-none absolute left-4 top-4 lg:left-8 select-none font-display font-black leading-none text-foreground/[0.06]"
      style={{ fontSize: "clamp(160px, 20vw, 280px)" }}
    >
      {step}
    </span>
    <div className="relative min-w-0">
      <p className="font-label text-[12px] font-semibold uppercase tracking-[0.16em] text-primary">{label}</p>
      <p
        className="mt-2 break-words font-display font-black uppercase leading-[0.9] text-foreground"
        style={{ fontSize: nameSize(name) }}
      >
        {name}
      </p>
      <p className="mt-3 font-label text-[15px] font-semibold text-muted-foreground">{builderMeta(step)}</p>
      <BuilderProgress step={step} className="mt-5 max-w-sm" />
    </div>
  </div>
);

/** Phone-only stage facts shown inside the lit header. */
export const BuilderHeaderExtra = ({ step }: { step: number }) => (
  <div className="md:hidden">
    <p className="mt-2 font-label text-[13px] font-semibold text-muted-foreground">{builderMeta(step)}</p>
    <BuilderProgress step={step} className="mt-3" />
  </div>
);

interface ActionBarProps {
  step: number;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** Optional chip or note to the left of the pill on wider screens. */
  aside?: React.ReactNode;
}

/** Counter box plus a full-width pill. Fixed above the tab bar on phones; sticky at the panel foot on iPad/desktop. */
export const BuilderActionBar = ({ step, label, onClick, disabled, aside }: ActionBarProps) => (
  <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:sticky md:inset-x-auto md:bottom-0 md:px-6">
    <div className="mx-auto flex max-w-2xl items-center gap-3 pr-[68px]">
      <span className="flex h-12 shrink-0 items-center rounded-lg border border-border bg-card px-3 font-display text-lg font-black uppercase tabular-nums text-foreground">
        {step} of 4
      </span>
      {aside && <span className="hidden shrink-0 sm:inline-flex">{aside}</span>}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="h-12 min-w-0 flex-1 truncate rounded-full bg-primary px-5 font-label text-[15px] font-bold uppercase tracking-[0.06em] text-primary-foreground disabled:opacity-50"
      >
        {label}
      </button>
    </div>
  </div>
);

/** Split layout: stage on the left (md+), choices and action bar on the right. */
export const BuilderLayout = ({ stage, children, actionBar }: { stage: React.ReactNode; children: React.ReactNode; actionBar?: React.ReactNode }) => (
  <div className="md:grid md:min-h-[calc(100vh-120px)] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
    {stage}
    <div className="flex min-w-0 flex-col">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-40 sm:px-6 md:pb-8">{children}</div>
      {actionBar}
    </div>
  </div>
);
