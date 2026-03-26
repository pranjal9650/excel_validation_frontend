import React from "react";
import clsx from "clsx";

export function Button({ className, children, ...props }) {
  return (
    <button
      className={clsx(
        "bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-200",
        "flex items-center gap-2 justify-center",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}