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
  const [imgPosition, setImgPosition] = useState(0);
  const [transcribedTexts, setTranscribedTexts] = useState<string[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
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
        mediaRecorder.stop();
        mediaRecorder.onstop = () => {
          const recordedBlob = new Blob(chunks, { type: "audio/webm" });
          console.log("録音データのBlob:", recordedBlob);
          const fd = new FormData();
          if (recordedBlob != null) {
            fd.append("audio", recordedBlob, "recordData.webm");
            fetch("http://localhost:3000/audio-to-text", {
              method: "POST",
              body: fd,
            })
              .then((response) => response.json())
              .then((data) => {
                setTranscribedTexts((prevTexts) => [...prevTexts, data.text]);
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
    try {
      if (mediaRecorder) {
        finishRecording(mediaRecorder, chunks);
        setIsRecording(false);
        await startRecording();
        setIsRecording(true);
      } else {
        console.error("録音の停止に失敗しました: mediaRecorderがnullです");
      }
    } catch (error) {
      console.error("録音の開始に失敗しました:", error);
    }
  };

  const handleOverlayNextClick = async () => {
    try {
      if (imgPosition === images.length - 1) {
        alert("これ以上進めません");
        return;
      }
      setImgPosition((prevPosition) => prevPosition + 1);
      await startAndStop();
      const nextButton = document.querySelector(".carousel-next");
      if (nextButton) {
        (nextButton as HTMLElement).click();
      }
    } catch (error) {
      console.error("正しく画像を進められませんでした。:", error);
    }
  };

  const handleOverlayPrevClick = async () => {
    try {
      if (imgPosition === 0) {
        alert("これ以上戻れません");
        return;
      }
      setImgPosition((prevPosition) => prevPosition - 1);
      const prevButton = document.querySelector(".carousel-prev");
      if (prevButton) {
        (prevButton as HTMLElement).click();
      }
    } catch (error) {
      console.error("正しく画像を戻せませんでした。", error);
    }
  };

  const showConsole = () => {
    console.log(imgPosition);
    console.log(images.length);
    console.log(transcribedTexts);
  };

  return (
    <div>
      <button onClick={showConsole}>show</button>
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
        <CarouselPrevious className="carousel-prev absolute left-4 top-1/2 -translate-y-1/2" />
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-transparent"
          onClick={handleOverlayPrevClick}
        />
        <CarouselNext className="carousel-next absolute right-4 top-1/2 -translate-y-1/2" />
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-transparent"
          onClick={handleOverlayNextClick}
        />
      </Carousel>
      <div className="flex justify-center">
        {((imgPosition === 0 && !isRecording) ||
          (imgPosition === images.length - 1 && isRecording)) && (
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
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
