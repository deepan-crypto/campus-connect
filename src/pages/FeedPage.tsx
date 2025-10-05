import { useState } from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { mockPosts, mockProfiles } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

export function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(mockPosts);

  const getAuthorProfile = (authorId: string) => {
    return mockProfiles.find((p) => p.id === authorId);
  };

  const toggleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              userLiked: !post.userLiked,
              likesCount: post.userLiked ? post.likesCount - 1 : post.likesCount + 1,
            }
          : post
      )
    );
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

  const canCreatePost = user?.role === 'faculty' || user?.role === 'admin';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Campus Feed</h1>

      {canCreatePost && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <textarea
            placeholder="Share an announcement or update..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-3">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Post
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {posts.map((post) => {
          const author = getAuthorProfile(post.authorId);

          return (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                {author?.avatarUrl ? (
                  <img
                    src={author.avatarUrl}
                    alt={`${author.firstName} ${author.lastName}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {author?.firstName?.[0]}
                    {author?.lastName?.[0]}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {author?.firstName} {author?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {author?.department} • {getTimeAgo(post.createdAt)}
                      </p>
                    </div>
                    {post.postType === 'announcement' && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        Announcement
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-gray-800 leading-relaxed">{post.content}</p>

                  <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        post.userLiked
                          ? 'text-red-600'
                          : 'text-gray-500 hover:text-red-600'
                      }`}
                    >
                      <Heart
                        size={20}
                        fill={post.userLiked ? 'currentColor' : 'none'}
                      />
                      <span className="text-sm font-medium">{post.likesCount}</span>
                    </button>

                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <MessageCircle size={20} />
                      <span className="text-sm font-medium">{post.commentsCount}</span>
                    </button>

                    <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors">
                      <Share2 size={20} />
                      <span className="text-sm font-medium">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
