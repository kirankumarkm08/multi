import React from "react";

interface ZeroItemsProps {
  items?: any[];
  message?: string;
  Icon?: React.ElementType;
  className?: string;
}

const ZeroItems: React.FC<ZeroItemsProps> = ({ items, message, Icon, className }) => {


  return (
    <section className={className || "py-10"}>
      <div className="container mx-auto px-4">
        <div className="text-center">
          {Icon && <Icon className="w-16 h-16 mx-auto text-slate-600 dark:text-slate-400 mb-4" />}
          <h3 className="text-lg font-semibold text-white dark:text-white mb-2">
            No data available
          </h3>
          {message && <p className="text-slate-400 dark:text-slate-400">{message}</p>}
        </div>
      </div>
    </section>
  );
};

export default ZeroItems;
