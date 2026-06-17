import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } = useNotifications();

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition relative"
        title="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 min-w-[18px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span
          className={`absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-300'}`}
          title={isConnected ? 'Realtime aktif' : 'Offline'}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 max-w-[95vw] bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Notifikasi</h3>
              {notifications.some((n) => !n.is_read) && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Belum ada notifikasi.
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => !n.is_read && markAsRead(n.id)}
                    className={`w-full text-left p-4 border-b border-slate-50 transition hover:bg-slate-50 ${
                      !n.is_read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!n.is_read && (
                        <span className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-800">{n.judul}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{n.pesan}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{formatTime(n.tanggal_kirim)}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}