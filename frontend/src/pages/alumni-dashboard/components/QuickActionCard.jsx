import React from 'react';
import Icon from '../../../components/AppIcon';


const QuickActionCard = ({ title, description, icon, color = 'primary', onClick, badge, disabled = false }) => {
  const getColorClasses = (colorName) => {
    const colors = {
      primary: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
      success: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
      warning: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
      error: 'bg-error/10 text-error border-error/20 hover:bg-error/20',
      accent: 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20',
      secondary: 'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20'
    };
    return colors?.[colorName] || colors?.primary;
  };

  const getBadgeColor = (colorName) => {
    const colors = {
      primary: 'bg-primary text-primary-foreground',
      success: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
      error: 'bg-error text-error-foreground',
      accent: 'bg-accent text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground'
    };
    return colors?.[colorName] || colors?.primary;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full p-6 border-2 rounded-lg transition-all duration-200 text-left group ${
        disabled 
          ? 'opacity-50 cursor-not-allowed bg-muted border-border' 
          : `${getColorClasses(color)} cursor-pointer`
      }`}
    >
      {badge && (
        <div className="absolute -top-2 -right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getBadgeColor(color)} animate-pulse`}>
            {badge}
          </span>
        </div>
      )}
      
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${disabled ? 'bg-muted text-muted-foreground' : getColorClasses(color)}`}>
          <Icon name={icon} size={24} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-lg mb-2 ${disabled ? 'text-muted-foreground' : 'text-foreground'}`}>
            {title}
          </h3>
          <p className={`text-sm leading-relaxed ${disabled ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
            {description}
          </p>
        </div>
        
        <div className={`transition-transform duration-200 ${disabled ? '' : 'group-hover:translate-x-1'}`}>
          <Icon 
            name="ArrowRight" 
            size={20} 
            className={disabled ? 'text-muted-foreground' : 'text-muted-foreground group-hover:text-foreground'} 
          />
        </div>
      </div>
    </button>
  );
};

export default QuickActionCard;