import { useState, useRef } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/customToasts";

export function useProfileImage(user: { id: number; role: string } | null) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setUser: React.Dispatch<React.SetStateAction<any>>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // ✅ Validation
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showErrorToast("File size must be less than 5MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showErrorToast("Invalid image type (JPEG, PNG, GIF, WebP only)");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const query = new URLSearchParams({
      userId: user.id.toString(),
      role: user.role,
    });

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/upload-profile-image?${query}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, timeout: 60000 }
      );

      const data = response.data;

      // ✅ Update user state + session storage
      setUser((prev: any) => prev ? { ...prev, profileImage: data.imageUrl } : prev);
      sessionStorage.setItem(`profileImage_${user.id}`, data.imageUrl);

      showSuccessToast("Profile image updated successfully!");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "An error occurred while uploading.";
      showErrorToast(message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsUploading(false);
    }
  };

  return { isUploading, fileInputRef, handleUploadClick, handleFileChange };
}
