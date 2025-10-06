import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const InterestsSection = ({ interests, isOwnProfile }) => {
  const [isAddingInterest, setIsAddingInterest] = useState(false);
  const [newInterest, setNewInterest] = useState('');

  const handleAddInterest = () => {
    if (newInterest?.trim()) {
      // In real app, this would save to backend
      console.log('Adding interest:', newInterest);
      setNewInterest('');
      setIsAddingInterest(false);
    }
  };

  const handleRemoveInterest = (interestId) => {
    // In real app, this would remove from backend
    console.log('Removing interest:', interestId);
  };

  const getInterestColor = (category) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800 border-blue-200',
      'Business': 'bg-green-100 text-green-800 border-green-200',
      'Arts': 'bg-purple-100 text-purple-800 border-purple-200',
      'Sports': 'bg-orange-100 text-orange-800 border-orange-200',
      'Science': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Social': 'bg-pink-100 text-pink-800 border-pink-200',
      'Academic': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Career': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'default': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors?.[category] || colors?.default;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Heart" size={20} />
          <span>Interests</span>
        </h2>
        {isOwnProfile && (
          <Button
            variant="outline"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={() => setIsAddingInterest(true)}
          >
            Add Interest
          </Button>
        )}
      </div>
      {/* Add Interest Form */}
      {isAddingInterest && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter an interest (e.g., Machine Learning, Entrepreneurship, Photography)"
                value={newInterest}
                onChange={(e) => setNewInterest(e?.target?.value)}
                onKeyPress={(e) => e?.key === 'Enter' && handleAddInterest()}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="default" onClick={handleAddInterest}>
                Add
              </Button>
              <Button variant="outline" onClick={() => {
                setIsAddingInterest(false);
                setNewInterest('');
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Interests Display */}
      {interests?.length > 0 ? (
        <div className="space-y-4">
          {/* Group interests by category */}
          {Object.entries(
            interests?.reduce((acc, interest) => {
              const category = interest?.category || 'Other';
              if (!acc?.[category]) acc[category] = [];
              acc?.[category]?.push(interest);
              return acc;
            }, {})
          )?.map(([category, categoryInterests]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {categoryInterests?.map((interest) => (
                  <div
                    key={interest?.id}
                    className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full border text-sm font-medium ${getInterestColor(category)}`}
                  >
                    <span>{interest?.name}</span>
                    {interest?.isPopular && (
                      <Icon name="TrendingUp" size={14} className="opacity-70" />
                    )}
                    {isOwnProfile && (
                      <button
                        onClick={() => handleRemoveInterest(interest?.id)}
                        className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                      >
                        <Icon name="X" size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Icon name="Heart" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No interests added yet</h3>
          <p className="text-muted-foreground mb-4">
            {isOwnProfile 
              ? "Add your interests to connect with like-minded people and discover relevant events." :"This user hasn't added any interests yet."
            }
          </p>
          {isOwnProfile && (
            <Button
              variant="default"
              iconName="Plus"
              iconPosition="left"
              onClick={() => setIsAddingInterest(true)}
            >
              Add Your First Interest
            </Button>
          )}
        </div>
      )}
      {/* Popular Interests Suggestions */}
      {isOwnProfile && interests?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Popular interests in your network
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              'Artificial Intelligence',
              'Startup Culture',
              'Data Science',
              'Digital Marketing',
              'Sustainable Technology'
            ]?.map((suggestion) => (
              <button
                key={suggestion}
                className="px-3 py-1 text-sm border border-border rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setNewInterest(suggestion);
                  setIsAddingInterest(true);
                }}
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestsSection;