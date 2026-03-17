/**
 * Gerar arquivo iCalendar (.ics) para um evento de serviço
 */
export function generateICSFile(service: any): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const createEvent = (id: string, dateStr: string, eventType: 'Serviço' | 'Pagamento') => {
    const startDate = new Date(dateStr);
    
    if (eventType === 'Serviço' && service.service_time) {
      const [hours, minutes] = service.service_time.split(':');
      startDate.setHours(parseInt(hours), parseInt(minutes), 0);
    } else {
      startDate.setHours(9, 0, 0); // Padrão
    }
    
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const summaryPrefix = eventType === 'Pagamento' ? 'Workly: Pagamento de ' : 'Workly: ';
    const desc = `Cliente: ${service.client_name}\nServiço: ${service.service_type}\nValor: R$ ${(service.value || 0).toFixed(2)}\nStatus: ${service.status}${service.notes ? `\nObservações: ${service.notes}` : ''}`;

    return [
      "BEGIN:VEVENT",
      `UID:service-${id}-${eventType.toLowerCase()}@workly.com.br`,
      `DTSTAMP:${now}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${escapeICSText(summaryPrefix + service.service_type + ' - ' + service.client_name)}`,
      `DESCRIPTION:${escapeICSText(desc)}`,
      `LOCATION:${escapeICSText(service.service_address || 'A definir')}`,
      "STATUS:CONFIRMED",
      "END:VEVENT"
    ].join("\r\n");
  };

  const serviceEvent = createEvent(service.id, service.service_date, 'Serviço');
  const paymentEvent = (service.payment_date && service.payment_date !== service.service_date)
    ? "\r\n" + createEvent(service.id, service.payment_date, 'Pagamento')
    : "";

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Workly//Workly//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Workly - Agenda
X-WR-TIMEZONE:America/Sao_Paulo
${serviceEvent}${paymentEvent}
END:VCALENDAR`;
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
