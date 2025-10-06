import { supabase } from './lib/supabase';

const API_URL = 'http://localhost:4000/api';

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    role: string;
    profile: {
      avatarUrl: string | null;
    };
  };
}

export interface PaginatedComments {
  comments: Comment[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    hasMore: boolean;
  };
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.data.session?.access_token}`,
  };
}

export async function api(path: string, options: RequestInit = {}): Promise<any> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Comment-related API functions
export async function createComment(postId: string, content: string): Promise<Comment> {
  return api(`/comments/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function getComments(postId: string, page = 1, limit = 10): Promise<PaginatedComments> {
  return api(`/comments/posts/${postId}/comments?page=${page}&limit=${limit}`);
}

export async function deleteComment(commentId: string): Promise<void> {
  return api(`/comments/comments/${commentId}`, {
    method: 'DELETE',
  });
}

export { supabase };
