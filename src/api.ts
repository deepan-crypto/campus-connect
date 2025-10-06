import { supabase } from './lib/supabase';
import { Post } from './types';

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
  // Get current session from Supabase
  const session = await supabase.auth.getSession();
  const token = session?.data?.session?.access_token;
  
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
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
    // Try to get error message from response
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      // If we can't parse the error message, use status text
      errorMessage = response.statusText || errorMessage;
    }
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

// Post-related API functions
export interface PostData {
  title?: string;
  content: string;
  imageUrl?: string;
  postType?: string;
  visibility?: string;
  tags?: string[];
}

export interface PaginatedPosts {
  posts: Post[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
  };
}

export async function createPost(postData: PostData): Promise<Post> {
  return api('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
}

export async function getPosts(page = 1, limit = 10): Promise<PaginatedPosts> {
  return api(`/posts?page=${page}&limit=${limit}`);
}

export async function getPost(postId: string): Promise<Post> {
  return api(`/posts/${postId}`);
}

export async function likePost(postId: string): Promise<{ liked: boolean; post: Post }> {
  return api(`/posts/${postId}/like`, {
    method: 'POST',
  });
}

export { supabase };
