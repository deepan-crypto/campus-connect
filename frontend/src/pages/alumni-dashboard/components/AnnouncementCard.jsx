import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const AnnouncementCard = ({ announcement, onLike, onComment, onShare }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getAuthorTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'faculty': return 'bg-accent/10 text-accent';
      case 'admin': return 'bg-error/10 text-error';
      case 'department': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleCommentSubmit = (e) => {
    e?.preventDefault();
    if (newComment?.trim()) {
      onComment(announcement?.id, newComment);
      setNewComment('');
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation-1 transition-all duration-200">
      <div className="flex items-start space-x-4">
        <div className="relative flex-shrink-0">
          <Image
            src={announcement?.author?.avatar}
            alt={announcement?.author?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAuthorTypeColor(announcement?.author?.type)}`}>
              {announcement?.author?.type}
            </span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{announcement?.author?.name}</h3>
              <p className="text-muted-foreground text-sm">{announcement?.author?.title}</p>
              <p className="text-muted-foreground text-xs">{formatTimeAgo(announcement?.createdAt)}</p>
            </div>
            
            <Button variant="ghost" size="sm" iconName="MoreHorizontal" iconSize={16} />
          </div>
          
          <div className="mt-3">
            <h4 className="font-semibold text-foreground text-lg mb-2">{announcement?.title}</h4>
            <div className="text-foreground text-sm leading-relaxed">
              {announcement?.content?.split('\n')?.map((paragraph, index) => (
                <p key={index} className="mb-2 last:mb-0">{paragraph}</p>
              ))}
            </div>
          </div>
          
          {announcement?.attachments && announcement?.attachments?.length > 0 && (
            <div className="mt-4">
              <div className="grid grid-cols-1 gap-3">
                {announcement?.attachments?.map((attachment, index) => (
                  <div key={index} className="border border-border rounded-lg p-3 bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <Icon name="Paperclip" size={16} className="text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{attachment?.name}</p>
                        <p className="text-xs text-muted-foreground">{attachment?.size}</p>
                      </div>
                      <Button variant="ghost" size="sm" iconName="Download" iconSize={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {announcement?.tags && announcement?.tags?.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {announcement?.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => onLike(announcement?.id)}
                  className={`flex items-center space-x-2 text-sm transition-colors ${
                    announcement?.isLiked 
                      ? 'text-error' :'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon 
                    name={announcement?.isLiked ? "Heart" : "Heart"} 
                    size={16} 
                    className={announcement?.isLiked ? "fill-current" : ""} 
                  />
                  <span>{announcement?.likesCount}</span>
                </button>
                
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon name="MessageCircle" size={16} />
                  <span>{announcement?.commentsCount}</span>
                </button>
                
                <button
                  onClick={() => onShare(announcement?.id)}
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon name="Share2" size={16} />
                  <span>Share</span>
                </button>
              </div>
              
              {announcement?.isPinned && (
                <div className="flex items-center space-x-1 text-warning">
                  <Icon name="Pin" size={14} />
                  <span className="text-xs font-medium">Pinned</span>
                </div>
              )}
            </div>
          </div>
          
          {showComments && (
            <div className="mt-4 pt-4 border-t border-border">
              <form onSubmit={handleCommentSubmit} className="mb-4">
                <div className="flex space-x-3">
                  <Image
                    src="/assets/images/no_image.png"
                    alt="Your avatar"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e?.target?.value)}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    iconName="Send"
                    iconSize={16}
                    disabled={!newComment?.trim()}
                  />
                </div>
              </form>
              
              <div className="space-y-3">
                {announcement?.recentComments?.map((comment, index) => (
                  <div key={index} className="flex space-x-3">
                    <Image
                      src={comment?.author?.avatar}
                      alt={comment?.author?.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <p className="text-sm font-medium text-foreground">{comment?.author?.name}</p>
                        <p className="text-sm text-foreground">{comment?.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(comment?.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;