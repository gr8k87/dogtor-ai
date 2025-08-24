import * as React from "react"
import { Moon, Sun, Monitor, Palette } from "lucide-react"

import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useTheme, themeConfigs, type ColorTheme } from "../lib/theme-provider"

export function ThemeToggle() {
  const { theme, colorTheme, setTheme, setColorTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 px-0">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Theme Mode</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center">
          <Palette className="mr-2 h-4 w-4" />
          Color Theme
        </DropdownMenuLabel>
        
        {(Object.entries(themeConfigs) as [ColorTheme, typeof themeConfigs[ColorTheme]][]).map(([key, config]) => (
          <DropdownMenuItem 
            key={key} 
            onClick={() => setColorTheme(key as ColorTheme)}
            className={colorTheme === key ? "bg-accent" : ""}
          >
            <div className="flex items-center">
              <div className={`mr-3 h-3 w-3 rounded-full ${getThemeColor(key)}`} />
              <div>
                <div className="font-medium">{config.name}</div>
                <div className="text-xs text-muted-foreground">{config.description}</div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function getThemeColor(theme: ColorTheme): string {
  switch (theme) {
    case "default":
      return "bg-blue-500"
    case "green":
      return "bg-green-500"
    case "orange":
      return "bg-orange-500"
    case "purple":
      return "bg-purple-500"
    default:
      return "bg-blue-500"
  }
}