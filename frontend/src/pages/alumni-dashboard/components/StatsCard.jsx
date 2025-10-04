import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsCard = ({ title, value, change, changeType, icon, color = 'primary' }) => {
  const getColorClasses = (colorName) => {
    const colors = {
      primary: 'bg-primary/10 text-primary',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      error: 'bg-error/10 text-error',
      accent: 'bg-accent/10 text-accent',
      secondary: 'bg-secondary/10 text-secondary'
    };
    return colors?.[colorName] || colors?.primary;
  };

  const getChangeColor = (type) => {
    switch (type) {
      case 'increase': return 'text-success';
      case 'decrease': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getChangeIcon = (type) => {
    switch (type) {
      case 'increase': return 'TrendingUp';
      case 'decrease': return 'TrendingDown';
      default: return 'Minus';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation-2 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          
          {change !== undefined && (
            <div className="flex items-center space-x-1 mt-2">
              <Icon 
                name={getChangeIcon(changeType)} 
                size={14} 
                className={getChangeColor(changeType)} 
              />
              <span className={`text-sm font-medium ${getChangeColor(changeType)}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-muted-foreground text-sm">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${getColorClasses(color)}`}>
          <Icon name={icon} size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;