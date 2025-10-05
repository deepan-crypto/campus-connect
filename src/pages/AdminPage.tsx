import { BarChart3, Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { mockEvents, mockProfiles, mockPosts, mockConnections } from '../data/mockData';

export function AdminPage() {
  const totalUsers = mockProfiles.length + 1;
  const totalEvents = mockEvents.length;
  const totalPosts = mockPosts.length;
  const totalConnections = mockConnections.filter((c) => c.status === 'accepted').length;

  const totalRsvps = mockEvents.reduce(
    (sum, event) => sum + event.rsvpCount.going + event.rsvpCount.interested,
    0
  );

  const avgEventRating =
    mockEvents.filter((e) => e.averageRating).reduce((sum, e) => sum + (e.averageRating || 0), 0) /
    mockEvents.filter((e) => e.averageRating).length;

  const eventsByType = mockEvents.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topEvents = [...mockEvents]
    .sort((a, b) => b.rsvpCount.going - a.rsvpCount.going)
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <span className="text-green-600 text-sm font-medium">+12%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{totalUsers}</p>
          <p className="text-sm text-gray-600">Total Users</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="text-green-600" size={24} />
            </div>
            <span className="text-green-600 text-sm font-medium">+8%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{totalEvents}</p>
          <p className="text-sm text-gray-600">Active Events</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <span className="text-green-600 text-sm font-medium">+24%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{totalConnections}</p>
          <p className="text-sm text-gray-600">Total Connections</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BarChart3 className="text-orange-600" size={24} />
            </div>
            <span className="text-green-600 text-sm font-medium">+15%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{totalRsvps}</p>
          <p className="text-sm text-gray-600">Event RSVPs</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Event Performance</h2>

          <div className="space-y-4">
            {topEvents.map((event, index) => (
              <div key={event.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="font-bold text-gray-400 text-lg w-6">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-sm text-gray-600">{event.eventType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{event.rsvpCount.going}</p>
                  <p className="text-xs text-gray-600">attendees</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Events by Category</h2>

          <div className="space-y-3">
            {Object.entries(eventsByType).map(([type, count]) => {
              const percentage = (count / totalEvents) * 100;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {type}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Engagement Metrics</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Event Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {avgEventRating.toFixed(1)} / 5.0
                </p>
              </div>
              <div className="text-yellow-500">
                {'⭐'.repeat(Math.round(avgEventRating))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Posts Published</p>
                <p className="text-2xl font-bold text-gray-900">{totalPosts}</p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Connection Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((totalConnections / totalUsers) * 100)}%
                </p>
              </div>
              <Users className="text-blue-600" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  New user registration spike
                </p>
                <p className="text-xs text-gray-600">12 new users in the last 24 hours</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <AlertCircle className="text-green-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-gray-900">Career Fair at capacity</p>
                <p className="text-xs text-gray-600">Event reached maximum attendance</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
              <AlertCircle className="text-purple-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-gray-900">High engagement post</p>
                <p className="text-xs text-gray-600">Latest announcement has 89 likes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
