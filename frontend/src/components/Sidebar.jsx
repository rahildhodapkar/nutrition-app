import { useState } from "react";

export default function Sidebar({ setComponent }) {
  const [showButton, setShowButton] = useState(
    window.innerHeight > window.innerWidth
  );

  const handleShowButton = () => {
    const moreHeight = window.innerHeight > window.innerWidth;
    setShowButton(moreHeight);
    const sb = document.querySelector(".sidebar");
    sb.style.display = moreHeight ? "none" : "block";
  };

  const handleShowSidebarButton = () => {
    const sb = document.querySelector(".sidebar");
    sb.style.display = sb.style.display === "block" ? "none" : "block";
  };

  // consider optimizing this with a throttle
  window.addEventListener("resize", handleShowButton);

  return (
    <div className="sidebar-container">
      {showButton && (
        <button onClick={handleShowSidebarButton}>
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
      <aside className="sidebar left-0 top-0">
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
  );
}
