"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, X, FileAudio, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { generateUploadUrl } from "@/app/actions/upload";
import jsmediatags from "jsmediatags";

interface AudioUploadZoneProps {
  onUploadSuccess: (audioUrl: string, duration: number) => void;
  onUploadError?: (error: string) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function AudioUploadZone({ onUploadSuccess, onUploadError }: AudioUploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractDuration = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      // Use audio element to get duration (most reliable method)
      const audio = document.createElement("audio");
      const objectUrl = URL.createObjectURL(file);
      audio.preload = "metadata";
      
      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
      };
      
      audio.onloadedmetadata = () => {
        cleanup();
        if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
          resolve(Math.round(audio.duration));
        } else {
          // Try jsmediatags as fallback
          try {
            jsmediatags.read(file, {
              onSuccess: (tag: any) => {
                // Try different metadata properties
                const durationSeconds = tag.tags.length || tag.tags.LENGTH || tag.tags.duration || null;
                if (durationSeconds && typeof durationSeconds === 'number') {
                  resolve(Math.round(durationSeconds));
                } else {
                  reject(new Error("Could not extract duration from file metadata"));
                }
              },
              onError: () => {
                reject(new Error("Could not extract duration from file"));
              },
            });
          } catch (err) {
            reject(new Error("Could not extract duration from file"));
          }
        }
      };
      
      audio.onerror = () => {
        cleanup();
        // Try jsmediatags as fallback
        try {
          jsmediatags.read(file, {
            onSuccess: (tag: any) => {
              const durationSeconds = tag.tags.length || tag.tags.LENGTH || tag.tags.duration || null;
              if (durationSeconds && typeof durationSeconds === 'number') {
                resolve(Math.round(durationSeconds));
              } else {
                reject(new Error("Could not extract duration from file metadata"));
              }
            },
            onError: () => {
              reject(new Error("Could not extract duration from file"));
            },
          });
        } catch (err) {
          reject(new Error("Could not extract duration from file"));
        }
      };
      
      // Set timeout in case metadata never loads
      setTimeout(() => {
        if (audio.readyState < 1) {
          cleanup();
          reject(new Error("Timeout extracting duration from file"));
        }
      }, 10000); // 10 second timeout
      
      audio.src = objectUrl;
    });
  };

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    // Validate file type
    if (!file.type.includes("audio/mpeg") && !file.name.endsWith(".mp3")) {
      setError("Only MP3 files are allowed");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }

    setSelectedFile(file);

    // Extract duration
    try {
      const durationSeconds = await extractDuration(file);
      setDuration(durationSeconds);
    } catch (err) {
      console.error("Error extracting duration:", err);
      setError("Could not extract audio duration. Please enter manually.");
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !duration) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Get presigned URL
      const { presignedUrl, publicUrl } = await generateUploadUrl(
        selectedFile.name,
        selectedFile.type || "audio/mpeg",
        selectedFile.size
      );

      // Upload file directly to R2
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error("Upload failed"));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", "audio/mpeg");
        xhr.send(selectedFile);
      });

      setUploadProgress(100);
      
      // Call success callback with public URL and duration
      onUploadSuccess(publicUrl, duration);
    } catch (err: any) {
      const errorMessage = err.message || "Upload failed. Please try again.";
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          error && "border-destructive"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mpeg,.mp3"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          {isDragActive
            ? "Drop the audio file here"
            : "Drag and drop an MP3 file here, or click to select"}
        </p>
        <p className="text-xs text-muted-foreground">
          Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB
        </p>
      </div>

      {selectedFile && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileAudio className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    {duration && ` • ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}`}
                  </p>
                </div>
              </div>
              {!uploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setDuration(null);
                    setError(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {uploading && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Uploading...</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {!uploading && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                disabled={!selectedFile || !duration}
                className="w-full mt-4"
              >
                Upload Audio
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          {error}
        </div>
      )}
    </div>
  );
}