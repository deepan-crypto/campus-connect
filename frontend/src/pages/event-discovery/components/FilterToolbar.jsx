import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FilterToolbar = ({ filters, onFiltersChange, eventCounts, onToggleView, currentView }) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const eventTypes = [
    { value: 'all', label: 'All Events', count: eventCounts?.all },
    { value: 'career', label: 'Career', count: eventCounts?.career },
    { value: 'workshop', label: 'Workshop', count: eventCounts?.workshop },
    { value: 'cultural', label: 'Cultural', count: eventCounts?.cultural }
  ];

  const locationOptions = [
    { value: 'all', label: 'All Locations' },
    { value: 'main-auditorium', label: 'Main Auditorium' },
    { value: 'conference-hall', label: 'Conference Hall' },
    { value: 'library', label: 'Library' },
    { value: 'student-center', label: 'Student Center' },
    { value: 'online', label: 'Online' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'relevance', label: 'Relevance' }
  ];

  const capacityOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'available', label: 'Available Spots' },
    { value: 'limited', label: 'Limited Spots' },
    { value: 'full', label: 'Full Events' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleDateRangeChange = (field, value) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters?.dateRange,
        [field]: value
      }
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      type: 'all',
      location: 'all',
      capacity: 'all',
      dateRange: { start: '', end: '' },
      sortBy: 'date'
    });
  };

  const hasActiveFilters = () => {
    return filters?.search || 
           filters?.type !== 'all' || 
           filters?.location !== 'all' || 
           filters?.capacity !== 'all' ||
           filters?.dateRange?.start ||
           filters?.dateRange?.end;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search */}
        <div className="flex-1 lg:max-w-md">
          <div className="relative">
            <Icon 
              name="Search" 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <input
              type="text"
              placeholder="Search events..."
              value={filters?.search}
              onChange={(e) => handleFilterChange('search', e?.target?.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        {/* Event Type Chips */}
        <div className="flex flex-wrap gap-2">
          {eventTypes?.map((type) => (
            <button
              key={type?.value}
              onClick={() => handleFilterChange('type', type?.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                filters?.type === type?.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {type?.label} ({type?.count})
            </button>
          ))}
        </div>

        {/* View Toggle & More Filters */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => onToggleView('grid')}
              className={`p-2 rounded-md transition-colors ${
                currentView === 'grid' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="Grid3X3" size={18} />
            </button>
            <button
              onClick={() => onToggleView('calendar')}
              className={`p-2 rounded-md transition-colors ${
                currentView === 'calendar' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="Calendar" size={18} />
            </button>
          </div>

          {/* More Filters Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            iconName={isFilterExpanded ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
          >
            Filters
          </Button>
        </div>
      </div>
      {/* Expanded Filters */}
      {isFilterExpanded && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Location Filter */}
            <Select
              label="Location"
              options={locationOptions}
              value={filters?.location}
              onChange={(value) => handleFilterChange('location', value)}
            />

            {/* Capacity Filter */}
            <Select
              label="Availability"
              options={capacityOptions}
              value={filters?.capacity}
              onChange={(value) => handleFilterChange('capacity', value)}
            />

            {/* Date Range */}
            <Input
              label="Start Date"
              type="date"
              value={filters?.dateRange?.start}
              onChange={(e) => handleDateRangeChange('start', e?.target?.value)}
            />

            <Input
              label="End Date"
              type="date"
              value={filters?.dateRange?.end}
              onChange={(e) => handleDateRangeChange('end', e?.target?.value)}
            />
          </div>

          {/* Sort and Clear */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
            <div className="flex items-center gap-4">
              <Select
                label="Sort by"
                options={sortOptions}
                value={filters?.sortBy}
                onChange={(value) => handleFilterChange('sortBy', value)}
                className="w-40"
              />
            </div>

            {hasActiveFilters() && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                iconName="X"
                iconPosition="left"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterToolbar;