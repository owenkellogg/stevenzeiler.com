/**
 * Utility to generate iCalendar (.ics) files for yoga classes
 */

interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  url: string;
}

/**
 * Formats a date in the iCalendar format (YYYYMMDDTHHmmssZ)
 */
export function formatDateForICS(date: Date): string {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escapes special characters in iCalendar text fields
 */
export function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generates a unique ID for the iCalendar event
 */
export function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}@stevenzeiler.com`;
}

/**
 * Generates the content for an iCalendar (.ics) file
 */
export function generateICSContent(event: CalendarEvent): string {
  const uid = generateUID();
  const now = formatDateForICS(new Date());
  const start = formatDateForICS(event.startTime);
  const end = formatDateForICS(event.endTime);
  
  // Generate alarm for 15 minutes before the class
  const alarmTime = new Date(event.startTime);
  alarmTime.setMinutes(alarmTime.getMinutes() - 15);
  const alarm = formatDateForICS(alarmTime);
  
  // Format the event details with proper escaping
  const title = escapeICSText(event.title);
  const description = escapeICSText(
    `${event.description}\n\nJoin the class: ${event.url}`
  );
  const location = escapeICSText(event.location || 'Online');
  
  // Build the iCalendar content
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StevenZeiler//YogaClasses//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `URL:${event.url}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Your yoga class is starting in 15 minutes',
    `TRIGGER:-PT15M`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Creates and triggers download of the .ics file
 */
export function downloadICSFile(event: CalendarEvent): void {
  if (typeof window === 'undefined') return;
  
  const icsContent = generateICSContent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  
  // Create a safe filename
  const filename = `${event.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.ics`;
  
  // Create a download link and trigger it
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} 