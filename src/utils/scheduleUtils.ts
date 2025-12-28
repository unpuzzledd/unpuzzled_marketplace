import { WeeklyScheduleEntry, ScheduleException } from '../types/database';

export interface ClassInstance {
  date: Date;
  day: string;
  from_time: string;
  to_time: string;
  exception?: ScheduleException;
}

export interface MergedSchedule {
  date: Date;
  day: string;
  from_time: string;
  to_time: string;
  status: 'normal' | 'unavailable' | 'time_changed' | 'moved';
  original_time?: string;
  exception?: ScheduleException;
}

/**
 * Convert 24-hour time format to 12-hour format with AM/PM
 */
export function formatScheduleTime(time: string): string {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Format a single schedule entry
 */
export function formatScheduleEntry(entry: WeeklyScheduleEntry): string {
  const dayName = getDayName(entry.day);
  const fromTime = formatScheduleTime(entry.from_time);
  const toTime = formatScheduleTime(entry.to_time);
  return `${dayName}: ${fromTime} - ${toTime}`;
}

/**
 * Create a compact summary of the schedule
 */
export function formatScheduleSummary(schedule: WeeklyScheduleEntry[]): string {
  if (!schedule || schedule.length === 0) return 'No schedule';
  
  const dayAbbreviations: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  };
  
  const days = schedule.map(e => dayAbbreviations[e.day] || e.day).join(', ');
  const firstTime = schedule[0] ? `${formatScheduleTime(schedule[0].from_time)}-${formatScheduleTime(schedule[0].to_time)}` : '';
  return `${days}: ${firstTime}`;
}

/**
 * Get formatted day name
 */
export function getDayName(day: string): string {
  const dayNames: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };
  return dayNames[day.toLowerCase()] || day;
}

/**
 * Get day name from a Date object
 */
export function getDayOfWeek(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

/**
 * Check if a date is within a date range
 */
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate;
}

/**
 * Generate list of upcoming classes from weekly schedule
 */
export function generateUpcomingClasses(
  weeklySchedule: WeeklyScheduleEntry[] | null | undefined,
  startDate: string,
  endDate: string
): ClassInstance[] {
  if (!weeklySchedule || weeklySchedule.length === 0) {
    return [];
  }

  const classes: ClassInstance[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from today or batch start date, whichever is later
  const currentDate = new Date(start > today ? start : today);
  currentDate.setHours(0, 0, 0, 0);

  // Generate classes up to end date
  while (currentDate <= end) {
    const dayOfWeek = getDayOfWeek(currentDate).toLowerCase();
    
    // Find matching schedule entry for this day
    const scheduleEntry = weeklySchedule.find(
      entry => entry.day.toLowerCase() === dayOfWeek
    );

    if (scheduleEntry) {
      classes.push({
        date: new Date(currentDate),
        day: dayOfWeek,
        from_time: scheduleEntry.from_time,
        to_time: scheduleEntry.to_time
      });
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return classes;
}

/**
 * Merge weekly schedule with exceptions
 */
export function mergeScheduleWithExceptions(
  weeklySchedule: WeeklyScheduleEntry[] | null | undefined,
  exceptions: ScheduleException[],
  startDate: string,
  endDate: string
): MergedSchedule[] {
  const classes = generateUpcomingClasses(weeklySchedule, startDate, endDate);
  
  return classes.map(classInstance => {
    // Find exception for this date
    const exception = exceptions.find(
      exc => exc.exception_date === classInstance.date.toISOString().split('T')[0]
    );

    if (!exception) {
      return {
        ...classInstance,
        status: 'normal' as const
      };
    }

    // Apply exception
    if (exception.action === 'cancelled') {
      return {
        ...classInstance,
        status: 'unavailable' as const,
        exception
      };
    }

    if (exception.action === 'time_changed') {
      return {
        date: classInstance.date,
        day: classInstance.day,
        from_time: exception.from_time || classInstance.from_time,
        to_time: exception.to_time || classInstance.to_time,
        status: 'time_changed' as const,
        original_time: `${formatScheduleTime(classInstance.from_time)} - ${formatScheduleTime(classInstance.to_time)}`,
        exception
      };
    }

    if (exception.action === 'moved') {
      return {
        date: classInstance.date,
        day: exception.new_day || classInstance.day,
        from_time: exception.from_time || classInstance.from_time,
        to_time: exception.to_time || classInstance.to_time,
        status: 'moved' as const,
        original_time: `${getDayName(classInstance.day)}: ${formatScheduleTime(classInstance.from_time)} - ${formatScheduleTime(classInstance.to_time)}`,
        exception
      };
    }

    return {
      ...classInstance,
      status: 'normal' as const
    };
  });
}

