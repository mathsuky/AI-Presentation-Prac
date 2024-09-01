import "./App.css";
import Home from "./Home.tsx";
import ResultView from "./Result.tsx";
import { AppProvider } from "@/contexts/AppContext.tsx";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";

function App() {
  return (
    <AppProvider>
      <div className="App">
        <BrowserRouter>
          <Link to="/">Home</Link> | <Link to="/result">Result</Link>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/result" element={<ResultView />} />
            {/* <Route path="*" element={<h1>Not Found Page</h1>} /> */}
          </Routes>
        </BrowserRouter>
      </div>
    </AppProvider>
  );
}

export default App;
