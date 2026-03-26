

// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from "./components/Home";
// import Login from "./components/Login";
// import Register from "./components/Register";


// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* FIRST PAGE */}
//         <Route path="/" element={<Register />} />

//         {/* LOGIN PAGE */}
//         <Route path="/login" element={<Login />} />

//         {/* HOME PAGE */}
//         <Route path="/home/*" element={<Home />} />

//       </Routes>
//     </BrowserRouter>
//   );
// }



import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* DEFAULT PAGE → LOGIN */}
        <Route path="/" element={<Login />} />

        {/* LOGIN PAGE */}
        <Route path="/login" element={<Login />} />

        {/* HOME PAGE */}
        <Route path="/home/*" element={<Home />} />

      </Routes>
    </BrowserRouter>
  );
}


