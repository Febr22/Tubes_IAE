import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import useNotificationSocket from '../hooks/useNotificationSocket';

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);

  const isLoggedIn = !!localStorage.getItem('access_token');

  // Load notifikasi awal dari REST API
  const fetchInitial = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const [list, count] = await Promise.all([
        api.get('notifikasi/'),
        api.get('notifikasi/unread-count/'),
      ]);
      setNotifications(list.data);
      setUnreadCount(count.data.unread_count);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, [isLoggedIn]);

  useEffect(() => { fetchInitial(); }, [fetchInitial]);

  // Handler pesan dari WebSocket
  const handleSocketMessage = useCallback((msg) => {
    if (msg.type === 'connected') {
      setUnreadCount(msg.unread_count || 0);
    } else if (msg.type === 'notification') {
      setNotifications((prev) => [msg.data, ...prev]);
      setUnreadCount((c) => c + 1);
      setToast(msg.data);
      setTimeout(() => setToast(null), 4000);
    }
  }, []);

  const { isConnected } = useNotificationSocket(
    isLoggedIn ? handleSocketMessage : null
  );

  const markAsRead = async (id) => {
    try {
      await api.post(`notifikasi/${id}/read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) { console.error(e); }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('notifikasi/read-all/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) { console.error(e); }
  };

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, isConnected,
      markAsRead, markAllAsRead, refetch: fetchInitial,
    }}>
      {children}
      {toast && (
        <div className="fixed top-20 right-4 z-[100] bg-white border border-blue-200 shadow-xl rounded-2xl p-4 w-80 animate-in slide-in-from-right duration-300">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 animate-pulse" />
            <div className="flex-1">
              <p className="font-bold text-sm text-slate-800">{toast.judul}</p>
              <p className="text-xs text-slate-600 mt-1">{toast.pesan}</p>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}