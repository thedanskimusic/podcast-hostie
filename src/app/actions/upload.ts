"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/s3";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
const ALLOWED_FILE_TYPES = ["audio/mpeg", "audio/mp3"];

export interface GenerateUploadUrlResult {
  presignedUrl: string;
  key: string;
  publicUrl: string;
}

export async function generateUploadUrl(
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<GenerateUploadUrlResult> {
  if (!s3Client) {
    throw new Error("R2 is not configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables.");
  }

  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME environment variable is required.");
  }

  // Get tenant ID from headers (set by middleware)
  const headersList = await headers();
  const tenantId = headersList.get("x-tenant-id");

  if (!tenantId) {
    throw new Error("Tenant ID not found. User must be authenticated.");
  }

  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(fileType.toLowerCase())) {
    throw new Error(`Invalid file type. Only MP3 files are allowed. Received: ${fileType}`);
  }

  // Validate file size
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Generate unique filename
  const fileExtension = fileName.split(".").pop() || "mp3";
  const uniqueFileName = `${randomUUID()}.${fileExtension}`;
  const key = `uploads/${tenantId}/${uniqueFileName}`;

  // Create presigned URL for PUT request
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: "audio/mpeg",
  });

  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 900, // 15 minutes
  });

  // Construct public URL (assuming public R2.dev domain)
  const publicUrl = R2_PUBLIC_URL
    ? `${R2_PUBLIC_URL}/${key}`
    : `https://${R2_BUCKET_NAME}.r2.dev/${key}`;

  return {
    presignedUrl,
    key,
    publicUrl,
  };
}