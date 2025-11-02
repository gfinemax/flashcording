import { cn } from "@/lib/utils"

interface FlashLogoProps {
  className?: string
}

export function FlashLogo({ className }: FlashLogoProps) {
  return (
    <svg
      viewBox="-4.59 0 52.235 52.235"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-6", className)}
    >
      <g transform="translate(-154.697 -506.828)">
        <path
          d="M197.744,530.808a21.523,21.523,0,1,1-21.524-21.524A21.524,21.524,0,0,1,197.744,530.808Z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M170.831,508.828h17.42l-10.4,19.41,10.4.288-16.117,28.538,3.518-21.651-9.853.685Z"
          fill="currentColor"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </g>
    </svg>
  )
}
