
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useState, useRef, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/components/config/fire-config";
import {
  format,
  isSameYear,
  isSameMonth,
  isSameDay,
  getMonth,
  getYear,
  startOfMonth,
  addDays,
  getDaysInMonth,
} from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const resultlistone = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const [selectedDate, setSelectedDate] = useState(
    new Date(getYear(new Date()), getMonth(new Date()), 1)
  );
  const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()));
  const dropdownRef = useRef(null);
  const [data, setData] = useState({ games: [], results: [] });
  const getRandomColor = (targetLuminance) => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
  
    // Calculate the luminance of the background color
    const luminance =
      (0.299 * parseInt(color.substr(1, 2), 16) +
        0.587 * parseInt(color.substr(3, 2), 16) +
        0.114 * parseInt(color.substr(5, 2), 16)) /
      255;
  
    // Adjust the text color based on the luminance and target luminance
    const textColor = luminance > targetLuminance ? "black" : "white";
  
    return { color, textColor };
  };
  useEffect(() => {
    const unsubscribeGames = onSnapshot(
      collection(db, "games"),
      (gamesSnapshot) => {
        const games = gamesSnapshot?.docs?.map((doc) => ({
          id: doc?.id,
          ...doc.data(),
        }));
        setData((prevData) => ({ ...prevData, games }));
      }
    );

    const unsubscribeResults = onSnapshot(
      collection(db, "results"),
      (resultsSnapshot) => {
        const results = resultsSnapshot?.docs?.map((doc) => ({
          id: doc?.id,
          ...doc?.data(),
        }));
        setData((prevData) => ({ ...prevData, results }));
      }
    );

    return () => {
      unsubscribeGames();
      unsubscribeResults();
    };
  }, []);

  const handleDateSelection = (selectedDate) => {
    const year = getYear(selectedDate);
    const month = getMonth(selectedDate);
    const firstDayOfMonth = new Date(year, month, 1);

    setSelectedDate(firstDayOfMonth);
    setSelectedMonth(month);
  };

  const year = getYear(selectedDate);
  const month = getMonth(selectedDate);

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
  const datewiseGames = data.games.filter((game) => game.type === "datewise");

  // Filter and format results for the current game
  const formattedResults = data.results.map((result) => {
    const selectedTime = result.selected_time.seconds * 1000;
    const formattedTime = format(selectedTime, "dd MMM yyyy, hh:mm a");
    return {
      gameName: data.games.find((game) => game.id === result.game_id)?.name,
      resultValue: result.value,
      selectedTime: formattedTime,
      type: data.games.find((game) => game.id === result.game_id)?.type,
    };
  });

  // Filter and sort results for the current game and month
  const filteredResults = formattedResults.filter((result) => {
    const resultMonth = getMonth(new Date(result.selectedTime));
    const resultYear = getYear(new Date(result.selectedTime));

    return (
      result.gameName &&
      resultMonth === selectedMonth &&
      getYear(selectedDate) === resultYear
    );
  });

  const currentDate = new Date();

  const sortedResults = filteredResults
    .filter((result) => {
      const selectedTime = new Date(result.selectedTime);
      return selectedTime <= currentDate;
    })
    .sort((a, b) => {
      return new Date(a.selectedTime) - new Date(b.selectedTime);
    });
  const formattedSelectedDate = format(selectedDate, "dd-MMM-yyyy");
  const startDate = startOfMonth(selectedDate);
  const daysInMonth = getDaysInMonth(selectedDate);
  const datesInMonth = Array.from({ length: daysInMonth }, (_, index) =>
    addDays(startDate, index)
  );

  return (
    <>
      <div className="flex flex-col items-center mt-10 sm:flex-row sm:justify-center sm:items-center">
        <div className="pl-0 sm:pl-8 relative z-0">
          <label htmlFor="monthSelect"  className="text-lg font-bold">Select Month: </label>
          <DatePicker
            id="monthSelect"
            selected={selectedDate}
            onChange={handleDateSelection}
            showMonthYearPicker
            dateFormat="MMMM/yyyy"
            className="px-4 py-2 mt-2 text-xl border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:outline-none"
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
                    {datewiseGames.length > 0 && (
                      <th
                        scope="col"
                        className="border-r px-6 py-4 dark:border-neutral-500 bg-red-500"
                        style={{
                          backgroundColor: getRandomColor(0.5).color,
                          color: getRandomColor(0.5).textColor,
                        }}
                      >
                        Date
                      </th>
                    )}
                    {datewiseGames.map((game) => (
                      <th
                        key={game.id}
                        scope="col"
                        className="border-r px-6 py-4 dark:border-neutral-500 bg-yellow-500"
                        style={{
                          backgroundColor: getRandomColor(0.5).color,
                          color: getRandomColor(0.5).textColor,
                        }}
                
                     >
                        {game.name}
                      </th>
                    ))}{" "}
                  </tr>
                </thead>
                <tbody>
                  {datesInMonth &&
                    datesInMonth?.map((date) => (
                      <tr
                        key={date}
                        className="w-15 border-b dark:border-neutral-500 "
                      >
                       
                        {datewiseGames.length > 0 && (
                          <td className="w-15 bg-red-500 border-r px-6 py-4 font-medium dark:border-neutral-500 "
                          >
                            {format(date, "dd-MMM-yyyy")}
                          </td>
                        )}
                        {datewiseGames.map((game) => {
                          const gameResult = filteredResults.find(
                            (result) =>
                              isSameDay(new Date(result.selectedTime), date) &&
                              result.type === "datewise" &&
                              result.gameName === game.name
                          );
                          return (
                            <td
                              key={game.id}
                              className="w-15 bg-blue-200 border-r px-6 py-4 font-extrabold dark:border-neutral-500"
                            
                            >
                              {gameResult ? ` ${gameResult.resultValue}` : "-"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default resultlistone;
