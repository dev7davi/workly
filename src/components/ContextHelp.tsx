import { HelpCircle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ContextHelpProps {
    content: string;
    className?: string;
}

export function ContextHelp({ content, className }: ContextHelpProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <button 
                        type="button"
                        className={cn("text-muted-foreground/50 hover:text-primary transition-colors focus:outline-none", className)}
                    >
                        <HelpCircle className="h-4 w-4" />
                    </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] p-3 text-[11px] font-medium leading-relaxed bg-zinc-900 border-zinc-800 text-white rounded-xl">
                    <p>{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
