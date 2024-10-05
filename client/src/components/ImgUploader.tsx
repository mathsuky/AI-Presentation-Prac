import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ImgUploaderProps {
  onImagesUpload: (uploadedImages: string[]) => void;
}

const ImgUploader: React.FC<ImgUploaderProps> = ({ onImagesUpload }) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      let pdfFilesCount = 0;
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        if (file.type === "application/pdf") {
          pdfFilesCount++;
        } else {
          newImages.push(URL.createObjectURL(file));
        }
      });
      if (pdfFilesCount === 0) {
        setUploadedImages((prevImages) => [...prevImages, ...newImages]);
      } else if (pdfFilesCount > 0 && files.length === pdfFilesCount) {
        const formData = new FormData();
        Array.from(files).forEach((file) => {
          formData.append("pdf", file);
        });

        try {
          const res = await fetch("http://localhost:8080/pdf2img", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            throw new Error("Failed to upload PDF");
          }

          const data = await res.json();
          console.log(data);

          // サーバーから返された画像パスをURLに変換して追加
          const imageUrls = data.map(
            (path: string) => `http://localhost:8080/download?path=${path}`
          );
          setUploadedImages((prevImages) => [...prevImages, ...imageUrls]);
          console.log(uploadedImages);
        } catch (error) {
          console.error("Error uploading PDF:", error);
          alert("PDFのアップロードに失敗しました。");
        }
      } else {
        alert(
          "アップロードできるファイルは画像またはPDFファイルのみで，それぞれを混在させることはできません"
        );
      }
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
        accept="image/*,application/pdf"
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
