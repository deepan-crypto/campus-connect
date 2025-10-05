import { useState } from 'react';
import { Calendar, MapPin, Users, Star, Filter, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockEvents } from '../data/mockData';
import { Event, EventType } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface CalendarViewProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

function CalendarView({ events, onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 p-2 border border-gray-200"></div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`h-24 p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          }`}
        >
          <div className="flex flex-col h-full">
            <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
              {day}
            </div>
            <div className="flex-1 overflow-hidden">
              {dayEvents.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  className="text-xs p-1 mb-1 bg-blue-100 text-blue-700 rounded truncate cursor-pointer hover:bg-blue-200"
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{dayEvents.length - 2} more
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{formatDate(currentDate)}</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-700 border-b border-gray-200">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0">
        {renderCalendar()}
      </div>

      {events.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
          <p>No events found for this month</p>
        </div>
      )}
    </div>
  );
}

export function EventsPage({ managementMode = false }: { managementMode?: boolean }) {
  const { user } = useAuth();
  const [events, setEvents] = useState(mockEvents);
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventType: 'career' as EventType,
    location: '',
    startDate: '',
    endDate: '',
    capacity: '',
    tags: '',
    bannerUrl: '',
  });
  const [showEventFeedback, setShowEventFeedback] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    feedbackText: '',
  });

  const myEvents = managementMode ? events.filter(event => event.createdBy === user?.id) : events;
  const canCreateEvent = user?.role === 'faculty' || user?.role === 'admin' || user?.role === 'alumni';

  const eventTypes: { value: EventType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Events' },
    { value: 'career', label: 'Career' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'sports', label: 'Sports' },
    { value: 'academic', label: 'Academic' },
    { value: 'social', label: 'Social' },
  ];

  const filteredEvents = myEvents.filter((event) => {
    const matchesType = selectedType === 'all' || event.eventType === selectedType;
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleRsvp = (eventId: string, status: 'going' | 'interested') => {
    setEvents(
      events.map((event) => {
        if (event.id === eventId) {
          const currentRsvp = event.userRsvp;
          const newRsvpCount = { ...event.rsvpCount };

          if (currentRsvp === status) {
            if (status === 'going') newRsvpCount.going--;
            if (status === 'interested') newRsvpCount.interested--;
            return { ...event, userRsvp: undefined, rsvpCount: newRsvpCount };
          } else {
            if (currentRsvp === 'going') newRsvpCount.going--;
            if (currentRsvp === 'interested') newRsvpCount.interested--;
            if (status === 'going') newRsvpCount.going++;
            if (status === 'interested') newRsvpCount.interested++;
            return { ...event, userRsvp: status, rsvpCount: newRsvpCount };
          }
        }
        return event;
      })
    );
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.description || !newEvent.startDate || !newEvent.location) {
      return;
    }

    const event: Event = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      description: newEvent.description,
      eventType: newEvent.eventType,
      location: newEvent.location,
      startDate: new Date(newEvent.startDate).toISOString(),
      endDate: newEvent.endDate ? new Date(newEvent.endDate).toISOString() : undefined,
      capacity: newEvent.capacity ? parseInt(newEvent.capacity) : undefined,
      bannerUrl: newEvent.bannerUrl || undefined,
      createdBy: user?.id || '1',
      tags: newEvent.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      rsvpCount: { going: 0, interested: 0 },
    };

    setEvents([...events, event]);
    setShowCreateEvent(false);
    setNewEvent({
      title: '',
      description: '',
      eventType: 'career',
      location: '',
      startDate: '',
      endDate: '',
      capacity: '',
      tags: '',
      bannerUrl: '',
    });
  };

  const handleSubmitFeedback = (eventId: string) => {
    // In a real app, this would send feedback to the backend
    setEvents(
      events.map((event) => {
        if (event.id === eventId) {
          const newRating = ((event.averageRating || 0) + feedbackData.rating) / 2;
          return { ...event, averageRating: newRating };
        }
        return event;
      })
    );
    setShowEventFeedback(null);
    setFeedbackData({ rating: 5, feedbackText: '' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getEventTypeColor = (type: EventType) => {
    const colors = {
      career: 'bg-blue-100 text-blue-700',
      workshop: 'bg-green-100 text-green-700',
      cultural: 'bg-purple-100 text-purple-700',
      sports: 'bg-orange-100 text-orange-700',
      academic: 'bg-indigo-100 text-indigo-700',
      social: 'bg-pink-100 text-pink-700',
    };
    return colors[type];
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {managementMode ? 'Manage My Events' : 'Campus Events'}
        </h1>
        {canCreateEvent && (
          <button
            onClick={() => setShowCreateEvent(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span>Create Event</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search events by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as EventType | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {event.bannerUrl && (
                <img
                  src={event.bannerUrl}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${getEventTypeColor(
                      event.eventType
                    )}`}
                  >
                    {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                  </span>
                  {event.averageRating && (
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <Star size={16} fill="currentColor" />
                      <span className="text-sm font-medium text-gray-700">
                        {event.averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>
                      {event.rsvpCount.going} going • {event.rsvpCount.interested}{' '}
                      interested
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRsvp(event.id, 'going')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      event.userRsvp === 'going'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Going
                  </button>
                  <button
                    onClick={() => handleRsvp(event.id, 'interested')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      event.userRsvp === 'interested'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Interested
                  </button>
                </div>

                {event.userRsvp === 'going' && (
                  <button
                    onClick={() => setShowEventFeedback(event.id)}
                    className="w-full mt-2 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Rate Event
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <CalendarView events={filteredEvents} onEventClick={(event) => console.log('Event clicked:', event)} />
      )}

      {showEventFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Rate Event</h3>
              <p className="text-sm text-gray-600 mb-4">
                How would you rate your experience at this event?
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <select
                  value={feedbackData.rating}
                  onChange={(e) => setFeedbackData({ ...feedbackData, rating: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
                  <option value={4}>⭐⭐⭐⭐ Very Good</option>
                  <option value={3}>⭐⭐⭐ Good</option>
                  <option value={2}>⭐⭐ Fair</option>
                  <option value={1}>⭐ Poor</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  value={feedbackData.feedbackText}
                  onChange={(e) => setFeedbackData({ ...feedbackData, feedbackText: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Share your thoughts about the event..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEventFeedback(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={() => handleSubmitFeedback(showEventFeedback)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
                <button
                  onClick={() => setShowCreateEvent(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter event title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type *
                    </label>
                    <select
                      value={newEvent.eventType}
                      onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value as EventType })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="career">Career</option>
                      <option value="workshop">Workshop</option>
                      <option value="cultural">Cultural</option>
                      <option value="sports">Sports</option>
                      <option value="academic">Academic</option>
                      <option value="social">Social</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Describe your event"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Event location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={newEvent.capacity}
                      onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Max attendees (optional)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={newEvent.tags}
                      onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., technology, networking, career"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Banner Image URL
                    </label>
                    <input
                      type="url"
                      value={newEvent.bannerUrl}
                      onChange={(e) => setNewEvent({ ...newEvent, bannerUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateEvent(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
