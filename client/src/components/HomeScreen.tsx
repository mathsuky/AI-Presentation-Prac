import { useState, useContext } from "react";
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
import { AppContext } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";

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
  const [isTranscribing, setIsTranscribing] = useState(false);

  const { setGlobalImages, setGlobalTranscribedTexts } = useContext(AppContext);

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
          const fd = new FormData();
          if (recordedBlob != null) {
            fd.append("audio", recordedBlob, "recordData.webm");
            setIsTranscribing(true);
            fetch(`https://team-c-qhxn.onrender.com/audio-to-text`, {
              method: "POST",
              body: fd,
            })
              .then((response) => response.json())
              .then((data) => {
                setTranscribedTexts((prevTexts) => {
                  const newTexts = [...prevTexts, data.text];
                  setGlobalTranscribedTexts(newTexts);
                  return newTexts;
                });
                console.log(data);
              })
              .catch((error) => {
                console.error(error);
              })
              .finally(() => {
                setIsTranscribing(false);
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

  const navigate = useNavigate();
  const handleToResult = () => {
    if (isTranscribing) {
      alert("音声の文字起こし中です。しばらくお待ちください。");
      return;
    }
    console.log(transcribedTexts);
    setGlobalImages(images);
    setGlobalTranscribedTexts(transcribedTexts);
    navigate("/result");
  };

  const handleOverlayNextClick = async () => {
    try {
      if (!isRecording) {
        alert("録音中のみ次の画像に進めます");
        return;
      }
      if (imgPosition === images.length - 1) {
        alert("これ以上進めません");
        return;
      }
      while (isTranscribing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
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

  return (
    <div>
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
        {/* <CarouselPrevious className="carousel-prev absolute left-4 top-1/2 -translate-y-1/2" />
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-transparent"
          onClick={handleOverlayPrevClick}
        /> */}
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
        <Button
          onClick={handleToResult}
          className="w-32 bg-blue-500 hover:bg-blue-600 ml-2"
        >
          リザルト
        </Button>
      </div>
    </div>
  );
};

export default HomeScreen;
