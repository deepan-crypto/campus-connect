import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AnnouncementCard = ({ announcement, onLike, onComment }) => {
  const [isLiked, setIsLiked] = useState(announcement?.isLiked || false);
  const [likeCount, setLikeCount] = useState(announcement?.likeCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(announcement?.comments || []);

  const handleLike = async () => {
    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
      await onLike(announcement?.id, newLikedState);
    } catch (error) {
      // Revert on error
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      console.error('Like failed:', error);
    }
  };

  const handleComment = async (e) => {
    e?.preventDefault();
    if (!newComment?.trim()) return;

    try {
      const comment = {
        id: Date.now(),
        author: 'You',
        content: newComment,
        timestamp: new Date(),
        avatar: '/assets/images/no_image.png'
      };
      
      setComments(prev => [...prev, comment]);
      setNewComment('');
      await onComment(announcement?.id, newComment);
    } catch (error) {
      console.error('Comment failed:', error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getAuthorRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'faculty': return 'bg-accent text-accent-foreground';
      case 'admin': return 'bg-error text-error-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation-1 transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start space-x-3 mb-4">
        <Image
          src={announcement?.author?.avatar}
          alt={announcement?.author?.name}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold text-card-foreground">{announcement?.author?.name}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAuthorRoleColor(announcement?.author?.role)}`}>
              {announcement?.author?.role}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{announcement?.author?.department}</p>
          <p className="text-xs text-muted-foreground">{formatTimeAgo(announcement?.timestamp)}</p>
        </div>
        <Button variant="ghost" size="icon">
          <Icon name="MoreHorizontal" size={16} />
        </Button>
      </div>
      {/* Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground mb-2">{announcement?.title}</h3>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {announcement?.content}
        </p>
        
        {announcement?.attachments && announcement?.attachments?.length > 0 && (
          <div className="mt-3 space-y-2">
            {announcement?.attachments?.map((attachment, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                <Icon name="Paperclip" size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{attachment?.name}</span>
                <Button variant="ghost" size="sm" iconName="Download">
                  Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            iconName={isLiked ? "Heart" : "Heart"}
            iconPosition="left"
            className={isLiked ? "text-error" : ""}
          >
            {likeCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            iconName="MessageCircle"
            iconPosition="left"
          >
            {comments?.length}
          </Button>
          <Button variant="ghost" size="sm" iconName="Share">
            Share
          </Button>
        </div>
        
        {announcement?.priority === 'high' && (
          <div className="flex items-center space-x-1 text-error">
            <Icon name="AlertTriangle" size={16} />
            <span className="text-sm font-medium">Important</span>
          </div>
        )}
      </div>
      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border">
          {/* Comment Form */}
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex space-x-3">
              <Image
                src="/assets/images/no_image.png"
                alt="Your avatar"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e?.target?.value)}
                  placeholder="Write a comment..."
                  className="w-full p-2 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  rows="2"
                />
                <div className="flex justify-end mt-2">
                  <Button type="submit" size="sm" disabled={!newComment?.trim()}>
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {comments?.map((comment) => (
              <div key={comment?.id} className="flex space-x-3">
                <Image
                  src={comment?.avatar}
                  alt={comment?.author}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-card-foreground">{comment?.author}</span>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(comment?.timestamp)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment?.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementCard;