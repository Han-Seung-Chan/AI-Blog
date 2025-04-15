import { ExternalLink } from "lucide-react";

interface BlogLinkProps {
  url?: string;
  label?: string;
  className?: string;
}

export function BlogLink({
  url,
  label = "링크",
  className = "text-primary hover:underline",
}: BlogLinkProps) {
  if (!url) return "-";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center ${className}`}
    >
      {label} <ExternalLink className="ml-1 h-3 w-3" />
    </a>
  );
}
