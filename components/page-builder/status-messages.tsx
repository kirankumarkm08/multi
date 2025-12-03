interface StatusMessagesProps {
  saveSuccess: boolean;
  saveError: string | null;
  loadError: string | null;
  usedFallback: boolean;
  pageType: string;
}

export function StatusMessages({
  saveSuccess,
  saveError,
  loadError,
  usedFallback,
  pageType,
}: StatusMessagesProps) {
  return (
    <>
      {saveSuccess && (
        <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800">
          <p className="font-medium">
            Page ({pageType}) saved successfully!
          </p>
          {usedFallback && (
            <p className="text-sm mt-1">
              Note: Saved using fallback method. Please verify the page.
            </p>
          )}
        </div>
      )}

      {saveError && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800">
          <p className="font-medium">Error Saving Page</p>
          <p className="text-sm">{saveError}</p>
        </div>
      )}

      {loadError && (
        <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800">
          <p className="font-medium">Loading Warning</p>
          <p className="text-sm">{loadError}</p>
        </div>
      )}
    </>
  );
}
