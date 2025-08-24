// Global Icon Management System for DogtorAI
// This file allows easy changing of all icons across the application

import {
  DogtorLogo,
  Stethoscope,
  PetHealth,
  CameraPlus,
  HistoryIcon,
  ConnectIcon,
  DiagnosisIcon,
  UploadCloud,
  ShieldCheck
} from './dogtor-icons'

export {
  DogtorLogo,
  Stethoscope,
  PetHealth,
  CameraPlus,
  HistoryIcon,
  ConnectIcon,
  DiagnosisIcon,
  UploadCloud,
  ShieldCheck
}

// Re-export commonly used Lucide icons for consistency
export {
  // Navigation
  Home,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  
  // Actions
  Plus,
  Minus,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  Edit3 as Edit,
  Trash2 as Delete,
  Save,
  Download,
  
  // Media
  Image,
  Camera,
  Upload,
  Eye,
  EyeOff,
  
  // Communication
  MessageCircle,
  Send,
  Phone,
  Mail,
  
  // Settings & Controls
  Settings,
  Filter,
  Search,
  MoreVertical,
  MoreHorizontal,
  
  // Status
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  
  // User & Profile
  User,
  Users,
  UserPlus,
  
  // Documents
  FileText,
  File,
  Folder,
  
  // Theme
  Sun,
  Moon,
  Monitor,
  Palette,
  
} from 'lucide-react'

// Icon configuration - Change these to switch icon sets globally
export const AppIcons = {
  // App Branding
  logo: DogtorLogo,
  
  // Main Navigation
  diagnose: DiagnosisIcon,
  history: HistoryIcon,
  connect: ConnectIcon,
  
  // Feature Icons  
  camera: CameraPlus,
  upload: UploadCloud,
  health: PetHealth,
  medical: Stethoscope,
  safety: ShieldCheck,
  
  // This object allows changing icons app-wide by modifying these mappings
  // For example, to use a different history icon:
  // history: Clock, // instead of HistoryIcon
}

// Icon sizes for consistency
export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export type IconSize = keyof typeof IconSizes