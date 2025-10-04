import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { getFileSignedUrl } from '../../../services/messagingService';

const MessageBubble = ({ message, isOwn, onReply }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    const loadFileUrl = async () => {
      if (message?.file_path && (message?.message_type === 'file' || message?.message_type === 'image')) {
        try {
          const { data: signedUrl, error } = await getFileSignedUrl(message?.file_path, 3600);
          if (!error && signedUrl) {
            setFileUrl(signedUrl);
          }
        } catch (error) {
          console.error('Error loading file URL:', error);
        }
      }
    };

    loadFileUrl();
  }, [message?.file_path, message?.message_type]);

  const formatMessageTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch (error) {
      return '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <Icon name="Clock" size={14} className="text-muted-foreground" />;
      case 'sent':
        return <Icon name="Check" size={14} className="text-muted-foreground" />;
      case 'delivered':
        return <Icon name="CheckCheck" size={14} className="text-muted-foreground" />;
      case 'read':
        return <Icon name="CheckCheck" size={14} className="text-primary" />;
      default:
        return null;
    }
  };

  const handleDownload = () => {
    if (fileUrl && message?.file_name) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = message?.file_name;
      document.body?.appendChild(link);
      link?.click();
      document.body?.removeChild(link);
    }
  };

  const renderFileContent = () => {
    if (!message?.file_path) return null;

    if (message?.message_type === 'image') {
      return (
        <div className="relative group">
          {fileUrl ? (
            <div className="relative">
              <Image
                src={fileUrl}
                alt={message?.file_name || 'Image'}
                className="max-w-sm max-h-64 rounded-lg object-cover cursor-pointer"
                onClick={() => window.open(fileUrl, '_blank')}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg" />
              <button
                onClick={handleDownload}
                className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon name="Download" size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <Icon name="Image" size={20} className="text-muted-foreground animate-pulse" />
              <span className="text-sm text-muted-foreground">Loading image...</span>
            </div>
          )}
        </div>
      );
    }

    if (message?.message_type === 'file') {
      const getFileIcon = (fileType) => {
        if (fileType?.includes('pdf')) return 'FileText';
        if (fileType?.includes('word')) return 'FileText';
        if (fileType?.includes('text')) return 'FileText';
        return 'File';
      };

      return (
        <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg max-w-sm cursor-pointer hover:bg-muted/80 transition-colors" onClick={handleDownload}>
          <Icon name={getFileIcon(message?.file_type)} size={24} className="text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {message?.file_name || 'Unknown file'}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(message?.file_size)}
            </p>
          </div>
          <Icon name="Download" size={16} className="text-muted-foreground flex-shrink-0" />
        </div>
      );
    }

    return null;
  };

  const renderReplyPreview = () => {
    if (!message?.reply_message) return null;

    return (
      <div className="mb-2 p-2 bg-muted/50 border-l-2 border-l-primary rounded">
        <p className="text-xs font-medium text-muted-foreground mb-1">
          Replying to message
        </p>
        <p className="text-sm text-foreground truncate">
          {message?.reply_message?.content || 'File attachment'}
        </p>
      </div>
    );
  };

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
        {/* Avatar for received messages */}
        {!isOwn && (
          <div className="flex-shrink-0 mb-1">
            <Image
              src={message?.sender?.avatar_url || '/assets/images/no_image.png'}
              alt={message?.sender?.display_name || 'User'}
              className="w-6 h-6 rounded-full object-cover"
            />
          </div>
        )}

        {/* Message Actions */}
        {showActions && (
          <div className={`flex items-center space-x-1 ${isOwn ? 'mr-2' : 'ml-2'} mb-1`}>
            <button
              onClick={() => onReply?.(message)}
              className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Icon name="Reply" size={14} className="text-muted-foreground" />
            </button>
            <button className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <Icon name="MoreVertical" size={14} className="text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Message Content */}
        <div
          className={`rounded-2xl px-4 py-2 max-w-full ${
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          {/* Reply preview */}
          {renderReplyPreview()}

          {/* Sender name for group chats */}
          {!isOwn && message?.sender?.display_name && (
            <p className="text-xs font-medium mb-1 opacity-70">
              {message?.sender?.display_name}
            </p>
          )}

          {/* File content */}
          {renderFileContent()}

          {/* Text content */}
          {message?.content && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message?.content}
            </p>
          )}

          {/* Message metadata */}
          <div className={`flex items-center space-x-1 mt-1 ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}>
            <span className="text-xs opacity-70">
              {formatMessageTime(message?.created_at)}
            </span>
            {isOwn && getStatusIcon(message?.status)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;