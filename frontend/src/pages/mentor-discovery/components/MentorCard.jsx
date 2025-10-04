import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const MentorCard = ({ mentor, onRequestMentorship }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMatchDetails, setShowMatchDetails] = useState(false);

  const getAvailabilityColor = (status) => {
    switch (status) {
      case 'available': return 'text-success bg-success/10';
      case 'limited': return 'text-warning bg-warning/10';
      case 'unavailable': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getAvailabilityText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'limited': return 'Limited Spots';
      case 'unavailable': return 'Full';
      default: return 'Unknown';
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-success bg-success/10';
    if (score >= 60) return 'text-warning bg-warning/10';
    return 'text-error bg-error/10';
  };

  return (
    <div 
      className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation-2 transition-all duration-200 hover-elevation"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with Profile and Match Score */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Image
              src={mentor?.avatar}
              alt={mentor?.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className={`absolute -bottom-1 -right-1 px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(mentor?.availability)}`}>
              {mentor?.availability === 'available' ? (
                <Icon name="CheckCircle" size={12} className="inline mr-1" />
              ) : mentor?.availability === 'limited' ? (
                <Icon name="Clock" size={12} className="inline mr-1" />
              ) : (
                <Icon name="XCircle" size={12} className="inline mr-1" />
              )}
              {mentor?.availableSlots || 0}
            </div>
          </div>
          <div className="flex-1">
            <Link 
              to="/user-profile" 
              className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
            >
              {mentor?.name}
            </Link>
            <p className="text-sm text-muted-foreground">{mentor?.currentPosition}</p>
            <p className="text-sm text-muted-foreground font-medium">{mentor?.company}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div 
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${getMatchScoreColor(mentor?.matchScore)}`}
            onMouseEnter={() => setShowMatchDetails(true)}
            onMouseLeave={() => setShowMatchDetails(false)}
          >
            <Icon name="Target" size={14} className="mr-1" />
            {mentor?.matchScore}% Match
          </div>
          {showMatchDetails && (
            <div className="absolute z-10 mt-2 p-3 bg-popover border border-border rounded-lg shadow-elevation-3 text-left w-64 right-0">
              <h4 className="font-medium text-popover-foreground mb-2">Match Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Skills Overlap:</span>
                  <span className="text-popover-foreground">{mentor?.matchDetails?.skillsOverlap}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Industry Match:</span>
                  <span className="text-popover-foreground">{mentor?.matchDetails?.industryMatch}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Career Stage:</span>
                  <span className="text-popover-foreground">{mentor?.matchDetails?.careerStage}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Graduation Year and Department */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Icon name="GraduationCap" size={16} />
          <span>Class of {mentor?.graduationYear}</span>
        </div>
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Icon name="Building" size={16} />
          <span>{mentor?.department}</span>
        </div>
      </div>
      {/* Bio */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {mentor?.bio}
      </p>
      {/* Skills */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {mentor?.skills?.slice(0, 4)?.map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
            >
              {skill}
            </span>
          ))}
          {mentor?.skills?.length > 4 && (
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full font-medium">
              +{mentor?.skills?.length - 4} more
            </span>
          )}
        </div>
      </div>
      {/* Stats */}
      <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{mentor?.menteeCount}</div>
          <div className="text-xs text-muted-foreground">Mentees</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{mentor?.rating}</div>
          <div className="text-xs text-muted-foreground flex items-center">
            <Icon name="Star" size={12} className="mr-1 fill-current text-warning" />
            Rating
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{mentor?.responseTime}</div>
          <div className="text-xs text-muted-foreground">Response</div>
        </div>
      </div>
      {/* Availability Status */}
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(mentor?.availability)}`}>
          <div className={`w-2 h-2 rounded-full ${mentor?.availability === 'available' ? 'bg-success' : mentor?.availability === 'limited' ? 'bg-warning' : 'bg-error'}`} />
          <span>{getAvailabilityText(mentor?.availability)}</span>
        </div>
        {mentor?.nextAvailable && (
          <div className="text-xs text-muted-foreground">
            Next available: {mentor?.nextAvailable}
          </div>
        )}
      </div>
      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          disabled={mentor?.availability === 'unavailable'}
          onClick={() => onRequestMentorship(mentor)}
          iconName="UserPlus"
          iconPosition="left"
        >
          {mentor?.availability === 'unavailable' ? 'Unavailable' : 'Request Mentorship'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="MessageCircle"
          onClick={() => {/* Handle message */}}
        >
          Message
        </Button>
      </div>
    </div>
  );
};

export default MentorCard;