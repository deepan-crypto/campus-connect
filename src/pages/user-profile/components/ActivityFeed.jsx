import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ActivityFeed = ({ activities, isOwnProfile }) => {
  const [filter, setFilter] = useState('all');

  const getActivityIcon = (type) => {
    const icons = {
      'post': 'FileText',
      'event': 'Calendar',
      'connection': 'Users',
      'endorsement': 'Award',
      'mentorship': 'GraduationCap',
      'achievement': 'Trophy'
    };
    return icons?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      'post': 'text-blue-600',
      'event': 'text-green-600',
      'connection': 'text-purple-600',
      'endorsement': 'text-orange-600',
      'mentorship': 'text-indigo-600',
      'achievement': 'text-yellow-600'
    };
    return colors?.[type] || 'text-gray-600';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now - activityDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities?.filter(activity => activity?.type === filter);

  const filterOptions = [
    { value: 'all', label: 'All Activity', icon: 'Activity' },
    { value: 'post', label: 'Posts', icon: 'FileText' },
    { value: 'event', label: 'Events', icon: 'Calendar' },
    { value: 'connection', label: 'Connections', icon: 'Users' },
    { value: 'endorsement', label: 'Endorsements', icon: 'Award' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Activity" size={20} />
          <span>Recent Activity</span>
        </h2>
        
        {/* Activity Filter */}
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e?.target?.value)}
            className="px-3 py-1 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {filterOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Activity List */}
      {filteredActivities?.length > 0 ? (
        <div className="space-y-4">
          {filteredActivities?.map((activity) => (
            <div
              key={activity?.id}
              className="flex space-x-4 p-4 border border-border rounded-lg hover:shadow-elevation-2 transition-shadow"
            >
              {/* Activity Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center ${getActivityColor(activity?.type)}`}>
                <Icon name={getActivityIcon(activity?.type)} size={18} />
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{activity?.title}</p>
                    <p className="text-muted-foreground text-sm mt-1">{activity?.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono ml-4">
                    {formatTimeAgo(activity?.timestamp)}
                  </span>
                </div>

                {/* Activity Metadata */}
                {activity?.metadata && (
                  <div className="mt-3">
                    {activity?.type === 'event' && activity?.metadata?.eventImage && (
                      <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                        <Image
                          src={activity?.metadata?.eventImage}
                          alt={activity?.metadata?.eventName}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-foreground">{activity?.metadata?.eventName}</p>
                          <p className="text-sm text-muted-foreground">{activity?.metadata?.eventDate}</p>
                        </div>
                      </div>
                    )}

                    {activity?.type === 'connection' && activity?.metadata?.connectionName && (
                      <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                        <Image
                          src={activity?.metadata?.connectionAvatar}
                          alt={activity?.metadata?.connectionName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-foreground">{activity?.metadata?.connectionName}</p>
                          <p className="text-sm text-muted-foreground">{activity?.metadata?.connectionRole}</p>
                        </div>
                      </div>
                    )}

                    {activity?.type === 'endorsement' && activity?.metadata?.skill && (
                      <div className="inline-flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                        <Icon name="Award" size={14} />
                        <span>{activity?.metadata?.skill}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Activity Actions */}
                {activity?.type === 'post' && (
                  <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-border">
                    <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="Heart" size={16} />
                      <span>{activity?.likes || 0}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="MessageCircle" size={16} />
                      <span>{activity?.comments || 0}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="Share2" size={16} />
                      <span>Share</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Icon name="Activity" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No recent activity</h3>
          <p className="text-muted-foreground mb-4">
            {isOwnProfile 
              ? "Start connecting with people and participating in events to see your activity here." :"This user hasn't been active recently."
            }
          </p>
          {isOwnProfile && (
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" size="sm" iconName="Users" iconPosition="left">
                Find Connections
              </Button>
              <Button variant="outline" size="sm" iconName="Calendar" iconPosition="left">
                Browse Events
              </Button>
            </div>
          )}
        </div>
      )}
      {/* Load More */}
      {filteredActivities?.length > 0 && (
        <div className="mt-6 text-center">
          <Button variant="outline">
            Load More Activity
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;