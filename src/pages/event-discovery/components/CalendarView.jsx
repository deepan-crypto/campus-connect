import React, { useState } from 'react';

import Button from '../../../components/ui/Button';

const CalendarView = ({ events, onRSVP }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)?.getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)?.getDay();
  };

  const getEventsForDate = (date) => {
    const dateString = date?.toISOString()?.split('T')?.[0];
    return events?.filter(event => {
      const eventDate = new Date(event.date)?.toISOString()?.split('T')?.[0];
      return eventDate === dateString;
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate?.setMonth(currentDate?.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days?.push(
        <div key={`empty-${i}`} className="h-24 bg-muted/30 border border-border"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date?.toDateString() === today?.toDateString();
      const isPast = date < today && !isToday;

      days?.push(
        <div
          key={day}
          className={`h-24 border border-border p-1 overflow-hidden ${
            isPast ? 'bg-muted/50' : 'bg-card hover:bg-muted/30'
          } transition-colors`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday 
              ? 'text-primary font-semibold' 
              : isPast 
                ? 'text-muted-foreground' 
                : 'text-foreground'
          }`}>
            {day}
            {isToday && (
              <span className="ml-1 w-2 h-2 bg-primary rounded-full inline-block"></span>
            )}
          </div>
          
          <div className="space-y-1">
            {dayEvents?.slice(0, 2)?.map((event, index) => (
              <div
                key={event?.id}
                className={`text-xs p-1 rounded truncate cursor-pointer ${
                  event?.type === 'career' ?'bg-primary/20 text-primary' 
                    : event?.type === 'workshop' ?'bg-accent/20 text-accent' :'bg-success/20 text-success'
                }`}
                title={event?.title}
              >
                {event?.title}
              </div>
            ))}
            {dayEvents?.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{dayEvents?.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">
          {monthNames?.[currentDate?.getMonth()]} {currentDate?.getFullYear()}
        </h2>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth(-1)}
            iconName="ChevronLeft"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth(1)}
            iconName="ChevronRight"
          />
        </div>
      </div>
      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {dayNames?.map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground border-b border-border"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-0">
          {renderCalendarDays()}
        </div>
      </div>
      {/* Legend */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary/20 rounded"></div>
            <span className="text-muted-foreground">Career Events</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-accent/20 rounded"></div>
            <span className="text-muted-foreground">Workshops</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success/20 rounded"></div>
            <span className="text-muted-foreground">Cultural Events</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;