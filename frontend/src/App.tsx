import { TooltipProvider } from "@/components/ui/tooltip"
import { Dashboard } from "@/components/dashboard"

export default function App() {
  return (
    <TooltipProvider delayDuration={300}>
      <Dashboard />
    </TooltipProvider>
  )
}
