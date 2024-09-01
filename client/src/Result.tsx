import { useState, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, HelpCircle, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "@/contexts/AppContext";

const blobUrlToBase64 = async (blobUrl: string): Promise<string> => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const ResultView = () => {
  const { globalImages, globalTranscribedTexts } = useContext(AppContext);
  const [contradictions, setContradictions] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [presentationText, setPresentationText] = useState<string | null>(null);
  const getAPIResponse = async (
    message: string | string[],
    images?: string[]
  ) => {
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, images }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  };

  const [loadingState, setLoadingState] = useState<
    "loading" | "loaded" | "error"
  >("loading");
  const navigate = useNavigate();

  const handleGetFeedback = async () => {
    const base64Images = await Promise.all(globalImages.map(blobUrlToBase64));
    setLoadingState("loading");
    try {
      const response = await getAPIResponse(
        globalTranscribedTexts,
        base64Images
      );
      setContradictions(response.contradiction);
      setImprovements(response.improvement);
      setQuestions(response.potential_questions);
      setPresentationText(globalTranscribedTexts.join("\n"));
      setLoadingState("loaded");
    } catch (error) {
      console.error("Error fetching API response:", error);
      setLoadingState("error");
    }
  };

  useEffect(() => {
    handleGetFeedback();
  }, []);

  const feedback = {
    errors: contradictions,
    questions: questions,
    improvements: improvements,
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#E5F1F8] p-4">
      <div></div>
      <Card className="w-full max-w-4xl border-[#0070B9] border-t-4">
        <CardHeader className="bg-[#0070B9] text-white">
          <CardTitle className="text-2xl font-bold text-center">
            プレゼン分析結果
          </CardTitle>
          <CardDescription className="text-center text-[#E5F1F8]">
            AIによるフィードバックを確認してください
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loadingState === "loading" ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <Tabs defaultValue="transcription">
              <TabsList className="grid w-full grid-cols-2 bg-[#E5F1F8]">
                <TabsTrigger
                  value="transcription"
                  className="data-[state=active]:bg-[#0070B9] data-[state=active]:text-white"
                >
                  文字起こし
                </TabsTrigger>
                <TabsTrigger
                  value="feedback"
                  className="data-[state=active]:bg-[#0070B9] data-[state=active]:text-white"
                >
                  フィードバック
                </TabsTrigger>
              </TabsList>
              <TabsContent value="transcription">
                <ScrollArea className="h-[400px] w-full rounded-md border border-[#0070B9] p-4">
                  <p>{presentationText}</p>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="feedback">
                <ScrollArea className="h-[400px] w-full rounded-md p-4">
                  <div className="grid gap-4">
                    <Card className="border-t-4 border-t-[#E83929]">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-bold">
                          内容の誤り指摘
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-[#E83929]" />
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 text-sm text-left">
                          {feedback.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="border-t-4 border-t-[#0070B9]">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-bold">
                          想定質問
                        </CardTitle>
                        <HelpCircle className="h-4 w-4 text-[#0070B9]" />
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 text-sm text-left">
                          {feedback.questions.map((question, index) => (
                            <li key={index}>{question}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="border-t-4 border-t-[#F5A623]">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-bold">
                          改善点
                        </CardTitle>
                        <Lightbulb className="h-4 w-4 text-[#F5A623]" />
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 text-sm text-left">
                          {feedback.improvements.map((improvement, index) => (
                            <li key={index}>{improvement}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => {
              navigate("/");
            }}
            className="bg-[#0070B9] hover:bg-[#005286]"
          >
            もう一度練習する
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResultView;
