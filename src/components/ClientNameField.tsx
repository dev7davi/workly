import { useState, useRef, useEffect } from "react";
import { User, Search, ChevronRight, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClients } from "@/hooks/useClients";

interface ClientNameFieldProps {
    value: string;
    onChange: (name: string) => void;
    error?: string;
}

export function ClientNameField({ value, onChange, error }: ClientNameFieldProps) {
    const { clients } = useClients();
    const [inputValue, setInputValue] = useState(value);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync when parent changes value externally
    useEffect(() => { setInputValue(value); }, [value]);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const filtered = clients
        .filter(c => c.name.toLowerCase().includes(inputValue.toLowerCase()) && inputValue.length > 0)
        .slice(0, 7);

    const handleInputChange = (v: string) => {
        setInputValue(v);
        onChange(v);
        setShowSuggestions(v.length > 0);
    };

    const handleSelect = (name: string) => {
        setInputValue(name);
        onChange(name);
        setShowSuggestions(false);
    };

    return (
        <div ref={wrapperRef} className="relative space-y-1.5">
            <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <User className="h-3 w-3" /> Nome do Cliente
            </Label>

            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                    id="client_name"
                    value={inputValue}
                    onChange={e => handleInputChange(e.target.value)}
                    onFocus={() => inputValue.length > 0 && setShowSuggestions(true)}
                    placeholder="Buscar cliente ou digitar nome…"
                    className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary pl-10 pr-4"
                    autoComplete="off"
                />
            </div>

            {error && (
                <p className="text-xs font-medium text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {error}
                </p>
            )}

            {/* Dropdown */}
            {showSuggestions && filtered.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <ul className="py-1">
                        {filtered.map(client => (
                            <li key={client.id}>
                                <button
                                    type="button"
                                    onMouseDown={e => { e.preventDefault(); handleSelect(client.name); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 text-left transition-colors group"
                                >
                                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm">{client.name}</p>
                                        {client.phone && <p className="text-[10px] font-bold text-muted-foreground">{client.phone}</p>}
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary shrink-0" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
