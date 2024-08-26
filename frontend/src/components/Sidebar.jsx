import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Sidebar({ setComponent, cb }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleShowSidebarButton = () => {
    setSidebarVisible((prev) => !prev);
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    localStorage.removeItem("user");
    cb(null);
    window.location.reload();
    console.log("MADE IT MAM")
  };

  return (
    <>
      <div className="sidebar-container z-30">
        <button
          onClick={handleShowSidebarButton}
          className="fixed top-4 right-4 z-40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            className="fill-neutral-50 hover:fill-orange-400 transition duration-300 ease-out"
          >
            <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
          </svg>
        </button>
        <aside
          className={`sidebar fixed top-0 right-0 w-64 h-full flex flex-col pt-36 justify-start gap-5 backdrop-blur-lg bg-zinc-300/30 rounded-l-xl transition-transform transform ${
            sidebarVisible ? "translate-x-0" : "translate-x-full"
          } z-30`}
        >
          <section className="rounded-xl hover:bg-orange-400 transition duration-100 ease-out">
            <button
              id="0"
              className="w-full p-4 text-left"
              onClick={setComponent}
            >
              Home
            </button>
          </section>
          <section className="rounded-xl hover:bg-orange-400 transition duration-100 ease-out">
            <button
              id="1"
              className="w-full p-4 text-left"
              onClick={setComponent}
            >
              Foods
            </button>
          </section>
          <section className="rounded-xl hover:bg-orange-400 transition duration-100 ease-out">
            <button
              id="2"
              className="w-full p-4 text-left"
              onClick={setComponent}
            >
              Macros
            </button>
          </section>
          <section className="rounded-xl hover:bg-orange-400 transition duration-100 ease-out">
            <button
              id="3"
              className="w-full p-4 text-left"
              onClick={setComponent}
            >
              Recipe Inspiration
            </button>
          </section>
          <section className="border-orange-400 rounded-xl mt-auto hover:bg-orange-400 transition duration-100 ease-out">
            <button id="4" className="w-full p-4" onClick={handleLogout}>
              Logout
            </button>
          </section>
        </aside>
      </div>
    </>
  );
}
