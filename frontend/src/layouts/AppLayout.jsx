import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export const AppLayout = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};
