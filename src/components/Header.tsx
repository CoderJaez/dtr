import React from "react";
import Image from "next/image";

const Header = () => {
  return (
    <header className="bg-white text-gray-600 shadow-md">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <Image
          src="/dilglogo.png"
          alt="DILG Logo"
          className=" mr-3"
          width={70}
          height={70}
        />
        <h1 className="text-xl font-bold">DILG 9 - DTR </h1>
        <nav className="space-x-4">
          {/* <a
            href="/calendar"
            className="hover:bg-yellow-500 transition-colors duration-300 px-3 py-2 rounded"
          >
            Calendar
          </a> */}
        </nav>
      </div>
    </header>
  );
};

export default Header;
