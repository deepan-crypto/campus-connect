import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FilterPanel = ({ filters, onFiltersChange, mentorCount, onClearFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    { value: 'computer-science', label: 'Computer Science' },
    { value: 'business', label: 'Business Administration' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'design', label: 'Design' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'finance', label: 'Finance' },
    { value: 'healthcare', label: 'Healthcare' },
  ];

  const industryOptions = [
    { value: '', label: 'All Industries' },
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'education', label: 'Education' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retail', label: 'Retail' },
    { value: 'media', label: 'Media & Entertainment' },
  ];

  const availabilityOptions = [
    { value: '', label: 'All Availability' },
    { value: 'available', label: 'Available' },
    { value: 'limited', label: 'Limited Spots' },
    { value: 'unavailable', label: 'Currently Full' },
  ];

  const sortOptions = [
    { value: 'match-score', label: 'Match Score' },
    { value: 'graduation-year', label: 'Graduation Year' },
    { value: 'availability', label: 'Availability' },
    { value: 'rating', label: 'Rating' },
    { value: 'response-time', label: 'Response Time' },
  ];

  const skillOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'react', label: 'React' },
    { value: 'node-js', label: 'Node.js' },
    { value: 'data-analysis', label: 'Data Analysis' },
    { value: 'machine-learning', label: 'Machine Learning' },
    { value: 'project-management', label: 'Project Management' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'design', label: 'Design' },
    { value: 'finance', label: 'Finance' },
    { value: 'consulting', label: 'Consulting' },
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters)?.some(value => 
    Array.isArray(value) ? value?.length > 0 : value !== ''
  );

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon name="Filter" size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Filter Mentors</h2>
          <span className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">
            {mentorCount} mentors
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              iconName="X"
              iconPosition="left"
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </div>
      {/* Search */}
      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search by name, company, or skills..."
          value={filters?.search || ''}
          onChange={(e) => handleFilterChange('search', e?.target?.value)}
          className="w-full"
        />
      </div>
      {/* Filter Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${!isExpanded && 'hidden lg:grid'}`}>
        {/* Department Filter */}
        <Select
          label="Department"
          options={departmentOptions}
          value={filters?.department || ''}
          onChange={(value) => handleFilterChange('department', value)}
          placeholder="Select department"
        />

        {/* Industry Filter */}
        <Select
          label="Industry"
          options={industryOptions}
          value={filters?.industry || ''}
          onChange={(value) => handleFilterChange('industry', value)}
          placeholder="Select industry"
        />

        {/* Availability Filter */}
        <Select
          label="Availability"
          options={availabilityOptions}
          value={filters?.availability || ''}
          onChange={(value) => handleFilterChange('availability', value)}
          placeholder="Select availability"
        />

        {/* Sort By */}
        <Select
          label="Sort By"
          options={sortOptions}
          value={filters?.sortBy || 'match-score'}
          onChange={(value) => handleFilterChange('sortBy', value)}
        />
      </div>
      {/* Advanced Filters */}
      <div className={`mt-4 pt-4 border-t border-border ${!isExpanded && 'hidden lg:block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Graduation Year Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Graduation Year Range</label>
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="From"
                value={filters?.graduationYearFrom || ''}
                onChange={(e) => handleFilterChange('graduationYearFrom', e?.target?.value)}
                min="1950"
                max="2024"
              />
              <Input
                type="number"
                placeholder="To"
                value={filters?.graduationYearTo || ''}
                onChange={(e) => handleFilterChange('graduationYearTo', e?.target?.value)}
                min="1950"
                max="2024"
              />
            </div>
          </div>

          {/* Skills Filter */}
          <Select
            label="Skills"
            options={skillOptions}
            value={filters?.skills || []}
            onChange={(value) => handleFilterChange('skills', value)}
            multiple
            searchable
            placeholder="Select skills"
          />

          {/* Rating Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Minimum Rating</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters?.minRating || 0}
                onChange={(e) => handleFilterChange('minRating', parseFloat(e?.target?.value))}
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex items-center space-x-1 text-sm font-medium text-foreground min-w-[60px]">
                <Icon name="Star" size={14} className="text-warning fill-current" />
                <span>{filters?.minRating || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {filters?.department && (
              <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                Department: {departmentOptions?.find(opt => opt?.value === filters?.department)?.label}
                <button
                  onClick={() => handleFilterChange('department', '')}
                  className="ml-2 hover:text-primary/80"
                >
                  <Icon name="X" size={14} />
                </button>
              </span>
            )}
            {filters?.industry && (
              <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                Industry: {industryOptions?.find(opt => opt?.value === filters?.industry)?.label}
                <button
                  onClick={() => handleFilterChange('industry', '')}
                  className="ml-2 hover:text-primary/80"
                >
                  <Icon name="X" size={14} />
                </button>
              </span>
            )}
            {filters?.skills && filters?.skills?.length > 0 && (
              <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                Skills: {filters?.skills?.length} selected
                <button
                  onClick={() => handleFilterChange('skills', [])}
                  className="ml-2 hover:text-primary/80"
                >
                  <Icon name="X" size={14} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;