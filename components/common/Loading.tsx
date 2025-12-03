import React from "react";
import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div className="   flex items-center justify-center">
      <div className="text-center text-gray-800 dark:text-gray-200">
        <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4 text-gray-950" />
        <p>Loading pages...</p>
      </div>
    </div>
  );
};

export default Loading;
