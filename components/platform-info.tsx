import { Globe, Smartphone } from "lucide-react"

export default function PlatformInfo() {
  return (
    <div className="flex flex-col items-center justify-center py-4 text-center text-sm text-slate-400">
      <p className="mb-2">Available on all platforms</p>
      <div className="flex gap-4">
        <div className="flex items-center">
          <Globe className="w-4 h-4 mr-1" /> Web
        </div>
        <div className="flex items-center">
          <Smartphone className="w-4 h-4 mr-1" /> iOS
        </div>
        <div className="flex items-center">
          <Smartphone className="w-4 h-4 mr-1" /> Android
        </div>
      </div>
    </div>
  )
}
