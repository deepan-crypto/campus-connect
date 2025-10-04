import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import FilterPanel from './components/FilterPanel';
import MentorCard from './components/MentorCard';
import RecommendedMentors from './components/RecommendedMentors';
import MentorshipRequestModal from './components/MentorshipRequestModal';
import EmptyState from './components/EmptyState';

const MentorDiscovery = () => {
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    industry: '',
    availability: '',
    sortBy: 'match-score',
    graduationYearFrom: '',
    graduationYearTo: '',
    skills: [],
    minRating: 0
  });
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Mock mentor data
  const mockMentors = [
    {
      id: 1,
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400",
      currentPosition: "Senior Software Engineer",
      company: "Google",
      department: "Computer Science",
      graduationYear: 2018,
      bio: "Passionate about helping students transition into tech careers. Experienced in full-stack development, system design, and technical interviews.",
      skills: ["JavaScript", "Python", "React", "System Design", "Leadership"],
      availability: "available",
      availableSlots: 3,
      nextAvailable: "Dec 15",
      matchScore: 92,
      matchDetails: {
        skillsOverlap: 85,
        industryMatch: 95,
        careerStage: 90
      },
      menteeCount: 12,
      rating: 4.9,
      responseTime: "< 24h"
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      currentPosition: "Product Manager",
      company: "Microsoft",
      department: "Business Administration",
      graduationYear: 2016,
      bio: "Helping students navigate product management careers and develop strategic thinking skills. Former consultant with experience in multiple industries.",
      skills: ["Product Strategy", "Data Analysis", "Leadership", "Consulting", "Project Management"],
      availability: "limited",
      availableSlots: 1,
      nextAvailable: "Jan 5",
      matchScore: 78,
      matchDetails: {
        skillsOverlap: 70,
        industryMatch: 80,
        careerStage: 85
      },
      menteeCount: 8,
      rating: 4.7,
      responseTime: "< 48h"
    },
    {
      id: 3,
      name: "Dr. Emily Watson",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
      currentPosition: "Data Science Director",
      company: "Netflix",
      department: "Data Science",
      graduationYear: 2014,
      bio: "PhD in Statistics with 8+ years in data science. Passionate about mentoring women in STEM and helping students break into data science roles.",
      skills: ["Machine Learning", "Python", "Statistics", "Data Visualization", "Team Leadership"],
      availability: "available",
      availableSlots: 2,
      nextAvailable: "Dec 20",
      matchScore: 88,
      matchDetails: {
        skillsOverlap: 90,
        industryMatch: 85,
        careerStage: 88
      },
      menteeCount: 15,
      rating: 4.8,
      responseTime: "< 12h"
    },
    {
      id: 4,
      name: "James Thompson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      currentPosition: "UX Design Lead",
      company: "Airbnb",
      department: "Design",
      graduationYear: 2017,
      bio: "Creative problem solver with expertise in user experience design and design thinking. Love helping students build strong design portfolios.",
      skills: ["UX Design", "Design Thinking", "Prototyping", "User Research", "Creative Leadership"],
      availability: "unavailable",
      availableSlots: 0,
      nextAvailable: "Feb 1",
      matchScore: 65,
      matchDetails: {
        skillsOverlap: 60,
        industryMatch: 70,
        careerStage: 65
      },
      menteeCount: 10,
      rating: 4.6,
      responseTime: "< 72h"
    },
    {
      id: 5,
      name: "Lisa Park",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      currentPosition: "Marketing Director",
      company: "Spotify",
      department: "Marketing",
      graduationYear: 2015,
      bio: "Digital marketing expert with experience in growth marketing, brand strategy, and content marketing. Passionate about helping students build marketing careers.",
      skills: ["Digital Marketing", "Brand Strategy", "Content Marketing", "Analytics", "Growth Hacking"],
      availability: "available",
      availableSlots: 4,
      nextAvailable: "Dec 18",
      matchScore: 82,
      matchDetails: {
        skillsOverlap: 75,
        industryMatch: 85,
        careerStage: 85
      },
      menteeCount: 9,
      rating: 4.5,
      responseTime: "< 24h"
    },
    {
      id: 6,
      name: "David Kim",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      currentPosition: "Investment Banker",
      company: "Goldman Sachs",
      department: "Finance",
      graduationYear: 2013,
      bio: "Finance professional with expertise in investment banking, financial modeling, and corporate finance. Helping students break into finance careers.",
      skills: ["Financial Modeling", "Investment Banking", "Corporate Finance", "Excel", "Valuation"],
      availability: "limited",
      availableSlots: 1,
      nextAvailable: "Jan 10",
      matchScore: 71,
      matchDetails: {
        skillsOverlap: 65,
        industryMatch: 75,
        careerStage: 73
      },
      menteeCount: 6,
      rating: 4.4,
      responseTime: "< 48h"
    }
  ];

  const [mentors, setMentors] = useState(mockMentors);
  const [filteredMentors, setFilteredMentors] = useState(mockMentors);

  // Get recommended mentors (top 3 by match score)
  const recommendedMentors = mockMentors?.filter(mentor => mentor?.matchScore >= 80)?.sort((a, b) => b?.matchScore - a?.matchScore)?.slice(0, 3);

  useEffect(() => {
    filterMentors();
  }, [filters, mentors]);

  const filterMentors = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      let filtered = [...mentors];

      // Search filter
      if (filters?.search) {
        const searchTerm = filters?.search?.toLowerCase();
        filtered = filtered?.filter(mentor =>
          mentor?.name?.toLowerCase()?.includes(searchTerm) ||
          mentor?.company?.toLowerCase()?.includes(searchTerm) ||
          mentor?.currentPosition?.toLowerCase()?.includes(searchTerm) ||
          mentor?.skills?.some(skill => skill?.toLowerCase()?.includes(searchTerm))
        );
      }

      // Department filter
      if (filters?.department) {
        filtered = filtered?.filter(mentor => 
          mentor?.department?.toLowerCase()?.replace(/\s+/g, '-') === filters?.department
        );
      }

      // Industry filter
      if (filters?.industry) {
        filtered = filtered?.filter(mentor =>
          mentor?.company?.toLowerCase()?.includes(filters?.industry) ||
          mentor?.currentPosition?.toLowerCase()?.includes(filters?.industry)
        );
      }

      // Availability filter
      if (filters?.availability) {
        filtered = filtered?.filter(mentor => mentor?.availability === filters?.availability);
      }

      // Graduation year range
      if (filters?.graduationYearFrom) {
        filtered = filtered?.filter(mentor => mentor?.graduationYear >= parseInt(filters?.graduationYearFrom));
      }
      if (filters?.graduationYearTo) {
        filtered = filtered?.filter(mentor => mentor?.graduationYear <= parseInt(filters?.graduationYearTo));
      }

      // Skills filter
      if (filters?.skills && filters?.skills?.length > 0) {
        filtered = filtered?.filter(mentor =>
          filters?.skills?.some(skill =>
            mentor?.skills?.some(mentorSkill =>
              mentorSkill?.toLowerCase()?.includes(skill?.toLowerCase())
            )
          )
        );
      }

      // Rating filter
      if (filters?.minRating > 0) {
        filtered = filtered?.filter(mentor => mentor?.rating >= filters?.minRating);
      }

      // Sort mentors
      filtered?.sort((a, b) => {
        switch (filters?.sortBy) {
          case 'match-score':
            return b?.matchScore - a?.matchScore;
          case 'graduation-year':
            return b?.graduationYear - a?.graduationYear;
          case 'availability':
            const availabilityOrder = { available: 3, limited: 2, unavailable: 1 };
            return availabilityOrder?.[b?.availability] - availabilityOrder?.[a?.availability];
          case 'rating':
            return b?.rating - a?.rating;
          case 'response-time':
            const responseOrder = { '< 12h': 4, '< 24h': 3, '< 48h': 2, '< 72h': 1 };
            return responseOrder?.[b?.responseTime] - responseOrder?.[a?.responseTime];
          default:
            return 0;
        }
      });

      setFilteredMentors(filtered);
      setIsLoading(false);
    }, 300);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      department: '',
      industry: '',
      availability: '',
      sortBy: 'match-score',
      graduationYearFrom: '',
      graduationYearTo: '',
      skills: [],
      minRating: 0
    });
  };

  const handleRequestMentorship = (mentor) => {
    setSelectedMentor(mentor);
    setIsRequestModalOpen(true);
  };

  const handleSubmitRequest = async (requestData) => {
    console.log('Mentorship request submitted:', requestData);
    // Here you would typically send the request to your backend
    alert(`Mentorship request sent to ${selectedMentor?.name}! They will respond within ${selectedMentor?.responseTime}.`);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setMentors([...mockMentors]);
      setIsLoading(false);
    }, 1000);
  };

  const hasActiveFilters = Object.values(filters)?.some(value => 
    Array.isArray(value) ? value?.length > 0 : value !== '' && value !== 'match-score' && value !== 0
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mentor Discovery - CampusConnect</title>
        <meta name="description" content="Find and connect with alumni mentors who can guide your career journey. Discover mentors based on skills, industry, and compatibility." />
      </Helmet>
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Discover Mentors</h1>
                <p className="text-muted-foreground">
                  Connect with experienced alumni who can guide your career journey
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  iconName="Grid3X3"
                />
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  iconName="List"
                />
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            mentorCount={filteredMentors?.length}
            onClearFilters={handleClearFilters}
          />

          {/* Recommended Mentors */}
          {!hasActiveFilters && (
            <RecommendedMentors
              mentors={recommendedMentors}
              onRequestMentorship={handleRequestMentorship}
            />
          )}

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-foreground">
                {hasActiveFilters ? 'Search Results' : 'All Mentors'}
              </h2>
              {isLoading && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredMentors?.length} of {mentors?.length} mentors
            </div>
          </div>

          {/* Mentors Grid/List */}
          {filteredMentors?.length > 0 ? (
            <div className={`${
              viewMode === 'grid' ?'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' :'space-y-4'
            }`}>
              {filteredMentors?.map((mentor) => (
                <MentorCard
                  key={mentor?.id}
                  mentor={mentor}
                  onRequestMentorship={handleRequestMentorship}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              hasFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
              onRefresh={handleRefresh}
            />
          )}

          {/* Load More Button */}
          {filteredMentors?.length > 0 && filteredMentors?.length >= 9 && (
            <div className="text-center mt-12">
              <Button
                variant="outline"
                size="lg"
                iconName="ChevronDown"
                iconPosition="right"
              >
                Load More Mentors
              </Button>
            </div>
          )}
        </div>
      </main>
      {/* Mentorship Request Modal */}
      <MentorshipRequestModal
        mentor={selectedMentor}
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false);
          setSelectedMentor(null);
        }}
        onSubmit={handleSubmitRequest}
      />
    </div>
  );
};

export default MentorDiscovery;