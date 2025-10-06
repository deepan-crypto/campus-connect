import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SkillsSection = ({ skills, isOwnProfile, connectionStatus, onEndorseSkill }) => {
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill?.trim()) {
      // In real app, this would save to backend
      console.log('Adding skill:', newSkill);
      setNewSkill('');
      setIsAddingSkill(false);
    }
  };

  const handleEndorse = (skillId) => {
    onEndorseSkill(skillId);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Award" size={20} />
          <span>Skills & Endorsements</span>
        </h2>
        {isOwnProfile && (
          <Button
            variant="outline"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={() => setIsAddingSkill(true)}
          >
            Add Skill
          </Button>
        )}
      </div>
      {/* Add Skill Form */}
      {isAddingSkill && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter a skill (e.g., React, Data Analysis, Public Speaking)"
                value={newSkill}
                onChange={(e) => setNewSkill(e?.target?.value)}
                onKeyPress={(e) => e?.key === 'Enter' && handleAddSkill()}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="default" onClick={handleAddSkill}>
                Add
              </Button>
              <Button variant="outline" onClick={() => {
                setIsAddingSkill(false);
                setNewSkill('');
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Skills Grid */}
      {skills?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skills?.map((skill) => (
            <div
              key={skill?.id}
              className="p-4 border border-border rounded-lg hover:shadow-elevation-2 transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-foreground">{skill?.name}</h3>
                {!isOwnProfile && connectionStatus === 'connected' && !skill?.endorsedByUser && (
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Plus"
                    onClick={() => handleEndorse(skill?.id)}
                  >
                    Endorse
                  </Button>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icon name="Users" size={14} />
                  <span>{skill?.endorsementCount} endorsement{skill?.endorsementCount !== 1 ? 's' : ''}</span>
                </div>
                
                {skill?.endorsedByUser && (
                  <div className="flex items-center space-x-1 text-sm text-success">
                    <Icon name="Check" size={14} />
                    <span>Endorsed</span>
                  </div>
                )}
              </div>

              {/* Recent Endorsers */}
              {skill?.recentEndorsers && skill?.recentEndorsers?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {skill?.recentEndorsers?.slice(0, 3)?.map((endorser, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-medium"
                          title={endorser?.name}
                        >
                          {endorser?.name?.charAt(0)}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Endorsed by {skill?.recentEndorsers?.[0]?.name}
                      {skill?.recentEndorsers?.length > 1 && ` and ${skill?.recentEndorsers?.length - 1} other${skill?.recentEndorsers?.length > 2 ? 's' : ''}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Icon name="Award" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No skills added yet</h3>
          <p className="text-muted-foreground mb-4">
            {isOwnProfile 
              ? "Add your skills to showcase your expertise and get endorsements from your network."
              : "This user hasn't added any skills yet."
            }
          </p>
          {isOwnProfile && (
            <Button
              variant="default"
              iconName="Plus"
              iconPosition="left"
              onClick={() => setIsAddingSkill(true)}
            >
              Add Your First Skill
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillsSection;