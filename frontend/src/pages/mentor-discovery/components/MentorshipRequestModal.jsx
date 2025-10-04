import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

import Select from '../../../components/ui/Select';

const MentorshipRequestModal = ({ mentor, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    message: '',
    goals: '',
    timeCommitment: '',
    preferredMeetingType: '',
    urgency: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeCommitmentOptions = [
    { value: '1-2-hours', label: '1-2 hours per week' },
    { value: '3-4-hours', label: '3-4 hours per week' },
    { value: '5-6-hours', label: '5-6 hours per week' },
    { value: 'flexible', label: 'Flexible schedule' }
  ];

  const meetingTypeOptions = [
    { value: 'video-call', label: 'Video calls' },
    { value: 'phone-call', label: 'Phone calls' },
    { value: 'in-person', label: 'In-person meetings' },
    { value: 'messaging', label: 'Text/messaging' },
    { value: 'mixed', label: 'Mixed approach' }
  ];

  const urgencyOptions = [
    { value: 'low', label: 'Low - General guidance' },
    { value: 'medium', label: 'Medium - Specific goals' },
    { value: 'high', label: 'High - Urgent decisions' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        mentorId: mentor?.id,
        ...formData
      });
      onClose();
      setFormData({
        message: '',
        goals: '',
        timeCommitment: '',
        preferredMeetingType: '',
        urgency: 'medium'
      });
    } catch (error) {
      console.error('Error submitting mentorship request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mentor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-lg shadow-elevation-3 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <Image
              src={mentor?.avatar}
              alt={mentor?.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-semibold text-foreground">Request Mentorship</h2>
              <p className="text-sm text-muted-foreground">
                Send a mentorship request to {mentor?.name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            iconName="X"
          />
        </div>

        {/* Mentor Info */}
        <div className="p-6 border-b border-border bg-muted/20">
          <div className="flex items-start space-x-4">
            <Image
              src={mentor?.avatar}
              alt={mentor?.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{mentor?.name}</h3>
              <p className="text-sm text-muted-foreground">{mentor?.currentPosition}</p>
              <p className="text-sm text-muted-foreground font-medium">{mentor?.company}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Icon name="GraduationCap" size={14} />
                  <span>Class of {mentor?.graduationYear}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Icon name="Star" size={14} className="text-warning fill-current" />
                  <span>{mentor?.rating} rating</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Icon name="Clock" size={14} />
                  <span>{mentor?.responseTime} response</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Message */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Personal Message *
            </label>
            <textarea
              value={formData?.message}
              onChange={(e) => handleInputChange('message', e?.target?.value)}
              placeholder={`Hi ${mentor?.name},\n\nI'm interested in connecting with you as a mentor because...`}
              required
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Introduce yourself and explain why you'd like this mentor's guidance
            </p>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Goals *
            </label>
            <textarea
              value={formData?.goals}
              onChange={(e) => handleInputChange('goals', e?.target?.value)}
              placeholder="What specific goals would you like to achieve through this mentorship? (e.g., career transition, skill development, industry insights)"
              required
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical"
            />
          </div>

          {/* Time Commitment */}
          <Select
            label="Time Commitment *"
            description="How much time can you dedicate to this mentorship?"
            options={timeCommitmentOptions}
            value={formData?.timeCommitment}
            onChange={(value) => handleInputChange('timeCommitment', value)}
            required
            placeholder="Select time commitment"
          />

          {/* Preferred Meeting Type */}
          <Select
            label="Preferred Meeting Type *"
            description="How would you prefer to communicate with your mentor?"
            options={meetingTypeOptions}
            value={formData?.preferredMeetingType}
            onChange={(value) => handleInputChange('preferredMeetingType', value)}
            required
            placeholder="Select meeting type"
          />

          {/* Urgency */}
          <Select
            label="Urgency Level"
            description="How urgent is your need for mentorship?"
            options={urgencyOptions}
            value={formData?.urgency}
            onChange={(value) => handleInputChange('urgency', value)}
          />

          {/* Mentor's Expertise */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Mentor's Expertise</h4>
            <div className="flex flex-wrap gap-2">
              {mentor?.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isSubmitting}
              className="flex-1"
              iconName="Send"
              iconPosition="left"
            >
              Send Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorshipRequestModal;