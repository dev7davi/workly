/**
 * Gerar arquivo iCalendar (.ics) para um evento de serviço
 */
export function generateICSFile(service: any): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const formatICSDateTime = (date: Date, includeTime: boolean = true): string => {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    if (!includeTime) return `${year}${month}${day}`;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  };

  const createEvent = (id: string, dateStr: string, eventType: 'Serviço' | 'Pagamento') => {
    const eventId = `service-${id}-${eventType.toLowerCase()}@workly.com.br`;
    
    // Parse a data como local para evitar o deslocamento
    const localDate = new Date(dateStr + 'T00:00:00');
    let startDate = new Date(localDate);
    let includeTime = true;
    
    if (eventType === 'Serviço' && service.service_time) {
      const [hours, minutes] = service.service_time.split(':');
      startDate.setHours(parseInt(hours), parseInt(minutes), 0);
    } else if (eventType === 'Pagamento') {
      startDate.setHours(9, 0, 0); // Padrão 09:00
    } else {
      includeTime = false; // Dia inteiro
    }
    
    let endDate = new Date(startDate.getTime());
    if (includeTime) {
      endDate.setHours(startDate.getHours() + 1);
    } else {
      endDate.setDate(startDate.getDate() + 1);
    }

    const dtstartValue = includeTime 
      ? `DTSTART;TZID=America/Sao_Paulo:${formatICSDateTime(startDate, true)}`
      : `DTSTART;VALUE=DATE:${formatICSDateTime(startDate, false)}`;

    const dtendValue = includeTime
      ? `DTEND;TZID=America/Sao_Paulo:${formatICSDateTime(endDate, true)}`
      : `DTEND;VALUE=DATE:${formatICSDateTime(endDate, false)}`;

    const summaryPrefix = eventType === 'Pagamento' ? 'Workly: Pagamento de ' : 'Workly: ';
    const desc = `Cliente: ${service.client_name}\nServiço: ${service.service_type}\nValor: R$ ${(service.value || 0).toFixed(2)}\nStatus: ${service.status}${service.notes ? `\nObservações: ${service.notes}` : ''}`;

    return [
      "BEGIN:VEVENT",
      `UID:${eventId}`,
      `DTSTAMP:${now}`,
      dtstartValue,
      dtendValue,
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
