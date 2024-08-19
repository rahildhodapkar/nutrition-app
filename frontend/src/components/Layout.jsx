import { useState } from "react";
import Home from "./Home";
import FoodTracker from "./FoodTracker";
import MacroTracker from "./MacroTracker";
import Recipes from "./Recipes";
import Sidebar from "./Sidebar";

export default function Layout({ username }) {
  const [componentToRender, setComponentToRender] = useState(<Home username={username}/>);

  const handleWhichComponent = (e) => {
    const id = e.target.id;
    let cmpnt;
    if (id === "0") {
      cmpnt = <Home username={username}/>;
    } else if (id === "1") {
      cmpnt = <FoodTracker username={username} />;
    } else if (id === "2") {
      cmpnt = <MacroTracker username={username}/>;
    } else {
      cmpnt = <Recipes />;
    }
    setComponentToRender(cmpnt);
  };

  return (
    <div className="layout-container">
      <Sidebar setComponent={handleWhichComponent}/> 
      <main>{componentToRender}</main>
    </div>
  );
}
