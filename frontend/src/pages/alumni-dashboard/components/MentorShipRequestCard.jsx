import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const MentorshipRequestCard = ({ request, onAccept, onDecline }) => {
  const getSkillMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-success bg-success/10';
    if (percentage >= 60) return 'text-warning bg-warning/10';
    return 'text-muted-foreground bg-muted';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation-2 transition-all duration-200">
      <div className="flex items-start space-x-4">
        <div className="relative flex-shrink-0">
          <Image
            src={request?.student?.avatar}
            alt={request?.student?.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
            {request?.student?.year}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground text-lg">{request?.student?.name}</h3>
              <p className="text-muted-foreground text-sm">{request?.student?.department} • {request?.student?.university}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillMatchColor(request?.matchPercentage)}`}>
                  {request?.matchPercentage}% Match
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(request?.requestedAt)}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDecline(request?.id)}
                iconName="X"
                iconSize={16}
              >
                Decline
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onAccept(request?.id)}
                iconName="Check"
                iconSize={16}
              >
                Accept
              </Button>
            </div>
          </div>
          
          <div className="mt-3">
            <p className="text-foreground text-sm leading-relaxed">{request?.message}</p>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Target" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Seeking guidance in:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {request?.skillsRequested?.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Icon name="GraduationCap" size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">GPA:</span>
                <span className="font-medium text-foreground">{request?.student?.gpa}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Calendar" size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Expected Graduation:</span>
                <span className="font-medium text-foreground">{request?.student?.expectedGraduation}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorshipRequestCard;