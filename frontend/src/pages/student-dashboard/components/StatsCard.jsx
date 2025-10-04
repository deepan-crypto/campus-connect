import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsCard = ({ title, value, subtitle, icon, trend, color = "primary" }) => {
  const colorClasses = {
    primary: "text-primary",
    success: "text-success",
    accent: "text-accent",
    error: "text-error",
    secondary: "text-secondary"
  };

  const bgColorClasses = {
    primary: "bg-primary/10",
    success: "bg-success/10",
    accent: "bg-accent/10",
    error: "bg-error/10",
    secondary: "bg-secondary/10"
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation-1 transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-card-foreground">{value}</h3>
            {trend && (
              <div className={`flex items-center space-x-1 text-xs ${trend?.type === 'up' ? 'text-success' : trend?.type === 'down' ? 'text-error' : 'text-muted-foreground'}`}>
                {trend?.type === 'up' && <Icon name="TrendingUp" size={12} />}
                {trend?.type === 'down' && <Icon name="TrendingDown" size={12} />}
                <span>{trend?.value}</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-muted-foreground text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${bgColorClasses?.[color]} flex items-center justify-center`}>
          <Icon name={icon} size={20} className={colorClasses?.[color]} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;