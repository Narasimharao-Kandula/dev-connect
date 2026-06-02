import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useOnlineStore } from '../store/onlineStore';
import { socket } from '../api/socket';
import { toast } from 'sonner';

export function useSocket() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const { setOnline, setOffline } = useOnlineStore();
  const reconToast = useRef(false);

  useEffect(() => {
    if (!user || !token) {
      if (socket.connected) socket.disconnect();
      return;
    }

    socket.auth = { token };
    socket.connect();

    socket.on('notification:new', (notification) => {
      addNotification(notification);
      toast(notification.message, {
        description: 'New notification',
        action: { label: 'View', onClick: () => window.location.href = '/notifications' },
      });
    });

    socket.on('user:online', ({ userId }: { userId: string }) => setOnline(userId));
    socket.on('user:offline', ({ userId }: { userId: string }) => setOffline(userId));

    socket.on('connect', () => {
      if (reconToast.current) {
        toast.success('Reconnected');
        reconToast.current = false;
      }
    });

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') return;
      reconToast.current = true;
    });

    return () => {
      socket.off('notification:new');
      socket.off('user:online');
      socket.off('user:offline');
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, [user, token, addNotification, setOnline, setOffline]);
}
