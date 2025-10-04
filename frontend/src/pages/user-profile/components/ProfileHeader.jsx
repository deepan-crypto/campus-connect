import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProfileHeader = ({ user, isOwnProfile, connectionStatus, onConnectionAction, onMessageAction, onMentorshipRequest }) => {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(user?.bio);

  const handleBioSave = () => {
    setIsEditingBio(false);
    // In real app, this would save to backend
    console.log('Bio saved:', bioText);
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'student': return 'bg-primary text-primary-foreground';
      case 'alumni': return 'bg-success text-success-foreground';
      case 'faculty': return 'bg-accent text-accent-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getConnectionButton = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Button variant="outline" iconName="Check" iconPosition="left">
            Connected
          </Button>
        );
      case 'pending':
        return (
          <Button variant="outline" disabled>
            Request Sent
          </Button>
        );
      case 'none':
        return (
          <Button variant="default" iconName="UserPlus" iconPosition="left" onClick={onConnectionAction}>
            Send Connection Request
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 overflow-hidden">
      {/* Cover Photo */}
      <div className="h-32 sm:h-48 bg-gradient-to-r from-primary to-accent relative">
        <div className="absolute inset-0 bg-black/20"></div>
        {isOwnProfile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-black/20 text-white hover:bg-black/40"
          >
            <Icon name="Camera" size={20} />
          </Button>
        )}
      </div>
      <div className="px-6 pb-6">
        {/* Profile Photo & Basic Info */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16 sm:-mt-20">
          <div className="relative mb-4 sm:mb-0">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-card bg-card overflow-hidden">
              <Image
                src={user?.profilePhoto}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            </div>
            {isOwnProfile && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full shadow-elevation-2"
              >
                <Icon name="Camera" size={16} />
              </Button>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{user?.name}</h1>
                  {isOwnProfile && (
                    <Button variant="ghost" size="icon">
                      <Icon name="Edit2" size={18} />
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role)}`}>
                    {user?.role}
                  </span>
                  <span className="text-muted-foreground">{user?.department}</span>
                  <span className="text-muted-foreground">Class of {user?.graduationYear}</span>
                </div>
                {user?.currentEmployer && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Icon name="Building2" size={16} />
                    <span>{user?.currentPosition} at {user?.currentEmployer}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                  {getConnectionButton()}
                  {connectionStatus === 'connected' && (
                    <Button variant="outline" iconName="MessageCircle" iconPosition="left" onClick={onMessageAction}>
                      Message
                    </Button>
                  )}
                  {user?.role === 'Alumni' && connectionStatus === 'connected' && (
                    <Button variant="success" iconName="Users" iconPosition="left" onClick={onMentorshipRequest}>
                      Request Mentorship
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Bio Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">About</h3>
                {isOwnProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName={isEditingBio ? "Check" : "Edit2"}
                    onClick={isEditingBio ? handleBioSave : () => setIsEditingBio(true)}
                  >
                    {isEditingBio ? 'Save' : 'Edit'}
                  </Button>
                )}
              </div>
              {isEditingBio ? (
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e?.target?.value)}
                  className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-muted-foreground leading-relaxed">
                  {bioText || "No bio available."}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <Icon name="Users" size={16} className="text-muted-foreground" />
                <span className="font-medium text-foreground">{user?.stats?.connections}</span>
                <span className="text-muted-foreground">connections</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Award" size={16} className="text-muted-foreground" />
                <span className="font-medium text-foreground">{user?.stats?.endorsements}</span>
                <span className="text-muted-foreground">endorsements</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Calendar" size={16} className="text-muted-foreground" />
                <span className="font-medium text-foreground">{user?.stats?.eventsAttended}</span>
                <span className="text-muted-foreground">events attended</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;