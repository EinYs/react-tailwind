import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chat from "./pages/Chat";
import Header from "./pages/Header";


const MySection = () => {
  return (
    <header className="py-16">
      <h1 className="text-5xl font-bold text-center mb-2">Create Tailwind</h1>
      <p className="text-center mb-6 text-xl">
        Please support this project by starring the repository on GitHub.
      </p>
      <div className="flex flex-row justify-center items-center gap-4">
        <a
          className="github-button"
          href="https://github.com/andrejjurkin/create-tw"
          data-color-scheme="no-preference: dark; light: dark; dark: dark;"
          data-icon="octicon-star"
          data-size="large"
          data-show-count="true"
          aria-label="Star andrejjurkin/create-tw on GitHub"
        >
          Star
        </a>
        <a
          className="github-button"
          href="https://github.com/andrejjurkin/create-tw/discussions"
          data-color-scheme="no-preference: dark; light: dark; dark: dark;"
          data-icon="octicon-comment-discussion"
          data-size="large"
          aria-label="Discuss andrejjurkin/create-tw on GitHub"
        >
          Discuss
        </a>
      </div>
    </header>
  )
}

const Home = () => {
  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 to-slate-800 flex flex-col text-white">

      <MySection />
      <main className="flex-1">
        <section className="text-center">
          <h2 className="text-3xl font-medium text-center">
            React.js Project Created using{" "}
            <a
              href="https://vitejs.dev/"
              target="_blank"
              className="text-indigo-300"
            >
              Vite
            </a>
          </h2>
        </section>
      </main>

      <footer className="px-8 py-12 border-t border-gray-800">
        <div className="px-8 font-medium text-center">
          <a href="https://github.com/andrejjurkin/create-tw">Create Tailwind</a>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/header" element={<Header />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
