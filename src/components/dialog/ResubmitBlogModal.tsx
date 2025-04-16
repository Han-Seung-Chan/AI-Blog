"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BlogPost } from "@/types/blog";

interface ResubmitBlogModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPost: BlogPost | null;
  onResubmit: (blogUrl: string, notes: string) => Promise<void>;
  isResubmitting: boolean;
}

export function ResubmitBlogModal({
  isOpen,
  onOpenChange,
  selectedPost,
  onResubmit,
  isResubmitting,
}: ResubmitBlogModalProps) {
  const [blogUrl, setBlogUrl] = useState<string>(selectedPost?.blog_url || "");
  const [notes, setNotes] = useState<string>("");
  const [urlError, setUrlError] = useState<string>("");

  const handleResubmit = async (): Promise<void> => {
    // URL 유효성 검증
    if (!blogUrl.trim()) {
      setUrlError("블로그 URL은 필수 항목입니다.");
      return;
    }

    if (!blogUrl.startsWith("http://") && !blogUrl.startsWith("https://")) {
      setUrlError(
        "유효한 URL 형식이 아닙니다. http:// 또는 https://로 시작해야 합니다.",
      );
      return;
    }

    setUrlError("");
    await onResubmit(blogUrl, notes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>블로그 글 재제출</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <h3 className="mb-2 font-medium">{selectedPost?.store_name}</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            키워드: {selectedPost?.main_keyword}
          </p>

          {selectedPost?.rejection_reason && (
            <div className="bg-destructive/10 mb-4 rounded-md p-3">
              <h4 className="text-sm font-semibold">거절 사유:</h4>
              <p className="text-sm">{selectedPost.rejection_reason}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blogUrl">블로그 URL *</Label>
              <Input
                id="blogUrl"
                value={blogUrl}
                onChange={(e) => setBlogUrl(e.target.value)}
                placeholder="수정한 블로그 글의 URL을 입력하세요"
              />
              {urlError && (
                <p className="text-destructive text-xs">{urlError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">메모 (선택사항)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="관리자에게 전달할 메모를 입력하세요"
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleResubmit} disabled={isResubmitting}>
            {isResubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              "재제출"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
