import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const EventCard = ({ event, onRSVP, onViewDetails }) => {
  const getRSVPColor = (status) => {
    switch (status) {
      case 'going': return 'bg-success text-success-foreground';
      case 'interested': return 'bg-warning text-warning-foreground';
      case 'not-going': return 'bg-error text-error-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getEventTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'networking': return 'bg-primary/10 text-primary';
      case 'workshop': return 'bg-accent/10 text-accent';
      case 'career': return 'bg-success/10 text-success';
      case 'cultural': return 'bg-secondary/10 text-secondary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date)?.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isEventSoon = (date) => {
    const eventDate = new Date(date);
    const now = new Date();
    const diffHours = (eventDate - now) / (1000 * 60 * 60);
    return diffHours <= 24 && diffHours > 0;
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-elevation-2 transition-all duration-200">
      <div className="relative">
        <Image
          src={event?.bannerImage}
          alt={event?.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event?.type)}`}>
            {event?.type}
          </span>
        </div>
        {isEventSoon(event?.date) && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-error text-error-foreground rounded-full text-xs font-medium animate-pulse">
              Starting Soon
            </span>
          </div>
        )}
        {event?.rsvpStatus && (
          <div className="absolute bottom-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRSVPColor(event?.rsvpStatus)}`}>
              {event?.rsvpStatus === 'going' ? 'Going' : 
               event?.rsvpStatus === 'interested' ? 'Interested' : 'Not Going'}
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-foreground text-lg leading-tight">{event?.title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(event?.id)}
            iconName="ExternalLink"
            iconSize={16}
          />
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{event?.description}</p>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-3">
            <Icon name="Calendar" size={16} className="text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{formatDate(event?.date)}</p>
              <p className="text-xs text-muted-foreground">{formatTime(event?.date)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Icon name="MapPin" size={16} className="text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{event?.location}</p>
              {event?.isVirtual && (
                <p className="text-xs text-primary">Virtual Event</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Icon name="Users" size={16} className="text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm text-foreground">
                <span className="font-medium">{event?.attendeesCount}</span> attending
                {event?.capacity && (
                  <span className="text-muted-foreground"> • {event?.capacity - event?.attendeesCount} spots left</span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <Image
            src={event?.organizer?.avatar}
            alt={event?.organizer?.name}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-sm text-muted-foreground">
            Organized by <span className="font-medium text-foreground">{event?.organizer?.name}</span>
          </span>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="default"
            size="sm"
            fullWidth
            onClick={() => onRSVP(event?.id, 'going')}
            iconName="Check"
            iconSize={16}
            disabled={event?.rsvpStatus === 'going'}
          >
            {event?.rsvpStatus === 'going' ? 'Going' : 'RSVP Going'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRSVP(event?.id, 'interested')}
            iconName="Star"
            iconSize={16}
            disabled={event?.rsvpStatus === 'interested'}
          >
            {event?.rsvpStatus === 'interested' ? 'Interested' : 'Interested'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;