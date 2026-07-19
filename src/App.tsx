import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CountGame from "./games/CountGame";
import AddGame from "./games/AddGame";
import SubtractGame from "./games/SubtractGame";
import MultiplyGame from "./games/MultiplyGame";
import DivideGame from "./games/DivideGame";
import { warmupSpeech } from "./lib/speech";

export default function App() {
  useEffect(() => {
    warmupSpeech();
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="count" element={<CountGame />} />
        <Route path="add" element={<AddGame />} />
        <Route path="subtract" element={<SubtractGame />} />
        <Route path="multiply" element={<MultiplyGame />} />
        <Route path="divide" element={<DivideGame />} />
      </Route>
    </Routes>
  );
}
