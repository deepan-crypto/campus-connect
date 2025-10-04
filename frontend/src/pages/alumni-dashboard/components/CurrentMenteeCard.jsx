import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const CurrentMenteeCard = ({ mentee, onMessage, onViewProgress }) => {
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-success';
    if (progress >= 60) return 'bg-warning';
    if (progress >= 40) return 'bg-primary';
    return 'bg-muted-foreground';
  };

  const getLastActivityColor = (hours) => {
    if (hours <= 24) return 'text-success';
    if (hours <= 72) return 'text-warning';
    return 'text-muted-foreground';
  };

  const formatLastActivity = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Active now';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:shadow-elevation-2 transition-all duration-200">
      <div className="flex items-start space-x-4">
        <div className="relative flex-shrink-0">
          <Image
            src={mentee?.avatar}
            alt={mentee?.name}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
            mentee?.isOnline ? 'bg-success' : 'bg-muted-foreground'
          }`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{mentee?.name}</h3>
              <p className="text-muted-foreground text-sm">{mentee?.department} • {mentee?.year}</p>
              <p className={`text-xs ${getLastActivityColor(mentee?.lastActivityHours)}`}>
                Last active: {formatLastActivity(mentee?.lastActivity)}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMessage(mentee?.id)}
                iconName="MessageCircle"
                iconSize={16}
              >
                Message
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewProgress(mentee?.id)}
                iconName="TrendingUp"
                iconSize={16}
              >
                Progress
              </Button>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Mentorship Progress</span>
              <span className="text-sm text-muted-foreground">{mentee?.progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(mentee?.progress)}`}
                style={{ width: `${mentee?.progress}%` }}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Target" size={14} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Current Focus Areas:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {mentee?.focusAreas?.map((area, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold text-foreground">{mentee?.sessionsCompleted}</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{mentee?.goalsAchieved}</p>
                <p className="text-xs text-muted-foreground">Goals Met</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{mentee?.monthsActive}</p>
                <p className="text-xs text-muted-foreground">Months</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentMenteeCard;