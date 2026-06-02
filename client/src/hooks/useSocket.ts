import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { socket } from '../api/socket';

export function useSocket() {
  const user = useAuthStore((s) => s.user);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (!user) return;

    socket.on('notification:new', (notification) => {
      addNotification(notification);
    });

    return () => {
      socket.off('notification:new');
    };
  }, [user, addNotification]);
}
