import React, { useState, useEffect } from 'react';
import EventCard from './EventCard';
import Icon from '../../../components/AppIcon';

const EventGrid = ({ events, onRSVP, loading }) => {
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const EVENTS_PER_PAGE = 12;

  useEffect(() => {
    // Reset displayed events when events prop changes
    setDisplayedEvents(events?.slice(0, EVENTS_PER_PAGE));
    setHasMore(events?.length > EVENTS_PER_PAGE);
  }, [events]);

  const loadMoreEvents = () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    
    // Simulate loading delay
    setTimeout(() => {
      const currentLength = displayedEvents?.length;
      const nextEvents = events?.slice(currentLength, currentLength + EVENTS_PER_PAGE);
      
      setDisplayedEvents(prev => [...prev, ...nextEvents]);
      setHasMore(currentLength + nextEvents?.length < events?.length);
      setLoadingMore(false);
    }, 500);
  };

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement?.scrollTop
        >= document.documentElement?.offsetHeight - 1000
      ) {
        loadMoreEvents();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayedEvents, hasMore, loadingMore, loadMoreEvents]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 })?.map((_, index) => (
          <EventCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (events?.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Calendar" size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No events found</h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your filters or search terms to find more events.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedEvents?.map((event) => (
          <EventCard
            key={event?.id}
            event={event}
            onRSVP={onRSVP}
          />
        ))}
      </div>
      {/* Load More Indicator */}
      {loadingMore && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 3 })?.map((_, index) => (
            <EventCardSkeleton key={`loading-${index}`} />
          ))}
        </div>
      )}
      {/* End of Results */}
      {!hasMore && displayedEvents?.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            You've reached the end of the results. Showing {displayedEvents?.length} of {events?.length} events.
          </p>
        </div>
      )}
    </div>
  );
};

// Skeleton component for loading states
const EventCardSkeleton = () => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 overflow-hidden animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-48 bg-muted"></div>
      
      {/* Content Skeleton */}
      <div className="p-4">
        <div className="h-6 bg-muted rounded mb-2"></div>
        <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
        
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-muted rounded w-2/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        
        <div className="flex space-x-2">
          <div className="h-8 bg-muted rounded flex-1"></div>
          <div className="h-8 bg-muted rounded flex-1"></div>
        </div>
      </div>
    </div>
  );
};

export default EventGrid;