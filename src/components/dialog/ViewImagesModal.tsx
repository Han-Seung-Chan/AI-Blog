"use client";

import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { handleDownloadImage } from "@/lib/download";

interface PostImage {
  id: string;
  url: string;
  file_name?: string;
}

interface ViewImagesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPost: any;
  postImages: PostImage[];
  imageError: string;
  isLoading?: boolean;
}

export function ViewImagesModal({
  isOpen,
  onOpenChange,
  selectedPost,
  postImages,
  imageError,
  isLoading = false,
}: ViewImagesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-3xl p-4">
        <DialogHeader>
          <DialogTitle>이미지 보기</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <h3 className="mb-2 font-medium">{selectedPost?.store_name}</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            등록된 이미지: {postImages.length}
          </p>

          {/* 이미지 목록 */}
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : postImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {postImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-md border bg-white"
                >
                  <img
                    src={image.url}
                    alt="블로그 이미지"
                    className="h-40 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="outline"
                      size="lg"
                      className="hover:bg-primary rounded-full border-2 p-3 transition-all duration-200 hover:text-white"
                      onClick={() =>
                        handleDownloadImage(
                          image.url,
                          `${selectedPost?.store_name || "blog"}-image-${image.file_name || image.id}.jpg`,
                        )
                      }
                      title="이미지 다운로드"
                    >
                      <Download className="h-8 w-8" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              등록된 이미지가 없습니다
            </div>
          )}

          {imageError && (
            <p className="text-destructive mt-2 text-sm">{imageError}</p>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={() => onOpenChange(false)}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
