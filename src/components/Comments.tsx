import React, { useState, useEffect } from 'react';
import { createComment, getComments, deleteComment, type Comment, type PaginatedComments } from '../api';
import { useAuth } from '../contexts/AuthContext';

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginatedComments['pagination'] | null>(null);
  const [page, setPage] = useState(1);

  // Fetch comments
  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await getComments(postId, page);
      setComments(response.comments);
      setPagination(response.pagination);
    } catch (err) {
      setError('Failed to load comments');
      console.error('Error loading comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, page]);

  // Handle new comment submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsLoading(true);
      const comment = await createComment(postId, newComment.trim());
      setComments(prevComments => [comment, ...prevComments]);
      setNewComment('');
      // Refresh pagination info
      const response = await getComments(postId, 1);
      setPagination(response.pagination);
    } catch (err) {
      setError('Failed to post comment');
      console.error('Error posting comment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle comment deletion
  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
      // Refresh pagination info
      const response = await getComments(postId, page);
      setPagination(response.pagination);
    } catch (err) {
      setError('Failed to delete comment');
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button
          type="submit"
          disabled={isLoading || !newComment.trim()}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <div className="p-2 text-red-600 bg-red-100 rounded">
          {error}
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {comment.author.profile.avatarUrl && (
                  <img
                    src={comment.author.profile.avatarUrl}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <div className="font-medium">{comment.author.name}</div>
                  <div className="text-sm text-gray-500">{comment.author.role}</div>
                </div>
              </div>
              {user?.id === comment.author.id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="mt-2 text-gray-700">{comment.content}</p>
            <div className="mt-2 text-sm text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={!pagination.hasMore}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}