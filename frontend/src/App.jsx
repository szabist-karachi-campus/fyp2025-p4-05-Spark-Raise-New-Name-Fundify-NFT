import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { useStateContext } from "./context/StateContext";
import { Sidebar, Navbar, HomeNavbar } from "./components";

const App = () => {
  const location = useLocation();
  const [isHome, setHome] = useState(false);
  const { theme } = useStateContext();

  const otherLinks = [''];

  useEffect(() => {
    const newHomeState = otherLinks.includes(location.pathname?.split("/")[1]);
    setHome(newHomeState);
  }, [location]);

  // In a real app, you would get these from your authentication system
  const currentUser = "User123"; // Replace with actual user info
  const roomId = "general"; // Replace with actual room ID

  return (
    <div className={`relative sm:-8 p-4 min-h-screen flex flex-row w-full transition-colors duration-300
      bg-[#f5eded] dark:bg-[#13131a]`}
    >
      {!isHome && (
        <div className={`sm:flex hidden mr-10 relative bg-[#f5eded] dark:bg-transparent`}>
          <Sidebar />
        </div>
      )}

      <div className={`flex-1 max-sm:w-full max-w-[1280px] mx-auto sm:pr-5 bg-[#f5eded] dark:bg-transparent`}
      >
        {!isHome ? <Navbar /> : <HomeNavbar />}
        <Outlet />
      </div>
    </div>
  );
};

export default App;
