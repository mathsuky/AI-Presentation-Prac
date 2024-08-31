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
import { createContext } from 'react'
import {Vertual} from './Result.tsx'
const SampleContext = createContext<Blob|null>(null)

export default function TopScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordedBlob,setBlob]=useState<Blob|null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);

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
          setBlob(recordedBlob)
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
  const [data] = useState(recordedBlob)
  return (
    <div>
      <div>
        <SampleContext.Provider value={data}>
          <Vertual />
        </SampleContext.Provider>
      </div>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-indigo-100">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              AI プレゼン練習
            </CardTitle>
            <CardDescription className="text-center">
              あなたのプレゼンをAIがサポートします
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              1. 「開始」ボタンを押して、プレゼンを始めてください。 2.
              終了したら「停止」ボタンを押してください。 3.
              AIがフィードバックを提供します。
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
    </div>
  );
}






