import { api } from './api';
import { ConnectionsData, Connection } from './types/connection';

// Get user's connections and connection requests
export async function getMyConnections(): Promise<ConnectionsData> {
  return api('/connections/me');
}

// Send a connection request
export async function sendConnectionRequest(receiverId: string): Promise<Connection> {
  return api('/connections/request', {
    method: 'POST',
    body: JSON.stringify({ receiverId }),
  });
}

// Respond to a connection request
export async function respondToConnectionRequest(connectionId: string, accept: boolean): Promise<Connection> {
  return api('/connections/respond', {
    method: 'POST',
    body: JSON.stringify({ connectionId, accept }),
  });
}

// Remove a connection
export async function removeConnection(connectionId: string): Promise<void> {
  return api(`/connections/${connectionId}`, {
    method: 'DELETE',
  });
}

// Get connection suggestions
export async function getConnectionSuggestions(limit = 10): Promise<any[]> {
  return api(`/connections/suggestions?limit=${limit}`);
}