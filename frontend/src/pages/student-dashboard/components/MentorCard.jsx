import React from 'react';
import { Link } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MentorCard = ({ mentor, onRequestMentorship }) => {
  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-accent';
    return 'text-secondary';
  };

  const getMatchScoreBg = (score) => {
    if (score >= 90) return 'bg-success/10';
    if (score >= 70) return 'bg-accent/10';
    return 'bg-secondary/10';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation-2 transition-all duration-200">
      <div className="flex items-start space-x-4">
        <div className="relative flex-shrink-0">
          <Image
            src={mentor?.avatar}
            alt={mentor?.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className={`absolute -top-1 -right-1 px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreBg(mentor?.matchScore)} ${getMatchScoreColor(mentor?.matchScore)}`}>
            {mentor?.matchScore}%
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground truncate">{mentor?.name}</h3>
              <p className="text-muted-foreground text-sm">{mentor?.title}</p>
              <p className="text-muted-foreground text-xs">{mentor?.company}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
            <div className="flex items-center space-x-1">
              <Icon name="GraduationCap" size={14} />
              <span>Class of {mentor?.graduationYear}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="MapPin" size={14} />
              <span>{mentor?.location}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Skills match:</p>
            <div className="flex flex-wrap gap-1">
              {mentor?.matchingSkills?.slice(0, 3)?.map((skill, index) => (
                <span key={index} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  {skill}
                </span>
              ))}
              {mentor?.matchingSkills?.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{mentor?.matchingSkills?.length - 3} more
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Icon name="Star" size={14} className="text-accent" />
              <span>{mentor?.rating} ({mentor?.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Link to={`/mentor-discovery?id=${mentor?.id}`}>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </Link>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => onRequestMentorship(mentor?.id)}
                iconName="UserPlus"
                iconPosition="left"
              >
                Request
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorCard;