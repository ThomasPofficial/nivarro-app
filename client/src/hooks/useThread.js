import { useState, useEffect } from 'react';
import api from '../api';
import { connectSocket, getSocket } from '../socket';

export function useThread(token) {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    if (!token) return;
    connectSocket(token);

    api.get('/threads').then(res => setThreads(res.data)).catch(console.error);

    const socket = getSocket();
    if (!socket) return;

    function onThreadUpdated(data) {
      setThreads(prev => {
        const exists = prev.find(t => t._id === data.thread_id);
        const entry = data.type === 'group'
          ? { _id: data.thread_id, type: 'group', name: data.group_name, members: data.members, last_message: data.last_message, unread_count: 0 }
          : { _id: data.thread_id, type: 'dm', participant: data.participant, last_message: data.last_message, unread_count: 0 };
        if (exists) {
          return prev
            .map(t => t._id === data.thread_id ? { ...t, last_message: data.last_message } : t)
            .sort((a, b) => new Date(b.last_message?.timestamp) - new Date(a.last_message?.timestamp));
        }
        return [entry, ...prev];
      });
    }

    function onUnreadUpdate({ thread_id, unread_count }) {
      setThreads(prev => prev.map(t => t._id === thread_id ? { ...t, unread_count } : t));
    }

    socket.on('thread_updated', onThreadUpdated);
    socket.on('unread_update', onUnreadUpdate);
    return () => {
      socket.off('thread_updated', onThreadUpdated);
      socket.off('unread_update', onUnreadUpdate);
    };
  }, [token]);

  return threads;
}
