import { AlertCircle, Calendar, Check, FileX, User } from "lucide-react";

import { getStatusClass, getStatusText } from "@/lib/status-info";
import { BlogPostStatus } from "@/types/blog";

interface BlogStatusBadgeProps {
  status: BlogPostStatus;
  userType: "user" | "admin";
}

export function BlogStatusBadge({ status, userType }: BlogStatusBadgeProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "created":
        return <AlertCircle className="mr-1 h-4 w-4" />;
      case "reserved":
        return <User className="mr-1 h-4 w-4" />;
      case "completed":
        return <Calendar className="mr-1 h-4 w-4" />;
      case "approved":
        return <Check className="mr-1 h-4 w-4" />;
      case "rejected":
        return <FileX className="mr-1 h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <span className={`flex items-center ${getStatusClass(status, userType)}`}>
      {getStatusIcon()}
      {getStatusText(status, userType)}
    </span>
  );
}
