import { useState, useEffect } from "react";

export default function Sidebar({ setComponent }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleResize = () => {
    const smallEnough = window.innerWidth <= 1024;
    setIsMobile(smallEnough);
    if (!smallEnough) {
      setSidebarVisible(true);
    }
  };

  const handleShowSidebarButton = () => {
    setSidebarVisible((prev) => !prev);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize(); 
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      {isMobile ? (
        <div className="sidebar-container fixed top-1 right-1">
          {sidebarVisible && (
            <button
              onClick={handleShowSidebarButton}
              className="fixed top-4 right-4 z-20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e8eaed"
              >
                <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
              </svg>
            </button>
          )}
          <aside
            className={`sidebar fixed top-0 right-0 w-64 h-full bg-gray-800 transition-transform transform ${
              sidebarVisible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <section>
              <button id="0" onClick={setComponent}>
                Home
              </button>
            </section>
            <section>
              <button id="1" onClick={setComponent}>
                Foods
              </button>
            </section>
            <section>
              <button id="2" onClick={setComponent}>
                Macros
              </button>
            </section>
            <section>
              <button id="3" onClick={setComponent}>
                Recipe Inspiration
              </button>
            </section>
          </aside>
        </div>
      ) : (
        <nav className="navbar-container fixed top-0 left-0 right-0 w-full bg-gray-800 p-4 flex justify-between">
          <button id="0" onClick={setComponent} className="text-white">
            Home
          </button>
          <button id="1" onClick={setComponent} className="text-white">
            Foods
          </button>
          <button id="2" onClick={setComponent} className="text-white">
            Macros
          </button>
          <button id="3" onClick={setComponent} className="text-white">
            Recipe Inspiration
          </button>
        </nav>
      )}
    </div>
  );
}
