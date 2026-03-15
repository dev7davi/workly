import { cn } from "@/lib/utils";

interface PricingToggleProps {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
}

export function PricingToggle({ isAnnual, onToggle }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <span className={cn("text-sm font-semibold transition-colors", !isAnnual ? "text-white" : "text-white/40")}>
        Mensal
      </span>
      <button
        onClick={() => onToggle(!isAnnual)}
        className={cn(
          "relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300",
          isAnnual ? "bg-primary" : "bg-white/10"
        )}
      >
        <span
          className={cn(
            "inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out",
            isAnnual ? "translate-x-7" : "translate-x-1"
          )}
        />
      </button>
      <span className={cn("text-sm font-semibold transition-colors", isAnnual ? "text-white" : "text-white/40")}>
        Anual
      </span>
      {isAnnual && (
        <span className="ml-2 inline-block bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-in zoom-in-0 duration-300">
          ECONOMIZE 17%
        </span>
      )}
    </div>
  );
}
