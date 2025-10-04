import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyState = ({ hasFilters, onClearFilters, onRefresh }) => {
  if (hasFilters) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
            <Icon name="Search" size={32} className="text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No mentors found</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          We couldn't find any mentors matching your current filters. Try adjusting your search criteria or clearing some filters.
        </p>
        <div className="flex justify-center space-x-3">
          <Button
            variant="outline"
            onClick={onClearFilters}
            iconName="X"
            iconPosition="left"
          >
            Clear Filters
          </Button>
          <Button
            variant="default"
            onClick={onRefresh}
            iconName="RefreshCw"
            iconPosition="left"
          >
            Refresh Results
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon name="Users" size={32} className="text-primary" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">No mentors available</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        There are currently no mentors available in our system. Please check back later or contact support if you believe this is an error.
      </p>
      <Button
        variant="default"
        onClick={onRefresh}
        iconName="RefreshCw"
        iconPosition="left"
      >
        Refresh Page
      </Button>
    </div>
  );
};

export default EmptyState;