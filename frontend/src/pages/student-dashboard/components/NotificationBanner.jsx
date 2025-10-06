import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationBanner = ({ notifications, onDismiss, onViewAll }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!notifications || notifications?.length === 0) return null;

  const currentNotification = notifications?.[currentIndex];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'mentorship': return 'UserPlus';
      case 'event': return 'Calendar';
      case 'connection': return 'Users';
      case 'message': return 'MessageCircle';
      default: return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'mentorship': return 'bg-primary/10 text-primary border-primary/20';
      case 'event': return 'bg-accent/10 text-accent border-accent/20';
      case 'connection': return 'bg-success/10 text-success border-success/20';
      case 'message': return 'bg-secondary/10 text-secondary border-secondary/20';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % notifications?.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + notifications?.length) % notifications?.length);
  };

  return (
    <div className={`border rounded-lg p-4 ${getNotificationColor(currentNotification?.type)}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon name={getNotificationIcon(currentNotification?.type)} size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">{currentNotification?.title}</h4>
              <p className="text-sm opacity-80 line-clamp-2">{currentNotification?.message}</p>
              <p className="text-xs opacity-60 mt-1">{currentNotification?.time}</p>
            </div>
            
            <div className="flex items-center space-x-1 ml-4">
              {notifications?.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevious}
                    className="h-6 w-6"
                  >
                    <Icon name="ChevronLeft" size={14} />
                  </Button>
                  <span className="text-xs opacity-60 px-2">
                    {currentIndex + 1}/{notifications?.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    className="h-6 w-6"
                  >
                    <Icon name="ChevronRight" size={14} />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDismiss(currentNotification?.id)}
                className="h-6 w-6"
              >
                <Icon name="X" size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {currentNotification?.actionRequired && (
        <div className="mt-3 flex items-center space-x-2">
          <Button size="sm" variant="default">
            {currentNotification?.primaryAction}
          </Button>
          {currentNotification?.secondaryAction && (
            <Button size="sm" variant="outline">
              {currentNotification?.secondaryAction}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBanner;