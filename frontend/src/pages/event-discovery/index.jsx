import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import FilterToolbar from './components/FilterToolbar';
import RecommendedEvents from './components/RecommendedEvents';
import EventGrid from './components/EventGrid';
import CalendarView from './components/CalendarView';


const EventDiscovery = () => {
  const [currentView, setCurrentView] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    location: 'all',
    capacity: 'all',
    dateRange: { start: '', end: '' },
    sortBy: 'date'
  });

  // Mock events data
  const allEvents = [
    {
      id: 1,
      title: "Tech Career Fair 2024",
      description: "Connect with leading tech companies and explore career opportunities in software development, data science, and cybersecurity.",
      type: "career",
      date: "2024-10-15T10:00:00Z",
      location: "Main Auditorium",
      capacity: 500,
      organizer: "Career Services",
      bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
      tags: ["technology", "networking", "jobs"],
      rsvpCounts: { going: 234, interested: 156, notGoing: 12 },
      userRsvpStatus: null,
      matchScore: 95
    },
    {
      id: 2,
      title: "AI & Machine Learning Workshop",
      description: "Hands-on workshop covering fundamentals of artificial intelligence and machine learning with practical coding exercises.",
      type: "workshop",
      date: "2024-10-18T14:00:00Z",
      location: "Computer Lab A",
      capacity: 50,
      organizer: "Dr. Sarah Johnson",
      bannerImage: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?w=800&h=400&fit=crop",
      tags: ["AI", "machine-learning", "coding"],
      rsvpCounts: { going: 42, interested: 28, notGoing: 3 },
      userRsvpStatus: "interested",
      matchScore: 88
    },
    {
      id: 3,
      title: "Cultural Night: Diversity Celebration",
      description: "Join us for an evening celebrating the diverse cultures of our campus community with performances, food, and art.",
      type: "cultural",
      date: "2024-10-20T18:00:00Z",
      location: "Student Center",
      capacity: 300,
      organizer: "International Student Association",
      bannerImage: "https://images.pixabay.com/photo/2016/11/23/15/48/audience-1853662_1280.jpg?w=800&h=400&fit=crop",
      tags: ["culture", "diversity", "performance"],
      rsvpCounts: { going: 187, interested: 94, notGoing: 8 },
      userRsvpStatus: "going",
      matchScore: 76
    },
    {
      id: 4,
      title: "Startup Pitch Competition",
      description: "Watch student entrepreneurs pitch their innovative ideas to a panel of industry experts and investors.",
      type: "career",
      date: "2024-10-22T16:00:00Z",
      location: "Conference Hall",
      capacity: 200,
      organizer: "Entrepreneurship Club",
      bannerImage: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
      tags: ["startup", "entrepreneurship", "innovation"],
      rsvpCounts: { going: 89, interested: 67, notGoing: 5 },
      userRsvpStatus: null,
      matchScore: 82
    },
    {
      id: 5,
      title: "Data Science Bootcamp",
      description: "Intensive 3-day bootcamp covering data analysis, visualization, and statistical modeling using Python and R.",
      type: "workshop",
      date: "2024-10-25T09:00:00Z",
      location: "Library Conference Room",
      capacity: 30,
      organizer: "Data Science Society",
      bannerImage: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?w=800&h=400&fit=crop",
      tags: ["data-science", "python", "analytics"],
      rsvpCounts: { going: 28, interested: 15, notGoing: 2 },
      userRsvpStatus: null,
      matchScore: 91
    },
    {
      id: 6,
      title: "Annual Alumni Networking Dinner",
      description: "Connect with successful alumni from various industries and build meaningful professional relationships.",
      type: "career",
      date: "2024-10-28T19:00:00Z",
      location: "Grand Ballroom",
      capacity: 150,
      organizer: "Alumni Relations",
      bannerImage: "https://images.pixabay.com/photo/2014/07/31/23/00/dinner-party-406056_1280.jpg?w=800&h=400&fit=crop",
      tags: ["alumni", "networking", "dinner"],
      rsvpCounts: { going: 134, interested: 45, notGoing: 7 },
      userRsvpStatus: "interested",
      matchScore: 79
    },
    {
      id: 7,
      title: "Music Festival: Campus Beats",
      description: "Annual music festival featuring student bands, solo artists, and special guest performances from local musicians.",
      type: "cultural",
      date: "2024-11-02T15:00:00Z",
      location: "Campus Quad",
      capacity: 1000,
      organizer: "Music Society",
      bannerImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
      tags: ["music", "festival", "entertainment"],
      rsvpCounts: { going: 567, interested: 234, notGoing: 23 },
      userRsvpStatus: null,
      matchScore: 65
    },
    {
      id: 8,
      title: "Cybersecurity Awareness Seminar",
      description: "Learn about the latest cybersecurity threats and best practices for protecting personal and organizational data.",
      type: "workshop",
      date: "2024-11-05T13:00:00Z",
      location: "Online",
      capacity: null,
      organizer: "IT Security Team",
      bannerImage: "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?w=800&h=400&fit=crop",
      tags: ["cybersecurity", "online", "safety"],
      rsvpCounts: { going: 312, interested: 178, notGoing: 15 },
      userRsvpStatus: "going",
      matchScore: 73
    }
  ];

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [eventCounts, setEventCounts] = useState({
    all: 0,
    career: 0,
    workshop: 0,
    cultural: 0
  });

  // Filter and sort events
  useEffect(() => {
    let filtered = [...allEvents];

    // Apply search filter
    if (filters?.search) {
      const searchTerm = filters?.search?.toLowerCase();
      filtered = filtered?.filter(event =>
        event?.title?.toLowerCase()?.includes(searchTerm) ||
        event?.description?.toLowerCase()?.includes(searchTerm) ||
        event?.tags?.some(tag => tag?.toLowerCase()?.includes(searchTerm))
      );
    }

    // Apply type filter
    if (filters?.type !== 'all') {
      filtered = filtered?.filter(event => event?.type === filters?.type);
    }

    // Apply location filter
    if (filters?.location !== 'all') {
      filtered = filtered?.filter(event => 
        event?.location?.toLowerCase()?.replace(/\s+/g, '-') === filters?.location
      );
    }

    // Apply capacity filter
    if (filters?.capacity !== 'all') {
      filtered = filtered?.filter(event => {
        if (filters?.capacity === 'available') {
          return !event?.capacity || event?.rsvpCounts?.going < event?.capacity;
        } else if (filters?.capacity === 'limited') {
          return event?.capacity && (event?.capacity - event?.rsvpCounts?.going) <= 20;
        } else if (filters?.capacity === 'full') {
          return event?.capacity && event?.rsvpCounts?.going >= event?.capacity;
        }
        return true;
      });
    }

    // Apply date range filter
    if (filters?.dateRange?.start) {
      const startDate = new Date(filters.dateRange.start);
      filtered = filtered?.filter(event => new Date(event.date) >= startDate);
    }
    if (filters?.dateRange?.end) {
      const endDate = new Date(filters.dateRange.end);
      endDate?.setHours(23, 59, 59, 999);
      filtered = filtered?.filter(event => new Date(event.date) <= endDate);
    }

    // Apply sorting
    filtered?.sort((a, b) => {
      switch (filters?.sortBy) {
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'popularity':
          return (b?.rsvpCounts?.going + b?.rsvpCounts?.interested) - 
                 (a?.rsvpCounts?.going + a?.rsvpCounts?.interested);
        case 'relevance':
          return (b?.matchScore || 0) - (a?.matchScore || 0);
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);

    // Update event counts
    const counts = {
      all: allEvents?.length,
      career: allEvents?.filter(e => e?.type === 'career')?.length,
      workshop: allEvents?.filter(e => e?.type === 'workshop')?.length,
      cultural: allEvents?.filter(e => e?.type === 'cultural')?.length
    };
    setEventCounts(counts);

    setLoading(false);
  }, [filters]);

  const handleRSVP = (eventId, status) => {
    console.log(`RSVP for event ${eventId}: ${status}`);
    // In a real app, this would make an API call
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setLoading(true);
  };

  const handleToggleView = (view) => {
    setCurrentView(view);
  };

  // Get recommended events (events with high match scores)
  const recommendedEvents = allEvents?.filter(event => event?.matchScore && event?.matchScore >= 80)?.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Discover Events</h1>
            <p className="text-muted-foreground">
              Find and join campus events that match your interests and career goals
            </p>
          </div>

          {/* Filter Toolbar */}
          <FilterToolbar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            eventCounts={eventCounts}
            onToggleView={handleToggleView}
            currentView={currentView}
          />

          {/* Recommended Events */}
          {filters?.search === '' && filters?.type === 'all' && (
            <RecommendedEvents
              events={recommendedEvents}
              onRSVP={handleRSVP}
            />
          )}

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-foreground">
                {filters?.search || filters?.type !== 'all' || filters?.location !== 'all' ?'Search Results' :'All Events'
                }
              </h2>
              <span className="text-muted-foreground">
                ({filteredEvents?.length} events)
              </span>
            </div>
          </div>

          {/* Event Display */}
          {currentView === 'grid' ? (
            <EventGrid
              events={filteredEvents}
              onRSVP={handleRSVP}
              loading={loading}
            />
          ) : (
            <CalendarView
              events={filteredEvents}
              onRSVP={handleRSVP}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default EventDiscovery;