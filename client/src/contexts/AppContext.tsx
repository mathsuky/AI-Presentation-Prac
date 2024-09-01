import React, {
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface AppContextType {
  globalImages: string[];
  setGlobalImages: Dispatch<SetStateAction<string[]>>;
  globalTranscribedTexts: string[];
  setGlobalTranscribedTexts: Dispatch<SetStateAction<string[]>>;
}

const defaultValue: AppContextType = {
  globalImages: [],
  setGlobalImages: () => {},
  globalTranscribedTexts: [],
  setGlobalTranscribedTexts: () => {},
};

const AppContext = createContext<AppContextType>(defaultValue);

interface AppProviderProps {
  children: ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [globalImages, setGlobalImages] = useState<string[]>([]);
  const [globalTranscribedTexts, setGlobalTranscribedTexts] = useState<
    string[]
  >([]);

  return (
    <AppContext.Provider
      value={{
        globalImages,
        setGlobalImages,
        globalTranscribedTexts,
        setGlobalTranscribedTexts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
