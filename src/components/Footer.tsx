import React from "react";

const Footer: React.FC = () => (
  <footer className="w-full py-4 text-center bg-gray-100 text-gray-600 border-t border-gray-200 mt-8">
    © Copyright {new Date().getFullYear()} © . The official website of DILG 9
    DTR. Regional Information Communication and Technology Unit. All rights
    reserved.
  </footer>
);

export default Footer;
