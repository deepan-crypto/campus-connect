import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const PrivacySettings = ({ settings, onSettingsUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (key, value) => {
    const updatedSettings = { ...localSettings, [key]: value };
    setLocalSettings(updatedSettings);
    onSettingsUpdate(updatedSettings);
  };

  const privacyOptions = [
    {
      key: 'profileVisibility',
      title: 'Profile Visibility',
      description: 'Who can view your full profile',
      options: [
        { value: 'public', label: 'Everyone' },
        { value: 'network', label: 'My Network Only' },
        { value: 'private', label: 'Only Me' }
      ]
    },
    {
      key: 'contactInfo',
      title: 'Contact Information',
      description: 'Who can see your email and phone number',
      options: [
        { value: 'public', label: 'Everyone' },
        { value: 'network', label: 'My Network Only' },
        { value: 'private', label: 'Only Me' }
      ]
    },
    {
      key: 'activityFeed',
      title: 'Activity Feed',
      description: 'Who can see your recent activities',
      options: [
        { value: 'public', label: 'Everyone' },
        { value: 'network', label: 'My Network Only' },
        { value: 'private', label: 'Only Me' }
      ]
    }
  ];

  const notificationSettings = [
    {
      key: 'connectionRequests',
      title: 'Connection Requests',
      description: 'Get notified when someone wants to connect'
    },
    {
      key: 'endorsements',
      title: 'Skill Endorsements',
      description: 'Get notified when someone endorses your skills'
    },
    {
      key: 'mentorshipRequests',
      title: 'Mentorship Requests',
      description: 'Get notified when someone requests mentorship'
    },
    {
      key: 'eventInvitations',
      title: 'Event Invitations',
      description: 'Get notified about relevant events'
    },
    {
      key: 'weeklyDigest',
      title: 'Weekly Digest',
      description: 'Receive a weekly summary of network activity'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Shield" size={20} />
          <span>Privacy & Settings</span>
        </h2>
        <Button
          variant="ghost"
          size="sm"
          iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>
      {isExpanded && (
        <div className="space-y-8">
          {/* Privacy Settings */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center space-x-2">
              <Icon name="Eye" size={18} />
              <span>Privacy Controls</span>
            </h3>
            <div className="space-y-6">
              {privacyOptions?.map((option) => (
                <div key={option?.key} className="space-y-3">
                  <div>
                    <h4 className="font-medium text-foreground">{option?.title}</h4>
                    <p className="text-sm text-muted-foreground">{option?.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {option?.options?.map((choice) => (
                      <button
                        key={choice?.value}
                        onClick={() => handleSettingChange(option?.key, choice?.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          localSettings?.[option?.key] === choice?.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {choice?.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center space-x-2">
              <Icon name="Bell" size={18} />
              <span>Notification Preferences</span>
            </h3>
            <div className="space-y-4">
              {notificationSettings?.map((setting) => (
                <div key={setting?.key} className="flex items-start space-x-3">
                  <Checkbox
                    checked={localSettings?.notifications?.[setting?.key] || false}
                    onChange={(e) => handleSettingChange('notifications', {
                      ...localSettings?.notifications,
                      [setting?.key]: e?.target?.checked
                    })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{setting?.title}</h4>
                    <p className="text-sm text-muted-foreground">{setting?.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Settings */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center space-x-2">
              <Icon name="Settings" size={18} />
              <span>Account Settings</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={localSettings?.searchable || false}
                  onChange={(e) => handleSettingChange('searchable', e?.target?.checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Make profile searchable</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow others to find your profile through search
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={localSettings?.showOnlineStatus || false}
                  onChange={(e) => handleSettingChange('showOnlineStatus', e?.target?.checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Show online status</h4>
                  <p className="text-sm text-muted-foreground">
                    Let others see when you're active on the platform
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={localSettings?.allowMentorshipRequests || false}
                  onChange={(e) => handleSettingChange('allowMentorshipRequests', e?.target?.checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Accept mentorship requests</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow students to send you mentorship requests
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data & Security */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center space-x-2">
              <Icon name="Lock" size={18} />
              <span>Data & Security</span>
            </h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" iconName="Download" iconPosition="left">
                Download my data
              </Button>
              <Button variant="outline" className="w-full justify-start" iconName="Key" iconPosition="left">
                Change password
              </Button>
              <Button variant="outline" className="w-full justify-start" iconName="Smartphone" iconPosition="left">
                Two-factor authentication
              </Button>
              <Button variant="destructive" className="w-full justify-start" iconName="Trash2" iconPosition="left">
                Delete account
              </Button>
            </div>
          </div>

          {/* Save Changes */}
          <div className="pt-6 border-t border-border">
            <div className="flex justify-end space-x-3">
              <Button variant="outline">
                Reset to Default
              </Button>
              <Button variant="default">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Quick Privacy Summary */}
      {!isExpanded && (
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Profile Visibility</span>
            <span className="text-sm font-medium text-foreground capitalize">
              {localSettings?.profileVisibility || 'Public'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Contact Information</span>
            <span className="text-sm font-medium text-foreground capitalize">
              {localSettings?.contactInfo || 'Network Only'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Activity Feed</span>
            <span className="text-sm font-medium text-foreground capitalize">
              {localSettings?.activityFeed || 'Network Only'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacySettings;