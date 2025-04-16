import { Anchor, Waves } from "lucide-react"
import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Waves className={`${sizeClasses[size]} text-primary animate-wave`} />
        <Anchor className={`${sizeClasses[size]} text-primary absolute top-0 left-0 opacity-50`} />
      </div>
      {showText && <span className={`${textSizeClasses[size]} font-display font-bold text-primary`}>WaveRowers</span>}
    </div>
  )
}

export function LogoLink({ size = "md", showText = true, className = "" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <Logo size={size} showText={showText} />
    </Link>
  )
}

