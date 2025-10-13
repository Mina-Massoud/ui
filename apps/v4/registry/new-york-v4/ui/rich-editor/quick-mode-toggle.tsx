"use client"

import { Eye, EyeOff, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "../button"
import { Separator } from "../separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../tooltip"

interface ToolbarProps {
  readOnly: boolean
  onReadOnlyChange: (readOnly: boolean) => void
}

export function QuickModeToggle({ readOnly, onReadOnlyChange }: ToolbarProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <TooltipProvider>
      <div className="bg-background fixed top-[4.5rem] right-2 z-[105] flex items-center gap-1 rounded-lg border p-1 shadow-lg md:top-20 md:right-4 md:p-1.5 lg:top-17">
        {/* Read-only toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={readOnly ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8 md:h-9 md:w-9"
              onClick={() => onReadOnlyChange(!readOnly)}
            >
              {readOnly ? (
                <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 md:h-4 md:w-4" />
              )}
              <span className="sr-only">
                {readOnly ? "View Only Mode" : "Edit Mode"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{readOnly ? "View Only Mode" : "Edit Mode"}</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5 md:h-6" />

        {/* Theme toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:h-9 md:w-9"
              onClick={toggleTheme}
            >
              <Sun className="h-3.5 w-3.5 scale-100 rotate-0 transition-all md:h-4 md:w-4 dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-3.5 w-3.5 scale-0 rotate-90 transition-all md:h-4 md:w-4 dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle Theme</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
