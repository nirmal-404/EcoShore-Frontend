import { useState, useMemo } from 'react';
import {
  format,
  isSameDay,
  isToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

function EventCalendar({ events = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Color palette for beaches
  const beachColors = {
    default: 'bg-blue-100 border-blue-300 text-blue-900',
    alternate: [
      'bg-purple-100 border-purple-300 text-purple-900',
      'bg-green-100 border-green-300 text-green-900',
      'bg-orange-100 border-orange-300 text-orange-900',
      'bg-pink-100 border-pink-300 text-pink-900',
      'bg-teal-100 border-teal-300 text-teal-900',
    ],
  };

  // Assign colors to beaches
  const beachColorMap = useMemo(() => {
    const map = {};
    const beaches = [
      ...new Set(events.map((e) => e.beachId?._id || e.beachId)),
    ];
    beaches.forEach((beachId, index) => {
      map[beachId] =
        beachColors.alternate[index % beachColors.alternate.length];
    });
    return map;
  }, [events]);

  // Get all days in month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // Helper to check for conflicts
  const getConflicts = (day) => {
    const dayEvents = events.filter((e) =>
      isSameDay(new Date(e.startDate), day)
    );

    // Group events by beach
    const byBeach = {};
    dayEvents.forEach((event) => {
      const beachId = event.beachId?._id || event.beachId;
      if (!byBeach[beachId]) byBeach[beachId] = [];
      byBeach[beachId].push(event);
    });

    // Find conflicts (multiple events on same beach, overlapping times)
    const conflicts = [];
    Object.entries(byBeach).forEach(([beachId, beachEvents]) => {
      if (beachEvents.length > 1) {
        // Check for time overlap
        for (let i = 0; i < beachEvents.length; i++) {
          for (let j = i + 1; j < beachEvents.length; j++) {
            const e1Start = new Date(beachEvents[i].startDate).getTime();
            const e1End = new Date(beachEvents[i].endDate).getTime();
            const e2Start = new Date(beachEvents[j].startDate).getTime();
            const e2End = new Date(beachEvents[j].endDate).getTime();

            if (e1Start < e2End && e1End > e2Start) {
              conflicts.push({
                beach: beachEvents[i].beachId?.name || 'Beach',
                event1: beachEvents[i].title,
                event2: beachEvents[j].title,
              });
            }
          }
        }
      }
    });

    return conflicts;
  };

  // Get events for a specific day
  const getEventsForDay = (day) => {
    return events.filter((e) => isSameDay(new Date(e.startDate), day));
  };

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Conflict Warning */}
      {events.some((e) => getConflicts(new Date(e.startDate)).length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">
              Scheduling Conflicts Detected
            </h3>
            <p className="text-sm text-red-800 mt-1">
              Multiple events scheduled at the same time on the same beach.
              Please review and reschedule.
            </p>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 bg-gray-100 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="p-3 text-sm font-semibold text-center text-gray-700"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const dayEvents = getEventsForDay(day);
            const conflicts = getConflicts(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday_ = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-32 border p-2 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday_ ? 'bg-blue-50' : ''}`}
              >
                {/* Date number */}
                <div
                  className={`text-sm font-semibold mb-1 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}
                >
                  {format(day, 'd')}
                </div>

                {/* Conflict indicator */}
                {conflicts.length > 0 && (
                  <div className="mb-1">
                    <div className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                      <AlertCircle className="w-3 h-3" />
                      {conflicts.length} conflict
                      {conflicts.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => {
                    const beachId = event.beachId?._id || event.beachId;
                    const colorClass =
                      beachColorMap[beachId] || beachColors.default;
                    return (
                      <div
                        key={event._id}
                        className={`text-xs p-1 rounded border cursor-pointer hover:shadow-md transition-shadow ${colorClass}`}
                        title={`${event.title}\n${event.beachId?.name || 'Beach'}\n${format(
                          new Date(event.startDate),
                          'HH:mm'
                        )} - ${format(new Date(event.endDate), 'HH:mm')}`}
                      >
                        <div className="font-semibold truncate">
                          {event.title}
                        </div>
                        <div className="text-xs opacity-75 truncate">
                          {format(new Date(event.startDate), 'HH:mm')}
                        </div>
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-600 p-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Beach Color Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(beachColorMap).map(([beachId, colorClass]) => {
            const beach = events.find(
              (e) => (e.beachId?._id || e.beachId) === beachId
            )?.beachId;
            return (
              <div key={beachId} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border ${colorClass}`} />
                <span className="text-sm">{beach?.name || 'Beach'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{events.length}</div>
          <div className="text-sm text-muted-foreground">Total Events</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {new Set(events.map((e) => e.beachId?._id || e.beachId)).size}
          </div>
          <div className="text-sm text-muted-foreground">Beaches</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-red-600">
            {
              events.filter(
                (e) => getConflicts(new Date(e.startDate)).length > 0
              ).length
            }
          </div>
          <div className="text-sm text-muted-foreground">Conflicted Events</div>
        </Card>
      </div>
    </div>
  );
}

export default EventCalendar;
