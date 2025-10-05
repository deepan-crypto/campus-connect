import { useState } from 'react';
import { Bell, BellOff, Check, Trash2 } from 'lucide-react';
import { mockNotifications } from '../data/mockData';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays}d ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h ago`;
    } else {
      return 'Just now';
    }
  };

  const getNotificationIcon = (type: string) => {
    const colors = {
      connection: 'bg-blue-100 text-blue-600',
      mentorship: 'bg-purple-100 text-purple-600',
      event: 'bg-green-100 text-green-600',
      post: 'bg-orange-100 text-orange-600',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Check size={18} />
            <span className="text-sm font-medium">Mark all as read</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BellOff size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow ${
                !notification.read ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`p-3 rounded-full ${getNotificationIcon(
                    notification.type
                  )}`}
                >
                  <Bell size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {getTimeAgo(notification.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{notification.message}</p>

                  <div className="flex items-center space-x-3">
                    {notification.link && (
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        View Details
                      </button>
                    )}

                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                      >
                        Mark as read
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center space-x-1"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
