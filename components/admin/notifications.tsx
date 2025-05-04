import { Bell, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface Notification {
  id: string
  title: string
  description: string
  type: "PRODUCT" | "USER" | "SYSTEM"
  read: boolean
  createdAt: string
}

interface NotificationsProps {
  notifications: Notification[]
  onMarkAllAsRead: () => void
}

export function Notifications({ notifications, onMarkAllAsRead }: NotificationsProps) {
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2 border-b">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={onMarkAllAsRead}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start"
            >
              <span className="font-medium">{notification.title}</span>
              <span className="text-sm text-gray-500">{notification.description}</span>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem className="text-sm text-gray-500">
            Aucune notification
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 