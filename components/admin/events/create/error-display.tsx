interface ErrorDisplayProps {
  error: string | null;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded whitespace-pre-wrap">
      {error}
    </div>
  );
}
