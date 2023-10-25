"use client";

import React from "react";
import { useState, useRef, useEffect } from "react";
import { useData } from "@/components/services/useDataSource";

import {
  format,
  isSameYear,
  isSameMonth,
  isSameDay,
  getMonth,
  getYear,
} from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import range from "lodash/range";
import Link from "next/link";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Resultlistone from "../../components/resultlistone"
import ScrollToTopButton from "@/components/ScrollToTopButton";

const DynamicFooter = dynamic(() => import("../../components/footer"));
const page = () => {
  const { games, results } = useData(); 

  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const years = range(1990, getYear(new Date()) + 1, 1);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()));
  const dropdownRef = useRef(null);
  const [data, setData] = useState({ games: [], results: [], filteredResults: [] });
 
  useEffect(() => {
    setData({ games, results }); // Set the initial data directly from the hook

    if (games.length > 0) {
      // Set the initial selectedGame once games data is available
      const timewiseGames = games.filter((game) => game.type === "timewise");
      if (timewiseGames.length > 0) {
        setSelectedGame(timewiseGames[0]);
      }
    }
  }, [games, results]);

  const handleGameSelection = (game) => {
    setSelectedGame(game);
    setDropdownVisible(false);
  };

  const handleDateSelection = (selectedDate) => {
    setSelectedMonth(getMonth(selectedDate)); // Update the selectedMonth state with the month of the selected date
    setSelectedDate(selectedDate); // Update the selectedDate state with the selected date
  };

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const gameResults = data.results.filter(
    (result) => result.game_id === selectedGame?.id
  );

  const formattedResults = gameResults.map((result) => {
    const selectedTime = result.selected_time.seconds * 1000; // Convert seconds to milliseconds
    const formattedTime = format(selectedTime, "dd MMM yyyy, hh:mm a");
    return {
      gameName: selectedGame?.name,
      resultValue: result.value,
      selectedTime: formattedTime,
      type: selectedGame.type,
    };
  });

  useEffect(() => {
    const filteredResults = formattedResults.filter((result) => {
      const resultTime = new Date(result.selectedTime);
      return (
        isSameYear(resultTime, startDate) &&
        isSameMonth(resultTime, startDate) &&
        isSameDay(resultTime, startDate)
      );
    });
    setData((prevData) => ({ ...prevData, filteredResults }));
  }, [selectedGame, selectedMonth, startDate, formattedResults]);

  const currentDate = new Date(); // Get the current date and time

  const sortedResults = formattedResults
    .filter((result) => {
      const resultMonth = getMonth(new Date(result.selectedTime));
      return (
        selectedGame &&
        result.gameName === selectedGame.name &&
        resultMonth === selectedMonth
      );
    })
    .filter((result) => {
      const selectedTime = new Date(result.selectedTime);
      return selectedTime <= currentDate; // Only include results that are on or before the current date and time
    })
    .sort((a, b) => {
      return new Date(a.selectedTime) - new Date(b.selectedTime);
    });
  return (
    <>
        {/* <head>
        <title>
        Rj mubai Chart | Panel Chart, Result, Old Record
        </title>
        <meta
          name="keywords"
          content="Rj mubai Chart, Rj mubai Panel Chart, Rj mubai Result, Rj mubai Old Record, Satta Matka Rj mubai, Rj mubai Chart Panel, Rj mubai Open, Rj mubai with Panel, Fastest Rj mubai, Rj mubai DP, DPBOSS Rj mubai Panel Chart"
        />
        <meta
          name="description"
          content="Explore live Rj mubai Chart & results. Get tips from the main bazar chart. Find various Rj mubai Panel Charts. Play responsibly."
        />
        <link
          href="https://www.rjmumbai.com/resultchart"
          rel="canonical"
        />

        <meta
          property="og:title"
          content="Rj mubai Chart - Rj mubai Panel Chart, Result, Old Record | Satta Matka Rj mubai"
        />
        <meta
          property="og:description"
          content="Rj mubai - Live Satta Result and Chart. Get the latest results and charts of Super Dubai, Super Faridabad, Delhi Bazar, Shri Ganesh, and more."
        />
        <meta
          property="og:url"
          content="https://www.rjmumbai.com/resultchart"
        />
        <meta property="og:type" content="website" />
      
        <meta property="og:image:alt" content="Rj mubai Chart" />
      </head>
      <Navbar />
      <div className="w-full p-3 text-center bg-purple-700 border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
        <h5 className="mb-2 text-3xl font-bold  text-white relative">
          <span className="border-b-2 border-white animate-blink">
            RJ MUMBAI  CHART
          </span>{" "}
        </h5>
        <p className="mb-5 text-base  sm:text-lg text-white">
          RJ MUMBAI  PANEL CHART |RJ MUMBAI  CHART | RJ MUMBAI
           MATKA CHART | RJ MUMBAI  CHARTS | RJ MUMBAI 
          | RJ MUMBAI  OLD CHART | RJ MUMBAI  PANEL OLD RECORD |
          SATTA MATKA RJ MUMBAI  | SATTA MATKA RECORD | SATTA | RJ
          MUMBAI  CHART PANEL | RJ MUMBAI  CHART OPEN | RJ
          MUMBAI  WITH PANEL | FASTEST RJ MUMBAI  | RJ MUMBAI
           CHART MATKA | RJ MUMBAI  CHART DP | DPBOSS RJ MUMBAI
           PANEL CHART | RJ MUMBAI  CHART 1990
        </p>
      </div>
      <div className="flex flex-col items-center mt-10 sm:flex-row sm:justify-center sm:items-center">
        <div className="mb-4 sm:mr-4 sm:mb-0 relative z-10">
          <div ref={dropdownRef} className="relative inline-block">
            <button
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 inline-flex items-center"
              onClick={toggleDropdown}
            >
              {selectedGame ? selectedGame.name : "Select a Game"}
              <svg
                className="w-4 h-4 ml-2"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isDropdownVisible && (
              <div className="absolute right-0 mt-2 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow">
                <ul className="py-2 text-sm text-gray-700">
                  {data?.games?.map((game, index) => {
                    if (game.type === "timewise") {
                      return (
                        <li key={index}>
                          <a
                            className={`block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
                              selectedGame && selectedGame.id === game.id
                                ? "bg-gray-200"
                                : ""
                            }`}
                            onClick={() => handleGameSelection(game)}
                          >
                            {game.name}
                          </a>
                        </li>
                      );
                    }
                    return null; 
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="pl-0 sm:pl-8 relative z-0">
          <label htmlFor="monthSelect">Select Month:</label>

          <DatePicker
            id="monthSelect"
            dateFormat="dd/MMMM/yyyy"
            isClearable
            renderCustomHeader={({
              date,
              changeYear,
              changeMonth,
              decreaseMonth,
              increaseMonth,
              prevMonthButtonDisabled,
              nextMonthButtonDisabled,
            }) => (
              <div
                style={{
                  margin: 10,
                  display: "flex",
                  justifyContent: "space-around",
                }}
              >
                <button
                  onClick={decreaseMonth}
                  disabled={prevMonthButtonDisabled}
                >
                  {"<"}
                </button>
                <select
                  value={getYear(date)}
                  onChange={({ target: { value } }) => changeYear(value)}
                >
                  {years.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  // value={months[getMonth(date)]}
                  value={months[getMonth(date)]} // Use month names
                  onChange={({ target: { value } }) =>
                    changeMonth(months.indexOf(value))
                  }
                >
                  {months.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <button
                  onClick={increaseMonth}
                  disabled={nextMonthButtonDisabled}
                >
                  {">"}
                </button>
              </div>
            )}
            selected={selectedDate}
            onChange={handleDateSelection}
            maxDate={new Date()} // Disable future dates
            className="px-2 py-1 border border-gray-300 rounded"
          />
        </div>
      </div>
      <div class="flex flex-col">
        <div class="overflow-x-auto pl-4 pr-4  sm:-mx-6  lg:-mx-8">
          <div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
            <div class="overflow-hidden">
              <table className="min-w-full border text-center text-sm font-light dark:border-neutral-500">
                <thead className="border-b font-medium dark:border-neutral-500">
                  <tr className="w-15">
                    <th
                      scope="col"
                      className="border-r px-6 py-4 dark:border-neutral-500"
                    >
                      Time
                    </th>
                    <th
                      scope="col"
                      className="border-r px-6 py-4 dark:border-neutral-500"
                    >
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults
                    .filter((result) => {
                      const resultDate = new Date(result.selectedTime);
                      return (
                        isSameYear(resultDate, selectedDate) &&
                        isSameMonth(resultDate, selectedDate) &&
                        isSameDay(resultDate, selectedDate)
                      );
                    })
                    .map((result, index) => (
                      <tr
                        key={index}
                        className="w-15 border-b dark:border-neutral-500"
                      >
                        <td className="w-15 border-r px-6 py-4 font-medium dark:border-neutral-500">
                          {result.selectedTime}
                        </td>
                        <td className="w-15 border-r px-6 py-4 font-medium dark:border-neutral-500">
                          {result.resultValue}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>{" "}
      <div className="w-full p-3 text-center bg-teal-500 border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
        <h5 className="mb-2 text-3xl font-bold  text-white">
          <span className="border-b-2 border-white animate-blink">
            {" "}
            Rj Mumbai  Panel Chart Information Center
          </span>
        </h5>
        <p className="mb-5 text-base  sm:text text-white">
          Main  Panal Chart (मेन बाजार पैनल चार्ट, मेन बाजार चार्ट) is
          the list of all game charts played till date. Getting an updated and
          oldest Rj Mumbai  Chart is very difficult because many players
          came into the market a few years back and they don’t have any idea
          about the game.
        </p>
        <p className="mb-5 text-base  sm:text text-white">
          At matka center we provide the most updated live Rj Mumbai 
          Panel Chart. We have been into this market for the past 70 years and
          we have seen all the phases, here at matka center you will get all the
          genuine details only. Satta matka is a type of gambling or lottery
          game and you are placing money on the game so the information you get
          about the game is also trustworthy.
        </p>
        <p className="mb-5 text-base  sm:text text-white">
          As you all recognise, satta matka is certainly one of most popular
          games in India as well as abroad. Important bazaar recreation is
          performed on the nearby level and in this recreation the danger of
          winning the sport could be very high.
        </p>
        <p className="mb-5 text-base  sm:text text-white">
          There are lots of websites who used to provide up to date Rj Mumbai
           charts but right here at matka middle you will get it
          completely loose and our group regularly updated this chart from 1970.
        </p>
        <p className="mb-5 text-base  sm:text text-white">
          As a participant you can use the primary bazar chart to locate
          pointers and hints to fetch the Rj Mumbai  recreation range on
          which cash is positioned. This can help you to improve and boom your
          chances of prevailing in the game.
        </p>

        <h5 className="mb-2 text-3xl font-bold  text-white">
          {" "}
          <span className="border-b-2 border-white animate-blink">
            What are the special varieties of principal bazar panel chart?
          </span>
        </h5>
        <p className="mb-5 text-base  sm:text text-white">
          Exclusive sorts of Rj Mumbai  chart are major bazar panel
          chart, Rj Mumbai  panel old chart, satta matka Rj Mumbai
           panel chart, matka Rj Mumbai  panel chart, Rj Mumbai
           panel chart 2023, oldest Rj Mumbai  panel chart, up
          to date Rj Mumbai  panel chart and others.
        </p>
        <p className="mb-5 text-base  sm:text text-white">
          The Rj Mumbai  panel is a new form of matka gaming that is
          very popular between players. TheRj Mumbai  contains game
          numbers and their results so that players can understand the game and
          find their own tips and tricks to win. The Rj Mumbai  game is
          a lot like lotteries, where you can try to win matches by betting
          money on certain numbers. If you win, you can often get a very high
          return on your investment. We have the Rj Mumbai  panel charts
          and game results. If you are interested in playing matka, you can find
          all the information you need here. Just call our number and we will be
          happy to help you. Playing games like Rj Mumbai  Panel Chart,
          Rj Mumbai  Panel Matka, Rj Mumbai  Open Matka, Rj
          Mumbai  Panel Chart are illegal in some parts of India, so if
          you're playing this game, we suggest you take care. Matka.center is
          the only place where you can find quality, informative content about
          games. We are one of the fastest sites to publish online results, and
          we've divided our site up by game to make it easy for you to find what
          you're looking for. We have different charts that show how well
          different stars are aligned. Some of these charts are called Milan day
          jodi chart, Milan day panel chart, Rajdhani day jodi chart, Rajdhani
          day panel chart, Rajdhani night panel chart, Kalyan panel chart,
          Kalyan Night Panel Chart, Kalyan jodi chart, Milan day jodi chart,
          Milan day panel chart, super king day jodi chart, super king night
          jodi chart, super king night panel chart, and time bazar satta.
        </p>
      </div>
      <Resultlistone />
      <ScrollToTopButton />
      <DynamicFooter /> */}
      <h1>Page not Found</h1>
    </>
  );
};

export default page;
