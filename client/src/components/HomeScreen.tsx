import { useState } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Mic, MicOff } from "lucide-react";

interface HomeScreenProps {
  images: string[];
}

const HomeScreen: React.FC<HomeScreenProps> = ({ images }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [chunks, setChunks] = useState<Blob[]>([]);


  async function startRecording() {
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
      setMediaRecorder(mediaRecorder);
      setChunks(chunks);
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
        await startRecording();
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
  const startAndStop = async () => {
    try{
      if (mediaRecorder) {
        finishRecording(mediaRecorder, chunks);
        setIsRecording(false);
        await startRecording();
        setIsRecording(true);
      } else {
        console.error("録音の停止に失敗しました: mediaRecorderがnullです");
      }
    }catch (error) {
      console.error("録音の開始に失敗しました:", error);
    }
  }
  return (<div>
    <Carousel className="w-full max-w-xl mx-auto">
      <CarouselContent>
        {images.map((src, index) => (
          <CarouselItem key={index}>
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
              <img src={src} alt={`Slide ${index + 1}`} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" onClick={startAndStop}/>
    </Carousel>
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
          </div>
  );
};

export default HomeScreen;
