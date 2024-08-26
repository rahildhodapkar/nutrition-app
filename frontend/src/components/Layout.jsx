import { useState } from "react";
import Home from "./Home";
import FoodTracker from "./FoodTracker";
import MacroTracker from "./MacroTracker";
import Recipes from "./Recipes";
import Sidebar from "./Sidebar";

export default function Layout({ username, onLoginSuccess }) {
  const [componentToRender, setComponentToRender] = useState(
    <Home username={username} />
  );

  const handleWhichComponent = (e) => {
    const id = e.target.id;
    let cmpnt;
    if (id === "0") {
      cmpnt = <Home username={username} />;
    } else if (id === "1") {
      cmpnt = <FoodTracker username={username} />;
    } else if (id === "2") {
      cmpnt = <MacroTracker username={username} />;
    } else {
      cmpnt = <Recipes />;
    }
    setComponentToRender(cmpnt);
  };

  return (
    <div className="layout-container flex h-full">
      <button className="absolute top-4 left-4 text-2xl font-bold" onClick={() => {
        setComponentToRender(<Home username={username} />)
      }}>Nutron</button>
      <Sidebar setComponent={handleWhichComponent} cb={onLoginSuccess} />
      <main className="flex-1">{componentToRender}</main>
    </div>
  );
}
