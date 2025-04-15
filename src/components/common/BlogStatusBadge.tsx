import { AlertCircle, Calendar, Check, FileX, User } from "lucide-react";

import { getStatusClass, getStatusText } from "@/lib/status-info";

interface BlogStatusBadgeProps {
  status: string;
  userType: "user" | "admin";
}

export function BlogStatusBadge({ status, userType }: BlogStatusBadgeProps) {
  return (
    <span className={`flex items-center ${getStatusClass(status, userType)}`}>
      {status === "created" && <AlertCircle className="mr-1 h-4 w-4" />}
      {status === "reserved" && <User className="mr-1 h-4 w-4" />}
      {status === "completed" && <Calendar className="mr-1 h-4 w-4" />}
      {status === "approved" && <Check className="mr-1 h-4 w-4" />}
      {status === "rejected" && <FileX className="mr-1 h-4 w-4" />}
      {getStatusText(status, userType)}
    </span>
  );
}
