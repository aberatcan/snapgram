import Bottombar from "@/components/shared/Bottombar";
import LeftSideBar from "@/components/shared/LeftSideBar";
import Topbar from "@/components/shared/Topbar";

import { Outlet } from "react-router-dom";

/**
 * This is the RootLayout component.
 * 
 * - Used to render the root layout.
 * - Used to render the Outlet component to render the child routes.
 * - Used to render the Bottombar component.
 * - Used to render the Topbar component. 
 * - Used to render the LeftSideBar component.
 */

const RootLayout = () => {
  return (
    <div className="w-full md:flex">
      <Topbar />
      <LeftSideBar />
      <section className="flex flex-1 h-full">
        <Outlet />
      </section>
      <Bottombar />
    </div>
  );
};

export default RootLayout;
