import React from 'react'
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

const DarkmodeBtn = () => {
    const { theme, toggleTheme } = useTheme();

  return (
    <div>  <button
    onClick={toggleTheme}
    className="p-1.5 ml-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
  >
    {theme === "light" ? (
      <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
    ) : (
      <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
    )}
  </button></div>
  )
}

export default DarkmodeBtn