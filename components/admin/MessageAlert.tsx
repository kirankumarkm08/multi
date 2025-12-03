import { SubmitMessage } from '@/types';

interface MessageAlertProps {
  message: SubmitMessage | null;
}

export function MessageAlert({ message }: MessageAlertProps) {
  if (!message) return null;

  const styles = {
    success: 'bg-green-50 border border-green-200 text-green-800',
    error: 'bg-red-50 border border-red-200 text-red-800'
  };

  return (
    <div className={`mb-6 p-4 rounded-md ${styles[message.type]}`}>
      {message.text}
    </div>
  );
}