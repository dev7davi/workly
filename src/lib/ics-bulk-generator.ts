/**
 * Interface para os dados do serviço formatados para exportação
 */
export interface ServiceForExport {
  id: string;
  serviceName: string;
  clientName: string;
  clientEmail?: string;
  serviceDate: string; // Renomeado de 'date' para 'serviceDate'
  paymentDate?: string; // NOVO: Data de pagamento
  time?: string;
  address?: string;
  value: number;
  status: string;
  description?: string;
  createdAt?: string;  // ✅ ADICIONADO: Para DTSTAMP consistente
}

/**
 * Escapa caracteres especiais para o formato iCalendar
 */
function escapeICSText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
    .substring(0, 1000);
}

/**
 * Formata data para o padrão iCalendar (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Gera um único evento VEVENT para o arquivo iCalendar, com tipo e data específicos
 */
function generateEventForDate(
  service: ServiceForExport,
  eventDate: string,
  eventType: 'Serviço' | 'Pagamento'
): string {
  const eventId = `service-${service.id}-${eventType.toLowerCase()}@workly.com.br`;
  
  const createdAt = service.createdAt 
    ? new Date(service.createdAt)
    : new Date();
  const dtstamp = formatICSDate(createdAt);

  const startDate = new Date(eventDate);
  
  // Para eventos de pagamento, não é necessário um horário específico, pode ser o dia todo ou um horário padrão
  // Para eventos de serviço, usar o horário se disponível, senão padrão
  if (eventType === 'Serviço' && service.time) {
    const [hours, minutes] = service.time.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes), 0);
  } else if (eventType === 'Pagamento') {
    startDate.setHours(9, 0, 0); // Horário padrão para lembrete de pagamento
  } else {
    startDate.setHours(9, 0, 0); // Horário padrão para serviço sem horário definido
  }

  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1h duration

  const summaryPrefix = eventType === 'Pagamento' ? 'Workly: Pagamento de ' : 'Workly: ';
  const description = `Cliente: ${service.clientName}\nServiço: ${service.serviceName}\nValor: R$ ${service.value.toFixed(2)}\nStatus: ${service.status}${service.description ? `\nObservações: ${service.description}` : ''}`;

  return [
    "BEGIN:VEVENT",
    `UID:${eventId}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${escapeICSText(summaryPrefix + service.serviceName + ' - ' + service.clientName)}`,
    `DESCRIPTION:${escapeICSText(description)}`,
    `LOCATION:${escapeICSText(service.address || 'A definir')}`,
    `LAST-MODIFIED:${dtstamp}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT"
  ].join("\r\n");
}

/**
 * Gera o conteúdo de um arquivo .ics com múltiplos serviços, criando eventos para serviço e pagamento.
 */
export function generateBulkICS(services: ServiceForExport[]): string {
  if (services.length === 0) return "";

  let allEvents: string[] = [];

  services.forEach(service => {
    // Evento para a data do serviço
    allEvents.push(generateEventForDate(service, service.serviceDate, 'Serviço'));

    // Evento para a data de pagamento, se existir e for diferente da data do serviço
    if (service.paymentDate && service.paymentDate !== service.serviceDate) {
      allEvents.push(generateEventForDate(service, service.paymentDate, 'Pagamento'));
    }
  });

  const events = allEvents.join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Workly//Workly Organizer//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Workly - Agenda",
    "X-WR-TIMEZONE:America/Sao_Paulo",
    events,
    "END:VCALENDAR"
  ].join("\r\n");
}
