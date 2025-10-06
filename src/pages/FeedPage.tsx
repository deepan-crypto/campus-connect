import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Image, Tag } from 'lucide-react';
import { mockPosts, mockProfiles } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import Comments from '../components/Comments';
import { getPosts, createPost } from '../api';

export function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(mockPosts);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);

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

  // All users can create posts now
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    postType: 'post',
    visibility: 'public',
    tags: [] as string[]
  });
  const [showTitleField, setShowTitleField] = useState(false);
  const [tag, setTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load actual posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getPosts();
        if (response.posts.length > 0) {
          setPosts(response.posts);
        }
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        // Keep using mock data if API fails
      }
    };
    
    fetchPosts();
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.content.trim()) {
      setError('Content is required');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const postData = {
        ...newPost,
        tags: newPost.tags.length ? newPost.tags : undefined,
        title: newPost.title.trim() || undefined
      };
      
      const createdPost = await createPost(postData);
      setPosts([createdPost, ...posts]);
      
      // Reset form
      setNewPost({
        title: '',
        content: '',
        postType: 'post',
        visibility: 'public',
        tags: []
      });
      setShowTitleField(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (tag.trim() && !newPost.tags.includes(tag.trim())) {
      setNewPost({...newPost, tags: [...newPost.tags, tag.trim()]});
      setTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewPost({...newPost, tags: newPost.tags.filter(t => t !== tagToRemove)});
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Campus Feed</h1>

      {user && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handlePostSubmit}>
            {showTitleField && (
              <input
                type="text"
                placeholder="Title (optional)"
                className="w-full px-4 py-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              />
            )}
            
            <textarea
              placeholder="Share your thoughts, questions, or updates..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              required
            />
            
            {/* Tag input */}
            <div className="flex flex-wrap mt-3 gap-2">
              {newPost.tags.map(tag => (
                <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1">
                    &times;
                  </button>
                </span>
              ))}
              
              <div className="flex items-center mt-1">
                <input
                  type="text"
                  placeholder="Add tag"
                  className="px-3 py-1 border border-gray-300 rounded-l-lg text-sm"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-200 rounded-r-lg text-gray-700 text-sm"
                  onClick={addTag}
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <button 
                  type="button"
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                  onClick={() => setShowTitleField(!showTitleField)}
                >
                  {showTitleField ? 'Hide title' : 'Add title'}
                </button>
                
                <select 
                  className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-2 py-1"
                  value={newPost.postType}
                  onChange={(e) => setNewPost({...newPost, postType: e.target.value})}
                >
                  <option value="post">Post</option>
                  <option value="update">Update</option>
                  {(user.role === 'faculty' || user.role === 'admin') && (
                    <option value="announcement">Announcement</option>
                  )}
                </select>
                
                <select 
                  className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-2 py-1"
                  value={newPost.visibility}
                  onChange={(e) => setNewPost({...newPost, visibility: e.target.value})}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  {(user.role === 'faculty' || user.role === 'admin') && (
                    <option value="faculty-only">Faculty Only</option>
                  )}
                </select>
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading || !newPost.content.trim()}
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium ${
                  isLoading || !newPost.content.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                } transition-colors`}
              >
                {isLoading ? 'Posting...' : 'Post'}
              </button>
            </div>
            
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </form>
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
                    {post.postType !== 'post' && (
                      <span className={`px-3 py-1 ${
                        post.postType === 'announcement' ? 'bg-blue-100 text-blue-700' : 
                        post.postType === 'update' ? 'bg-green-100 text-green-700' : 
                        'bg-purple-100 text-purple-700'
                      } text-xs font-medium rounded-full`}>
                        {post.postType.charAt(0).toUpperCase() + post.postType.slice(1)}
                      </span>
                    )}
                    {post.visibility && post.visibility !== 'public' && (
                      <span className={`ml-2 px-3 py-1 ${
                        post.visibility === 'private' ? 'bg-gray-100 text-gray-700' :
                        'bg-amber-100 text-amber-700'
                      } text-xs font-medium rounded-full`}>
                        {post.visibility.charAt(0).toUpperCase() + post.visibility.slice(1)}
                      </span>
                    )}
                  </div>

                  {post.title && (
                    <h4 className="text-lg font-semibold mt-2 mb-1">{post.title}</h4>
                  )}

                  <p className="mt-2 text-gray-800 leading-relaxed">{post.content}</p>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap mt-3 gap-1">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

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

                    <button 
                      onClick={() => {
                        setExpandedComments(prev => 
                          prev.includes(post.id) 
                            ? prev.filter(id => id !== post.id)
                            : [...prev, post.id]
                        );
                      }}
                      className={`flex items-center space-x-2 transition-colors ${
                        expandedComments.includes(post.id)
                          ? 'text-blue-600'
                          : 'text-gray-500 hover:text-blue-600'
                      }`}
                    >
                      <MessageCircle size={20} />
                      <span className="text-sm font-medium">{post.commentsCount}</span>
                    </button>

                    <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors">
                      <Share2 size={20} />
                      <span className="text-sm font-medium">Share</span>
                    </button>
                  </div>

                  {/* Comments section */}
                  {expandedComments.includes(post.id) && (
                    <div className="mt-4">
                      <Comments postId={post.id} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
