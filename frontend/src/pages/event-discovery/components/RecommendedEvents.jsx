import React from 'react';
import Icon from '../../../components/AppIcon';
import EventCard from './EventCard';

const RecommendedEvents = ({ events, onRSVP }) => {
  if (!events || events?.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Sparkles" size={20} className="text-accent" />
          <h2 className="text-xl font-semibold text-foreground">Recommended for You</h2>
        </div>
        <button className="text-sm text-primary hover:text-primary/80 font-medium">
          View All
        </button>
      </div>
      <p className="text-muted-foreground text-sm mb-4">
        Based on your interests and past event attendance
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((event) => (
          <div key={event?.id} className="relative">
            <EventCard event={event} onRSVP={onRSVP} />
            {/* Recommendation Badge */}
            <div className="absolute -top-2 -right-2 z-10">
              <div className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <Icon name="Sparkles" size={12} />
                <span>{event?.matchScore}% match</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedEvents;