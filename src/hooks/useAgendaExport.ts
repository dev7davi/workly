import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateBulkICS, ServiceForExport } from '@/lib/ics-bulk-generator';
import { toast } from 'sonner';

export interface ExportOptions {
  startDate: Date;
  endDate: Date;
  filterByStatus?: string[];
}

export function useAgendaExport() {
  const [isExporting, setIsExporting] = useState(false);

  const fetchServices = async (options: ExportOptions): Promise<ServiceForExport[]> => {
    const startStr = options.startDate.toISOString().split('T')[0];
    const endStr = options.endDate.toISOString().split('T')[0];

    let query = supabase
      .from('services')
      .select(`
        id,
        service_type,
        client_name,
        service_date,
        service_time,
        value,
        status,
        notes
      `)
      .gte('service_date', startStr)
      .lte('service_date', endStr)
      .order('service_date', { ascending: true });

    if (options.filterByStatus && options.filterByStatus.length > 0) {
      query = query.in('status', options.filterByStatus);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(s => ({
      id: s.id,
      serviceName: s.service_type,
      clientName: s.client_name,
      date: s.service_date,
      time: s.service_time,
      value: s.value || 0,
      status: s.status || 'Pendente',
      description: s.notes
    }));
  };

  const exportToICS = async (options: ExportOptions) => {
    try {
      setIsExporting(true);
      const services = await fetchServices(options);

      if (services.length === 0) {
        toast.error('Nenhum serviço encontrado no período.');
        return;
      }

      const startStr = options.startDate.toISOString().split('T')[0];
      const endStr = options.endDate.toISOString().split('T')[0];

      const ics = generateBulkICS(services);
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Workly_Agenda_${startStr}_a_${endStr}.ics`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`Exportado ${services.length} serviços com sucesso!`);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao exportar agenda.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToGoogle = async (options: ExportOptions) => {
    try {
      setIsExporting(true);
      const services = await fetchServices(options);

      if (services.length === 0) {
        toast.error('Nenhum serviço encontrado no período.');
        return;
      }

      const ics = generateBulkICS(services);
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      // O Google Calendar permite importar via URL pública ou interface de upload.
      // Como estamos no local, abriremos a página de configurações de importação.
      window.open(`https://calendar.google.com/calendar/u/0/r/settings/export`, '_blank');
      
      toast.info('Baixando arquivo para que você possa importar no Google Agenda...');
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Importar_No_Google_${new Date().getTime()}.ics`;
      link.click();
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao preparar exportação.');
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, exportToICS, exportToGoogle };
}
