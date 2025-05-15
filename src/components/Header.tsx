import React from "react";
import Image from "next/image";

const Header = () => {
  return (
    <header className="bg-white text-gray-600 shadow-md">
      <div className="flex items-center justify-between py-2 px-8 border-b-2 border-gray-600">
        <h1 className="text-xl font-bold">DILG IX - DTR </h1>
        {/* <nav className="space-x-4">
          <a
            href="/calendar"
            className="hover:bg-[#FFDE15] transition-colors duration-300 px-3 py-2 rounded"
          >
            Calendar
          </a>
        </nav> */}
      </div>
      <div className="flex items-center justify-center">
        <Image
          src="/dilg9-banner.jpg"
          alt="Header Image"
          className="object-cover py-2"
          width={1000}
          height={100}
        />
      </div>
    </header>
  );
};

export default Header;
