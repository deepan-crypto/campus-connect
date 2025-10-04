import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';


const QuickActionCard = ({ title, description, icon, link, badge, color = "primary" }) => {
  const colorClasses = {
    primary: "bg-primary text-primary-foreground",
    success: "bg-success text-success-foreground",
    accent: "bg-accent text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground"
  };

  return (
    <Link to={link} className="block group">
      <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation-2 transition-all duration-200 hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg ${colorClasses?.[color]} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
            <Icon name={icon} size={24} />
          </div>
          {badge && (
            <span className="bg-error text-error-foreground text-xs font-medium px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-card-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        <div className="mt-4 flex items-center text-primary text-sm font-medium">
          <span>Get started</span>
          <Icon name="ArrowRight" size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </Link>
  );
};

export default QuickActionCard;