import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CountGame from "./games/CountGame";
import AddGame from "./games/AddGame";
import SubtractGame from "./games/SubtractGame";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="count" element={<CountGame />} />
        <Route path="add" element={<AddGame />} />
        <Route path="subtract" element={<SubtractGame />} />
      </Route>
    </Routes>
  );
}
