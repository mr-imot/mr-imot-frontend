"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HelpCircle, FileText, MessageSquare, CreditCard, Shield, Globe, CheckCircle, AlertCircle } from "lucide-react"

interface DashboardFooterBarProps {
  onHelp: () => void
  onDocs: () => void
  onSupport: () => void
  onBilling: () => void
  onPrivacy: () => void
  version: string
  status: "operational" | "maintenance" | "issues"
  locale: string
  onLocaleChange: (locale: string) => void
}

export function DashboardFooterBar({
  onHelp,
  onDocs,
  onSupport,
  onBilling,
  onPrivacy,
  version,
  status,
  locale,
  onLocaleChange,
}: DashboardFooterBarProps) {
  const statusConfig = {
    operational: {
      icon: CheckCircle,
      label: "All systems operational",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    maintenance: {
      icon: AlertCircle,
      label: "Scheduled maintenance",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    issues: {
      icon: AlertCircle,
      label: "Some issues detected",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  }

  const currentStatus = statusConfig[status]
  const StatusIcon = currentStatus.icon

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side - Quick actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onHelp} className="text-slate-600 hover:text-slate-900">
              <HelpCircle className="h-4 w-4 mr-1" />
              Help
            </Button>

            <Button variant="ghost" size="sm" onClick={onDocs} className="text-slate-600 hover:text-slate-900">
              <FileText className="h-4 w-4 mr-1" />
              Docs
            </Button>

            <Button variant="ghost" size="sm" onClick={onSupport} className="text-slate-600 hover:text-slate-900">
              <MessageSquare className="h-4 w-4 mr-1" />
              Support
            </Button>

            <Button variant="ghost" size="sm" onClick={onBilling} className="text-slate-600 hover:text-slate-900">
              <CreditCard className="h-4 w-4 mr-1" />
              Billing
            </Button>

            <Button variant="ghost" size="sm" onClick={onPrivacy} className="text-slate-600 hover:text-slate-900">
              <Shield className="h-4 w-4 mr-1" />
              Privacy
            </Button>
          </div>

          {/* Center - Status and version */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-4 w-4 ${currentStatus.color}`} />
              <span className="text-sm text-slate-600">{currentStatus.label}</span>
            </div>

            <Badge variant="outline" className="text-xs">
              {version}
            </Badge>
          </div>

          {/* Right side - Language selector */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-slate-500" />
            <Select value={locale} onValueChange={onLocaleChange}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="es">ES</SelectItem>
                <SelectItem value="fr">FR</SelectItem>
                <SelectItem value="de">DE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bottom row - Copyright */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs text-slate-500">© 2024 Mr imot. All rights reserved.</p>
            <p className="text-xs text-slate-500">Made with ❤️ for real estate developers</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
