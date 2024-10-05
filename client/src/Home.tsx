import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ImgUploader from "@/components/ImgUploader.tsx";
import HomeScreen from "./components/HomeScreen";

export default function TopScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [isUploaded, setIsUploaded] = useState(false);

  const handleImagesUpload = (uploadedImages: string[]) => {
    setImages(uploadedImages);
    setIsUploaded(true);
  };

  const handleSayHello = async () => {
    const res = await fetch("httP://localhost:8080/hello");
    const data = await res.json();
    console.log(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#E5F1F8] p-4">
      <button onClick={handleSayHello}>say hello</button>
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            AI プレゼン練習
          </CardTitle>
          <CardDescription className="text-center">
            あなたのプレゼンをAIがサポートします
          </CardDescription>
        </CardHeader>
        {isUploaded ? (
          <HomeScreen images={images} />
        ) : (
          <ImgUploader onImagesUpload={handleImagesUpload} />
        )}
        <CardContent>
          <p className="mb-4 w-2/3 mx-auto text-sm text-gray-600">
            1.「開始」ボタンを押して、プレゼンを始めてください。
            <br />
            2.矢印キーをクリックしてスライドを進めてください
            <br />
            3. 終了したら「停止」ボタンを押してください。
            <br />
            4.
            停止後「リザルト」ボタンを押してください。AIがフィードバックを提供します。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
