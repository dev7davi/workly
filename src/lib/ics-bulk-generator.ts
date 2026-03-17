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
 * Formata data para o padrão iCalendar (YYYYMMDDTHHMMSS) sem fuso horário explícito (floating time)
 * ou com TZID se for um evento com hora específica.
 */
function formatICSDateTime(date: Date, includeTime: boolean = true): string {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  if (!includeTime) {
    return `${year}${month}${day}`;
  }

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Gera um único evento VEVENT para o arquivo iCalendar, com tipo e data específicos
 */
function generateEventForDate(
  service: ServiceForExport,
  eventDateStr: string,
  eventType: 'Serviço' | 'Pagamento'
): string {
  const eventId = `service-${service.id}-${eventType.toLowerCase()}@workly.com.br`;
  
  const createdAt = service.createdAt 
    ? new Date(service.createdAt)
    : new Date();
  const dtstamp = formatICSDateTime(createdAt, true) + 'Z'; // DTSTAMP deve ser sempre UTC

  // Parse a data como local para evitar o deslocamento inicial
  const localDate = new Date(eventDateStr + 'T00:00:00'); 
  let startDate = new Date(localDate);
  let includeTime = true;

  if (eventType === 'Serviço' && service.time) {
    const [hours, minutes] = service.time.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes), 0);
  } else if (eventType === 'Pagamento') {
    startDate.setHours(9, 0, 0); // Horário padrão para lembrete de pagamento
  } else {
    // Se não há horário específico, tratar como evento de dia inteiro
    includeTime = false;
  }

  // Para eventos de dia inteiro, DTSTART e DTEND devem ser apenas a data (sem T e Z)
  const dtstartValue = includeTime 
    ? `DTSTART;TZID=America/Sao_Paulo:${formatICSDateTime(startDate, true)}`
    : `DTSTART;VALUE=DATE:${formatICSDateTime(startDate, false)}`;

  // Para eventos de dia inteiro, o DTEND é o dia seguinte
  let endDate = new Date(startDate.getTime());
  if (includeTime) {
    endDate.setHours(startDate.getHours() + 1); // 1h de duração para eventos com hora
  } else {
    endDate.setDate(startDate.getDate() + 1); // Fim do dia para eventos de dia inteiro
  }

  const dtendValue = includeTime
    ? `DTEND;TZID=America/Sao_Paulo:${formatICSDateTime(endDate, true)}`
    : `DTEND;VALUE=DATE:${formatICSDateTime(endDate, false)}`;

  const summaryPrefix = eventType === 'Pagamento' ? 'Workly: Pagamento de ' : 'Workly: ';
  const description = `Cliente: ${service.clientName}\nServiço: ${service.serviceName}\nValor: R$ ${service.value.toFixed(2)}\nStatus: ${service.status}${service.description ? `\nObservações: ${service.description}` : ''}`;

  return [
    "BEGIN:VEVENT",
    `UID:${eventId}`,
    `DTSTAMP:${dtstamp}`,
    dtstartValue,
    dtendValue,
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
