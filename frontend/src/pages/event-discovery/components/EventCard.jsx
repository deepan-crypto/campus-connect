import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const EventCard = ({ event, onRSVP }) => {
  const [rsvpStatus, setRsvpStatus] = useState(event?.userRsvpStatus || null);
  const [rsvpCounts, setRsvpCounts] = useState(event?.rsvpCounts);

  const handleRSVP = (status) => {
    const previousStatus = rsvpStatus;
    setRsvpStatus(status === rsvpStatus ? null : status);
    
    // Update counts optimistically
    const newCounts = { ...rsvpCounts };
    if (previousStatus) {
      newCounts[previousStatus] = Math.max(0, newCounts?.[previousStatus] - 1);
    }
    if (status !== rsvpStatus) {
      newCounts[status] = newCounts?.[status] + 1;
    }
    setRsvpCounts(newCounts);
    
    onRSVP(event?.id, status === rsvpStatus ? null : status);
  };

  const getEventTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'career': return 'bg-primary text-primary-foreground';
      case 'workshop': return 'bg-accent text-accent-foreground';
      case 'cultural': return 'bg-success text-success-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isEventFull = () => {
    return event?.capacity && rsvpCounts?.going >= event?.capacity;
  };

  const totalRSVPs = rsvpCounts?.going + rsvpCounts?.interested;

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-200 overflow-hidden group">
      {/* Event Banner */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={event?.bannerImage}
          alt={event?.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event?.type)}`}>
            {event?.type}
          </span>
        </div>
        {isEventFull() && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-error text-error-foreground">
              Full
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center text-white text-sm">
            <Icon name="Calendar" size={16} className="mr-1" />
            <span className="mr-4">{formatDate(event?.date)}</span>
            <Icon name="Clock" size={16} className="mr-1" />
            <span>{formatTime(event?.date)}</span>
          </div>
        </div>
      </div>
      {/* Event Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-card-foreground mb-2 line-clamp-2">
          {event?.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {event?.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Icon name="MapPin" size={16} className="mr-2 flex-shrink-0" />
            <span className="truncate">{event?.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Icon name="Users" size={16} className="mr-2 flex-shrink-0" />
            <span>
              {totalRSVPs} attending
              {event?.capacity && ` • ${event?.capacity - rsvpCounts?.going} spots left`}
            </span>
          </div>

          {event?.organizer && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Icon name="User" size={16} className="mr-2 flex-shrink-0" />
              <span className="truncate">by {event?.organizer}</span>
            </div>
          )}
        </div>

        {/* RSVP Buttons */}
        <div className="flex space-x-2">
          <Button
            variant={rsvpStatus === 'going' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRSVP('going')}
            disabled={isEventFull() && rsvpStatus !== 'going'}
            className="flex-1"
          >
            <Icon name="Check" size={16} className="mr-1" />
            Going ({rsvpCounts?.going})
          </Button>
          
          <Button
            variant={rsvpStatus === 'interested' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => handleRSVP('interested')}
            className="flex-1"
          >
            <Icon name="Star" size={16} className="mr-1" />
            Interested ({rsvpCounts?.interested})
          </Button>
        </div>

        {/* Tags */}
        {event?.tags && event?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {event?.tags?.slice(0, 3)?.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full"
              >
                #{tag}
              </span>
            ))}
            {event?.tags?.length > 3 && (
              <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                +{event?.tags?.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;