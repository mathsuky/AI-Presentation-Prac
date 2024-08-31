import { useState } from "react";
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

const getAPIResponse = async (message: string) => {
  const response = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: message }),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data;
};

const ResultView = () => {
  const [apiResponseText, setApiResponseText] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<
    "loading" | "loaded" | "error"
  >("loading");
  const navigate = useNavigate();

  const handleButtonClick = async () => {
    setLoadingState("loading");
    try {
      const response = await getAPIResponse(
        "ランダムなひらがな３文字を返してください。それ以外はレスポンスに含めないでください。"
      );
      setApiResponseText(response.content.kwargs.content);
      setLoadingState("loaded");
    } catch (error) {
      console.error("Error fetching API response:", error);
      setLoadingState("error");
    }
  };

  const transcription = "これはサンプルのプレゼンテーション内容です...";
  const feedback = {
    errors: ["内容に矛盾があります: ..."],
    questions: ["想定される質問: ...?"],
    improvements: ["改善点: ..."],
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#E5F1F8] p-4">
      <div></div>
      <button onClick={handleButtonClick}>APIを呼び出す</button>
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
                  <p>{transcription}</p>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="feedback">
                <ScrollArea className="h-[400px] w-full rounded-md p-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-t-4 border-t-[#E83929]">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          内容の誤り指摘
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-[#E83929]" />
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 text-sm">
                          {feedback.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="border-t-4 border-t-[#0070B9]">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          想定質問
                        </CardTitle>
                        <HelpCircle className="h-4 w-4 text-[#0070B9]" />
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 text-sm">
                          {feedback.questions.map((question, index) => (
                            <li key={index}>{question}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="border-t-4 border-t-[#F5A623]">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          改善点
                        </CardTitle>
                        <Lightbulb className="h-4 w-4 text-[#F5A623]" />
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 text-sm">
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
