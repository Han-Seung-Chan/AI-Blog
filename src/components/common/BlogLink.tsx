import { ExternalLink } from "lucide-react";

interface BlogLinkProps {
  url?: string | null;
  label?: string;
}

export function BlogLink({ url, label = "링크" }: BlogLinkProps) {
  if (!url) return <>-</>;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-primary flex items-center hover:underline`}
    >
      {label} <ExternalLink className="ml-1 h-3 w-3" />
    </a>
  );
}
