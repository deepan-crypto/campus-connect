import { User, Profile } from './index';

export interface Connection {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  requesterId: string;
  receiverId: string;
  requester?: {
    id: string;
    name: string;
    email: string;
    role: string;
    profile: Profile | null;
  };
  receiver?: {
    id: string;
    name: string;
    email: string;
    role: string;
    profile: Profile | null;
  };
}

export interface FormattedConnection {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    profile: Profile | null;
  };
  status: string;
  createdAt: string;
}

export interface ConnectionsData {
  connections: FormattedConnection[];
  pendingRequests: Connection[];
  sentRequests: Connection[];
}