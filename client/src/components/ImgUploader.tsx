import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ImgUploaderProps {
  onImagesUpload: (uploadedImages: string[]) => void;
}

const ImgUploader: React.FC<ImgUploaderProps> = ({ onImagesUpload }) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setUploadedImages((prevImages) => [...prevImages, ...newImages]);
    }
  };

  const handleFinishUpload = () => {
    if (uploadedImages.length > 0) {
      onImagesUpload(uploadedImages);
    } else {
      alert("画像をアップロードしてください。");
    }
  };

  return (
    <div className="w-2/3 mx-auto">
      <Input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
      />
      <div className="flex flex-wrap gap-2 my-2">
        {uploadedImages.map((src, index) => (
          <div key={index} className="relative w-20 h-20">
            <img src={src} className="object-cover w-full h-full rounded-md" />
          </div>
        ))}
      </div>
      <Button onClick={handleFinishUpload} className="w-full mb-2">
        アップロード完了
      </Button>
    </div>
  );
};

export default ImgUploader;
