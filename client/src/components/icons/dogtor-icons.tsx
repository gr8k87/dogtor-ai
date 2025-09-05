import * as React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number | string;
  className?: string;
}

// DogtorAI Logo - Vertical layout for splash screens
export const DogtorLogoVertical: React.FC<LogoProps> = ({
  size = 48,
  className = "",
  ...props
}) => (
  <div className={`flex flex-col items-center gap-3 ${className}`} {...props}>
    <img
      src="/logo-dog.svg"
      alt="Dogtor Logo"
      width={size}
      height={size}
      className="drop-shadow-sm rounded-2xl"
    />
    <span
      className="text-[#FF5A5F] font-bold tracking-tight"
      style={{
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        fontWeight: 700,
        fontSize: typeof size === "number" ? `${size * 0.45}px` : "20px",
      }}
    >
      dogtor
    </span>
  </div>
);

// DogtorAI Logo - Horizontal layout for headers
export const DogtorLogoHorizontal: React.FC<LogoProps> = ({
  size = 32,
  className = "",
  ...props
}) => (
  <div className={`flex items-center gap-3 ${className}`} {...props}>
    <img
      src="/logo-dog.svg"
      alt="Dogtor Logo"
      width={size}
      height={size}
      className="drop-shadow-sm rounded-xl"
    />
    <span
      className="text-[#FF5A5F] font-bold tracking-tight"
      style={{
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        fontWeight: 700,
        fontSize: typeof size === "number" ? `${size * 0.65}px` : "20px",
      }}
    >
      dogtor
    </span>
  </div>
);

// Backward compatibility - defaults to horizontal layout
export const DogtorLogo: React.FC<LogoProps> = DogtorLogoHorizontal;

// Stethoscope Icon
export const Stethoscope: React.FC<IconProps> = ({
  size = 24,
  className = "",
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M8 2v4a4 4 0 0 0 4 4 4 4 0 0 0 4-4V2M12 10v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="20" cy="16" r="2" stroke="currentColor" strokeWidth="2" />
    <path
      d="M8 2H6a2 2 0 0 0-2 2v2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16 2h2a2 2 0 0 1 2 2v2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Pet Health Icon
export const PetHealth: React.FC<IconProps> = ({
  size = 24,
  className = "",
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Pet silhouette */}
    <path
      d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Heart inside */}
    <path
      d="M12 8c-1.5-1.5-4-1.5-4 1 0 1.5 4 4 4 4s4-2.5 4-4c0-2.5-2.5-2.5-4-1z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Camera Plus Icon (for photo upload)
export const CameraPlus: React.FC<IconProps> = ({
  size = 24,
  className = "",
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
    <path
      d="M16 6h2M17 5v2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// History/Timeline Icon
export const HistoryIcon: React.FC<IconProps> = ({
  size = 24,
  className = "",
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <polyline
      points="12,6 12,12 16,14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 12c0 1.5.4 2.9 1 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Connect/Network Icon
export const ConnectIcon: React.FC<IconProps> = ({
  size = 24,
  className = "",
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.73 21c-.13.29-.34.54-.61.73-.28.19-.6.27-.92.27s-.64-.08-.92-.27c-.27-.19-.48-.44-.61-.73"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// Diagnosis/Analysis Icon
export const DiagnosisIcon: React.FC<IconProps> = ({
  size = 24,
  className = "",
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Upload Cloud Icon
export const UploadCloud: React.FC<IconProps> = ({
  size = 24,
  className = "",
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M16 16l-4-4-4 4M12 12v9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Shield Check (for safety/medical)
export const ShieldCheck: React.FC<IconProps> = ({
  size = 24,
  className = "",
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v7z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
