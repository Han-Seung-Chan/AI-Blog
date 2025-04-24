"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlogPost } from "@/types/blog";
import { BlogImage } from "@/types/image";

interface ManageImagesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPost: BlogPost | null;
  postImages: BlogImage[];
  isUploadingImage: boolean;
  imageError: string;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage: (imageId: string) => void;
}

export function ManageImagesModal({
  isOpen,
  onOpenChange,
  selectedPost,
  postImages,
  isUploadingImage,
  imageError,
  onFileSelect,
  onDeleteImage,
}: ManageImagesModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-3xl p-4">
        <DialogHeader>
          <DialogTitle>이미지 관리</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <h3 className="mb-2 font-medium">{selectedPost?.store_name}</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            등록된 이미지: {postImages.length}/5
          </p>

          {/* 이미지 업로드 영역 */}
          <div className="mb-6">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={onFileSelect}
              className="hidden"
              disabled={isUploadingImage || postImages.length >= 5}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage || postImages.length >= 5}
              className="flex h-20 w-full flex-col items-center justify-center border-dashed"
            >
              {isUploadingImage ? (
                <>
                  <Loader2 className="mb-2 h-6 w-6 animate-spin" />
                  <span>업로드 중...</span>
                </>
              ) : (
                <>
                  <Plus className="mb-2 h-6 w-6" />
                  <span>
                    이미지 추가하기 {postImages.length >= 5 && "(최대 5개)"}
                  </span>
                </>
              )}
            </Button>

            {imageError && (
              <p className="mt-2 text-sm text-red-500">{imageError}</p>
            )}
          </div>

          {/* 이미지 목록 */}
          {postImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {postImages.map((image) => (
                <div
                  key={encodeURI(image.id)}
                  className="group relative overflow-hidden rounded-md border"
                >
                  <Image
                    src={image.url}
                    alt="블로그 이미지"
                    width={400}
                    height={300}
                    className="h-40 w-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="size-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => onDeleteImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={() => onOpenChange(false)}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
