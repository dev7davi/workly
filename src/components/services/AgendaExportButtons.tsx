import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Download, Calendar, ChevronDown, Check } from 'lucide-react';
import { useAgendaExport } from '@/hooks/useAgendaExport';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AgendaExportButtonsProps {
  currentDate: Date;
  filterByStatus?: string[];
}

export function AgendaExportButtons({
  currentDate,
  filterByStatus,
}: AgendaExportButtonsProps) {
  const { isExporting, exportToICS, exportToGoogle } = useAgendaExport();
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'week' | 'next30'>(
    'month'
  );

  const getPeriodDates = (
    period: 'month' | 'week' | 'next30'
  ): { startDate: Date; endDate: Date } => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (period) {
      case 'month':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;

      case 'week':
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        end.setDate(start.getDate() + 6);
        break;

      case 'next30':
        const today = new Date();
        start.setTime(today.getTime());
        end.setTime(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
    }

    return { startDate: start, endDate: end };
  };

  const handleExportICS = async () => {
    const { startDate, endDate } = getPeriodDates(selectedPeriod);
    await exportToICS({ startDate, endDate, filterByStatus });
  };

  const handleExportGoogle = async () => {
    const { startDate, endDate } = getPeriodDates(selectedPeriod);
    await exportToGoogle({ startDate, endDate, filterByStatus });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Dropdown de período */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 rounded-2xl h-11 px-4 border-muted-foreground/20 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-muted/50">
            <Calendar className="h-4 w-4 text-primary" />
            Período: {selectedPeriod === 'month' ? 'Mês Atual' : selectedPeriod === 'week' ? 'Semana Atual' : 'Próximos 30 Dias'}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[200px] shadow-2xl border-primary/10">
          <DropdownMenuItem
            onClick={() => setSelectedPeriod('month')}
            className={cn("rounded-xl text-xs font-bold gap-2 p-3", selectedPeriod === 'month' && "bg-primary/10 text-primary")}
          >
            Este Mês {selectedPeriod === 'month' && <Check className="h-3 w-3 ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setSelectedPeriod('week')}
            className={cn("rounded-xl text-xs font-bold gap-2 p-3", selectedPeriod === 'week' && "bg-primary/10 text-primary")}
          >
            Esta Semana {selectedPeriod === 'week' && <Check className="h-3 w-3 ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setSelectedPeriod('next30')}
            className={cn("rounded-xl text-xs font-bold gap-2 p-3", selectedPeriod === 'next30' && "bg-primary/10 text-primary")}
          >
            Próximos 30 Dias {selectedPeriod === 'next30' && <Check className="h-3 w-3 ml-auto" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Botão de exportação principal */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={isExporting}
            className="flex items-center gap-2 h-11 rounded-2xl px-6 bg-slate-900 border-2 border-slate-800 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10"
          >
            <Download className="h-4 w-4" />
            Exportar Agenda
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[220px] shadow-2xl border-slate-100">
          <DropdownMenuItem
            onClick={handleExportGoogle}
            disabled={isExporting}
            className="rounded-xl p-3 gap-3"
          >
            <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-black text-xs">G</div>
            <div className="flex flex-col">
              <span className="text-xs font-black">Google Calendar</span>
              <span className="text-[9px] text-muted-foreground font-bold">Importar via arquivo</span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="my-1 mx-1" />
          
          <DropdownMenuItem
            onClick={handleExportICS}
            disabled={isExporting}
            className="rounded-xl p-3 gap-3"
          >
            <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-black text-xs">ICS</div>
            <div className="flex flex-col">
              <span className="text-xs font-black">Apple / Outlook</span>
              <span className="text-[9px] text-muted-foreground font-bold">Arquivo universal (.ics)</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
