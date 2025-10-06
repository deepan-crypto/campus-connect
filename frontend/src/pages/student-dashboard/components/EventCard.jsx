import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EventCard = ({ event, onRSVP }) => {
  const { user } = useAuth();
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Find user's RSVP status from the event_rsvps array
    const userRsvp = event?.event_rsvps?.find(rsvp => rsvp.user_id === user?.id);
    setRsvpStatus(userRsvp?.status || null);
  }, [event?.event_rsvps, user?.id]);

  const handleRSVP = async (status) => {
    setIsLoading(true);
    try {
      await onRSVP(event?.id, status);
      setRsvpStatus(status);
    } catch (error) {
      console.error('RSVP failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date?.getDate(),
      month: date?.toLocaleDateString('en-US', { month: 'short' }),
      time: date?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getEventTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'career': return 'bg-primary text-primary-foreground';
      case 'workshop': return 'bg-accent text-accent-foreground';
      case 'cultural': return 'bg-success text-success-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getRSVPButtonVariant = (status) => {
    if (rsvpStatus === status) {
      switch (status) {
        case 'going': return 'success';
        case 'interested': return 'warning';
        case 'not_going': return 'destructive';
        default: return 'outline';
      }
    }
    return 'outline';
  };

  const { day, month, time } = formatDate(event?.start_date);

  const attendeeCount = event?.event_rsvps?.filter(rsvp => rsvp.status === 'going')?.length || 0;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-elevation-2 transition-all duration-200">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={event?.banner_image_url || '/assets/images/no_image.png'}
          alt={event?.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-2 text-center">
          <div className="text-2xl font-bold text-card-foreground">{day}</div>
          <div className="text-xs text-muted-foreground uppercase">{month}</div>
        </div>
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event?.event_type)}`}>
            {event?.event_type}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-card-foreground mb-1 line-clamp-2">
              {event?.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center space-x-1">
                <Icon name="Clock" size={14} />
                <span>{time}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="MapPin" size={14} />
                <span>{event?.location}</span>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {event?.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Users" size={14} />
            <span>{attendeeCount} attending</span>
            {event?.capacity && (
              <>
                <span>•</span>
                <span>{event.capacity - attendeeCount} spots left</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {event?.tags?.slice(0, 2)?.map((tag, index) => (
              <span key={index} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={getRSVPButtonVariant('going')}
              size="sm"
              onClick={() => handleRSVP('going')}
              disabled={isLoading}
              iconName="Check"
              iconPosition="left"
            >
              Going
            </Button>
            <Button
              variant={getRSVPButtonVariant('interested')}
              size="sm"
              onClick={() => handleRSVP('interested')}
              disabled={isLoading}
              iconName="Star"
              iconPosition="left"
            >
              Interested
            </Button>
            <Button
              variant={getRSVPButtonVariant('not_going')}
              size="sm"
              onClick={() => handleRSVP('not_going')}
              disabled={isLoading}
              iconName="X"
              iconPosition="left"
            >
              Can't Go
            </Button>
          </div>
          <Link to={`/event-discovery?id=${event?.id}`}>
            <Button variant="ghost" size="sm" iconName="ExternalLink">
              Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;