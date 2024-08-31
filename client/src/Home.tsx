import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mic, MicOff } from "lucide-react";
import ImgUploader from "@/components/ImgUploader.tsx";
import HomeScreen from "./components/HomeScreen";

export default function TopScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isUploaded, setIsUploaded] = useState(false);

  type Temp = {
    mediaRecorder: MediaRecorder;
    chunks: Blob[];
  };

  async function startRecording(): Promise<Temp> {
    try {
      // 音声ストリームの取得
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      // MediaRecorderの作成
      const mediaRecorder = new MediaRecorder(stream);
      // 録音開始
      mediaRecorder.start();
      // 録音データが利用可能になったときの処理
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      return { mediaRecorder, chunks };
    } catch (error) {
      console.error("録音の開始に失敗しました:", error);
      throw error;
    }
  }

  function finishRecording(mediaRecorder: MediaRecorder, chunks: Blob[]) {
    try {
      if (mediaRecorder !== null) {
        // 録音停止
        mediaRecorder.stop();
        mediaRecorder.onstop = () => {
          const recordedBlob = new Blob(chunks, { type: "audio/webm" });
          console.log("録音データのBlob:", recordedBlob);
          const fd = new FormData();
          console.log("fd:", fd);
          if (recordedBlob != null) {
            fd.append("audio", recordedBlob, "recordData.webm");
            fetch("http://localhost:3000/audio-to-text", {
              method: "POST",
              body: fd,
            })
              .then((response) => response.json())
              .then((data) => {
                console.log(data);
              })
              .catch((error) => {
                console.error(error);
              });
          } else {
            console.error("Error: recordedBlob is null");
          }
        };
      } else {
        console.error("Error: mediaRecorder is null");
      }
    } catch (error) {
      console.error("Error finishing recording:", error);
    }
  }

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const { mediaRecorder, chunks } = await startRecording();
        setMediaRecorder(mediaRecorder);
        setChunks(chunks);
        setIsRecording(true);
      } catch (error) {
        console.error("録音の開始に失敗しました:", error);
      }
    } else {
      if (mediaRecorder) {
        finishRecording(mediaRecorder, chunks);
        setIsRecording(false);
      } else {
        console.error("録音の停止に失敗しました: mediaRecorderがnullです");
      }
    }
  };

  const handleImagesUpload = (uploadedImages: string[]) => {
    setImages(uploadedImages);
    setIsUploaded(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#E5F1F8] p-4">
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
            2. 終了したら「停止」ボタンを押してください。
            <br />
            3. AIがフィードバックを提供します。
          </p>
          <div className="flex justify-center">
            <Button
              onClick={toggleRecording}
              className={`w-32 ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  停止
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  開始
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
