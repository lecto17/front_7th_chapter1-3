import { Alert, AlertTitle, IconButton, Stack } from '@mui/material';
import { Close } from '@mui/icons-material';

/**
 * Notification type
 */
export interface Notification {
  /** Unique identifier for the notification */
  id: string;
  /** Notification message to display */
  message: string;
}

/**
 * Props for the NotificationAlert component
 */
interface NotificationAlertProps {
  /** Array of notifications to display */
  notifications: Notification[];
  /** Callback fired when a notification is dismissed */
  onDismiss: (index: number) => void;
}

/**
 * NotificationAlert component displays event notifications in a fixed position
 * at the top-right corner of the screen
 */
const NotificationAlert = ({ notifications, onDismiss }: NotificationAlertProps) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
      {notifications.map((notification, index) => (
        <Alert
          key={index}
          severity="info"
          sx={{ width: 'auto' }}
          action={
            <IconButton size="small" onClick={() => onDismiss(index)}>
              <Close />
            </IconButton>
          }
        >
          <AlertTitle>{notification.message}</AlertTitle>
        </Alert>
      ))}
    </Stack>
  );
};

export default NotificationAlert;
