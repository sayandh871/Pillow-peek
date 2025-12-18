"use client";

import { formatDistanceToNow } from "date-fns";
import { 
  PlusCircle, 
  RefreshCcw, 
  Trash2, 
  LogIn, 
  LogOut, 
  Layers,
  FileText,
  User,
  ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  logs: any[];
}

const ACTION_ICONS: Record<string, any> = {
  CREATE: PlusCircle,
  UPDATE: RefreshCcw,
  DELETE: Trash2,
  LOGIN: LogIn,
  LOGOUT: LogOut,
  BULK_UPDATE: Layers,
  BULK_DELETE: Trash2,
};

const ENTITY_ICONS: Record<string, any> = {
  PRODUCT: ShoppingBag,
  ORDER: FileText,
  USER: User,
  CATEGORY: Layers,
  VARIANT: Layers,
};

export function ActivityFeed({ logs }: ActivityFeedProps) {
  if (logs.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-dark-400">
        No recent activity logs.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {logs.map((log, logIdx) => {
          const ActionIcon = ACTION_ICONS[log.action] || RefreshCcw;
          const EntityIcon = ENTITY_ICONS[log.entity] || FileText;

          return (
            <li key={log.id}>
              <div className="relative pb-8">
                {logIdx !== logs.length - 1 ? (
                  <span
                    className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-light-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full ring-8 ring-white",
                        log.action === 'DELETE' ? "bg-red-50 text-red-600" : 
                        log.action === 'CREATE' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                    )}>
                      <ActionIcon size={18} aria-hidden="true" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white shadow-sm">
                        <EntityIcon size={12} className="text-dark-400" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-body-medium">
                        <span className="font-bold text-dark-900">
                          {log.admin?.name || "Admin"}
                        </span>{" "}
                        <span className="text-dark-500">{log.details}</span>
                      </div>
                      <p className="mt-0.5 text-footnote text-dark-400">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
