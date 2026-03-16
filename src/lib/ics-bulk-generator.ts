/**
 * Interface para os dados do serviço formatados para exportação
 */
export interface ServiceForExport {
  id: string;
  serviceName: string;
  clientName: string;
  clientEmail?: string;
  date: string;
  time?: string;
  address?: string;
  value: number;
  status: string;
  description?: string;
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
 * Gera um único evento VEVENT para o arquivo iCalendar
 */
function generateSingleEvent(service: ServiceForExport): string {
  const eventId = `service-${service.id}@workly.com.br`;
  const now = formatICSDate(new Date());

  const startDate = new Date(service.date);
  if (service.time) {
    const [hours, minutes] = service.time.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes), 0);
  } else {
    startDate.setHours(9, 0, 0); // Default 09:00
  }

  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1h duration

  const description = `Cliente: ${service.clientName}\\nServiço: ${service.serviceName}\\nValor: R$ ${service.value.toFixed(2)}\\nStatus: ${service.status}${service.description ? `\\nObservações: ${service.description}` : ''}`;

  return [
    "BEGIN:VEVENT",
    `UID:${eventId}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:Workly: ${escapeICSText(service.serviceName)} - ${escapeICSText(service.clientName)}`,
    `DESCRIPTION:${escapeICSText(description)}`,
    `LOCATION:${escapeICSText(service.address || 'A definir')}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT"
  ].join("\r\n");
}

/**
 * Gera o conteúdo de um arquivo .ics com múltiplos serviços
 */
export function generateBulkICS(services: ServiceForExport[]): string {
  if (services.length === 0) return "";

  const events = services.map(generateSingleEvent).join("\r\n");

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
