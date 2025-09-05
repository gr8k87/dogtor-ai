import React from "react";
import { ProfileButton } from "./ProfileButton";
import { ThemeToggle } from "./theme-toggle";
import { AppIcons, ArrowLeft } from "./icons";

interface GlobalHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  centerContent?: React.ReactNode;
}

export function GlobalHeader({
  title = "Dogtor",
  showBackButton = false,
  onBackClick,
  centerContent,
}: GlobalHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {showBackButton && onBackClick ? (
            <button
              onClick={onBackClick}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <AppIcons.logo size={50} className="text-primary" />
          )}
        </div>

        {/* Center content (optional) */}
        {centerContent && (
          <div className="flex-1 flex justify-center">{centerContent}</div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ProfileButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
