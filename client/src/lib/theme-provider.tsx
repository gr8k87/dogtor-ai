import * as React from "react"

type Theme = "light" | "dark"
type ColorTheme = "default" | "green" | "orange" | "purple"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColorTheme?: ColorTheme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  colorTheme: ColorTheme
  setTheme: (theme: Theme) => void
  setColorTheme: (colorTheme: ColorTheme) => void
  toggleTheme: () => void
}

const initialState: ThemeProviderState = {
  theme: "light",
  colorTheme: "default",
  setTheme: () => null,
  setColorTheme: () => null,
  toggleTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  defaultColorTheme = "default",
  storageKey = "dogtor-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  
  const [colorTheme, setColorTheme] = React.useState<ColorTheme>(
    () => (localStorage.getItem(storageKey + "-color") as ColorTheme) || defaultColorTheme
  )

  React.useEffect(() => {
    const root = window.document.documentElement

    // Remove all existing theme classes
    root.classList.remove("light", "dark", "theme-green", "theme-orange", "theme-purple")

    // Add the current theme classes
    root.classList.add(theme)
    if (colorTheme !== "default") {
      root.classList.add(`theme-${colorTheme}`)
    }

    // Store in localStorage
    localStorage.setItem(storageKey, theme)
    localStorage.setItem(storageKey + "-color", colorTheme)
  }, [theme, colorTheme, storageKey])

  const value = {
    theme,
    colorTheme,
    setTheme: (theme: Theme) => {
      setTheme(theme)
    },
    setColorTheme: (colorTheme: ColorTheme) => {
      setColorTheme(colorTheme)
    },
    toggleTheme: () => {
      setTheme(theme === "light" ? "dark" : "light")
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

// Theme configurations for easy access
export const themeConfigs = {
  default: {
    name: "Professional Blue",
    description: "Clean and professional blue theme",
    class: "default"
  },
  green: {
    name: "Veterinary Green",
    description: "Nature-inspired green theme for veterinary care",
    class: "green"
  },
  orange: {
    name: "Warm Orange",
    description: "Friendly and approachable orange theme",
    class: "orange"
  },
  purple: {
    name: "Medical Purple",
    description: "Professional purple theme for healthcare",
    class: "purple"
  }
} as const

export type { Theme, ColorTheme }