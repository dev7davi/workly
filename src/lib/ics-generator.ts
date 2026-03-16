/**
 * Gerar arquivo iCalendar (.ics) para um evento de serviço
 */
export function generateICSFile(service: any): string {
  const eventId = `service-${service.id}@workly.com.br`;
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const startDate = new Date(service.service_date);
  const [hours, minutes] = (service.service_time || '09:00').split(':');
  startDate.setHours(parseInt(hours), parseInt(minutes), 0);
  
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 1);

  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Workly//Workly//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Workly - Agenda
X-WR-TIMEZONE:America/Sao_Paulo
BEGIN:VEVENT
UID:${eventId}
DTSTAMP:${now}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${escapeICSText(service.service_type || 'Serviço')}
DESCRIPTION:${escapeICSText(
    `Cliente: ${service.client_name || 'Desconhecido'}\nServiço: ${service.service_type || 'N/A'}\nValor: R$ ${(service.value || 0).toFixed(2)}`
  )}
LOCATION:${escapeICSText(service.service_address || 'A definir')}
ORGANIZER;CN=Workly:mailto:noreply@workly.com.br
ATTENDEE:mailto:${service.client_email || 'noreply@workly.com.br'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

function escapeICSText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
    .substring(0, 1000);
}
