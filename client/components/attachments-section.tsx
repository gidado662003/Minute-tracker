"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, X, Upload, Image as ImageIcon } from "lucide-react";
import { useRef, useState } from "react";

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  uploadedAt: string;
}

interface AttachmentsSectionProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}

export default function AttachmentsSection({
  attachments,
  onChange,
}: AttachmentsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    const newAttachments = files.map((file) => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      uploadedAt: new Date().toISOString(),
    }));

    onChange([...attachments, ...newAttachments]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    onChange(attachments.filter((attachment) => attachment.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isImageFile = (type: string) => {
    return type.startsWith("image/");
  };

  const handleImagePreview = (attachment: Attachment) => {
    if (isImageFile(attachment.type)) {
      const imageUrl = URL.createObjectURL(attachment.file);
      setPreviewImage({ url: imageUrl, name: attachment.name });
    }
  };

  const closePreview = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage.url);
    }
    setPreviewImage(null);
  };

  const getFileIcon = (type: string) => {
    if (isImageFile(type)) {
      return <ImageIcon className="h-5 w-5 text-green-500" />;
    }
    return <FileText className="h-5 w-5 text-blue-500" />;
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Attachments
          </CardTitle>
          <CardDescription>
            Upload supporting documents, images, quotes, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 mb-2">
              Click to upload files
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              PDF, DOC, XLS, JPG, PNG (Max 10MB each)
            </p>
            <Button type="button" variant="outline">
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Attachments List */}
          {attachments.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-700">
                  Uploaded Files ({attachments.length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onChange([])}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-3">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {getFileIcon(attachment.type)}
                        <div className="min-w-0 flex-1">
                          {/* Image Preview Thumbnail */}
                          {isImageFile(attachment.type) && (
                            <div
                              className="mb-2 cursor-pointer group"
                              onClick={() => handleImagePreview(attachment)}
                            >
                              <div className="relative h-24 w-24 bg-gray-100 rounded border overflow-hidden">
                                <img
                                  src={URL.createObjectURL(attachment.file)}
                                  alt={attachment.name}
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Click to preview
                              </p>
                            </div>
                          )}

                          <p
                            className={`font-medium text-sm ${
                              isImageFile(attachment.type)
                                ? "text-blue-600 cursor-pointer hover:underline"
                                : "text-gray-700"
                            }`}
                            onClick={() =>
                              isImageFile(attachment.type) &&
                              handleImagePreview(attachment)
                            }
                          >
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(attachment.size)} •{" "}
                            {attachment.type}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={closePreview}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={closePreview}
              className="absolute -top-12 right-0 text-white hover:bg-white hover:bg-opacity-20 z-10"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Image Container */}
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg truncate">
                  {previewImage.name}
                </h3>
              </div>
              <div className="flex justify-center items-center bg-gray-100 p-4 max-h-[70vh] overflow-auto">
                <img
                  src={previewImage.url}
                  alt={previewImage.name}
                  className="max-w-full max-h-full object-contain rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
