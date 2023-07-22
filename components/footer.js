import React from "react";

const footer = () => {
  return (
    <>
      <div className="w-full p-10 mt-3 text-center bg-black border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
        <h5 className="mb-2 text-3xl font-bold  text-white">
          {" "}
          <span className="border-b-2 border-white ">Disclaimer</span>
        </h5>
        <p className="mb-5 text-base  sm:text text-white">
          The information provided on this website is purely for entertainment
          purposes and is based on numerology and astrology. We do not promote
          or encourage any form of illegal gambling, including Matka or any
          other gambling activities.
        </p>

        <p className="mb-5 text-base  sm:text text-white">
          We would like to emphasize that participating in Matka or any gambling
          activities may be prohibited and illegal in your jurisdiction. We are
          not associated with any illegal Matka shops or gamblers.
        </p>
        <p className="mb-5 text-base  sm:text text-white">
          We respect and abide by the laws and regulations of every country. If
          you find our website's content objectionable or against your local
          laws, we kindly request you to leave our website immediately.
        </p>
        <p className="mb-5 text-base  sm:text text-white">
          Copying, promoting, or reproducing any part of our content, whether on
          television or any other platform, is strictly prohibited and illegal.
        </p>

        <p className="mb-5 text-base  sm:text text-white">
          Please be responsible and mindful of the laws governing gambling in
          your area. We do not endorse any illegal activities related to
          gambling and urge everyone to gamble responsibly and within the bounds
          of the law.
        </p>
      </div>
    </>
  );
};

export default footer;
