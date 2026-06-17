import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = 'ws://127.0.0.1:8000/ws/notifikasi/';

export default function useNotificationSocket(onMessage) {
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const pingTimer = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Heartbeat tiap 25 detik
      pingTimer.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 25000);
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (onMessage) onMessage(msg);
      } catch (err) {
        console.error('WS parse error', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      clearInterval(pingTimer.current);
      // Auto-reconnect setelah 3 detik (kalau user masih login)
      if (localStorage.getItem('access_token')) {
        reconnectTimer.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => ws.close();
  }, [onMessage]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      clearInterval(pingTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return { isConnected };
}