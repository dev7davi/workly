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
  const [lastExportTime, setLastExportTime] = useState(0);

  // Rate limiting: máximo 1 exportação a cada 3 segundos
  const canExport = () => {
    const now = Date.now();
    if (now - lastExportTime < 3000) {
      toast.error('Aguarde antes de exportar novamente');
      return false;
    }
    setLastExportTime(now);
    return true;
  };

  const fetchServices = async (options: ExportOptions): Promise<ServiceForExport[]> => {
    try {
      const startStr = options.startDate.toISOString().split('T')[0];
      const endStr = options.endDate.toISOString().split('T')[0];

      // ✅ CORRIGIDO: Nomes reais das colunas no Supabase e inclusão de created_at para DTSTAMP
      let query = supabase
        .from('services')
        .select(`
          id,
          service_type,
          client_id,
          client_name,
          clients(name),
          service_date,
          value,
          status,
          notes,
          created_at
        `)
        .gte('service_date', startStr)
        .lte('service_date', endStr)
        .order('service_date', { ascending: true });

      if (options.filterByStatus && options.filterByStatus.length > 0) {
        query = query.in('status', options.filterByStatus);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar serviços: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhum serviço encontrado no período selecionado');
      }

      // ✅ CORRIGIDO: Incluindo createdAt para DTSTAMP consistente
      return data.map(s => {
        const clientName = (typeof s.clients === 'object' && (s.clients as any)?.name)
          ? (s.clients as any).name
          : (s.client_name || 'Cliente Desconhecido');

        return {
          id: s.id || 'unknown',
          serviceName: s.service_type || 'Serviço sem nome',
          clientName: clientName,
          date: s.service_date || new Date().toISOString().split('T')[0],
          time: '09:00',
          value: parseFloat(s.value as any) || 0,
          status: s.status || 'Pendente',
          description: s.notes || '',
          address: undefined,
          createdAt: s.created_at
        };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar serviços';
      console.error('[AGENDA_EXPORT_FETCH]', errorMessage);
      throw err;
    }
  };

  const exportToICS = async (options: ExportOptions) => {
    if (!canExport()) return;

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

      setTimeout(() => URL.revokeObjectURL(url), 100);

      toast.success(`Exportado ${services.length} serviço${services.length !== 1 ? 's' : ''} com sucesso!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('[AGENDA_EXPORT_ICS]', errorMessage);
      toast.error(`Erro ao exportar: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToGoogle = async (options: ExportOptions) => {
    if (!canExport()) return;

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

      window.open(`https://calendar.google.com/calendar/u/0/r/settings/export`, '_blank');

      toast.info('Baixando arquivo para que você possa importar no Google Agenda...');

      const link = document.createElement('a');
      link.href = url;
      link.download = `Importar_No_Google_${new Date().getTime()}.ics`;
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('[AGENDA_EXPORT_GOOGLE]', errorMessage);
      toast.error(`Erro ao preparar exportação: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, exportToICS, exportToGoogle };
}
