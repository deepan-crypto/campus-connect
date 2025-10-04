import React from 'react';
import Icon from '../../../components/AppIcon';
import MentorCard from './MentorCard';

const RecommendedMentors = ({ mentors, onRequestMentorship }) => {
  if (!mentors || mentors?.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg">
          <Icon name="Sparkles" size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Recommended for You</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered suggestions based on your profile and career interests
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors?.map((mentor) => (
          <div key={mentor?.id} className="relative">
            <div className="absolute -top-2 -right-2 z-10">
              <div className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <Icon name="Sparkles" size={12} />
                <span>Recommended</span>
              </div>
            </div>
            <MentorCard
              mentor={mentor}
              onRequestMentorship={onRequestMentorship}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedMentors;