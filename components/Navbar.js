import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <>
      <nav
        className=" sticky top-0 z-10 relative flex w-full items-center justify-between bg-black py-2 shadow-sm shadow-neutral-700/10 dark:bg-neutral-800 dark:shadow-black/30 lg:flex-wrap lg:justify-start"
        data-te-navbar-ref
      >
        <div className="flex w-full flex-wrap items-center justify-center px-6">
          <h1 className="bg-black text-white">
            <Link href="https://www.rjmumbai.com" target="_blank">💥🤩 Rj mumbai 💥🤩</Link>
          </h1>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
