"use client";
import React from "react";
import { useState, useEffect } from "react";
import { format, isSameYear, isSameMonth, isSameDay } from "date-fns";
import Link from "next/link";

import {
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../components/config/fire-config";
function TableResult() {
  const [data, setData] = useState({ games: [], results: [] });
  const [filteredResults, setFilteredResults] = useState([]);

  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, month, 0).getDate();

  const formattedCurrentDate = currentDate.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
  console.log("Dataa", data);
  useEffect(() => {
    const filteredGames = data.games.filter(
      (game) => game.name === "Rj Mumbai"
    );
    const filteredResults = filteredGames
      .map((game) => {
        const gameResults = data.results.filter(
          (res) => res.game_id === game.id
        );
        return gameResults.map((result) => {
          const selectedTime = result.selected_time.seconds * 1000; // Convert seconds to milliseconds
          const formattedTime = format(selectedTime, "dd MMM yyyy, hh:mm a");
          return {
            gameName: game.name,
            resultValue: result.value,
            selectedTime: formattedTime,
          };
        });
      })
      .flat();
    setFilteredResults(filteredResults);
  }, [data]);
  console.log("filteredResults", filteredResults);
  return (
    <>
      <div
        className="mb-4 mt-6 rounded-lg bg-neutral-800 px-6 py-5 text-base text-neutral-50 dark:bg-neutral-900 text-center"
        role="alert"
      >
        <h3 className="font-bold text-yellow-500 text-xl mb-4">
          -: Rj Mumbai Satta Record :-
        </h3>
        <div className="text-yellow-500 mb-4">
          Chart Of {formattedCurrentDate}
        </div>
        <Link
          href="/resultchart"
          className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            View All Result
          </span>
        </Link>
      </div>

      {filteredResults?.some((game) => game.resultValue) && (
        <div className="flex flex-col">
          <div className="overflow-x-auto pl-4 pr-4 sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
              <div className="overflow-hidden">
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
                    {filteredResults
                      ?.sort(
                        (a, b) =>
                          new Date(a?.selectedTime) - new Date(b?.selectedTime)
                      )
                      ?.reduce((acc, game, index) => {
                        const currentYear = new Date().getFullYear();
                        const currentMonth = new Date().getMonth() + 1;
                        const selectedYear = new Date(
                          game.selectedTime
                        ).getFullYear();
                        const selectedMonth =
                          new Date(game.selectedTime).getMonth() + 1;
                        const currentDate = new Date().getDate();
                        const selectedDate = new Date(
                          game.selectedTime
                        ).getDate();
                        if (
                          selectedYear === currentYear &&
                          selectedMonth === currentMonth &&
                          selectedDate === currentDate
                        ) {
                          if (index % 2 === 0) {
                            acc?.push([game]);
                          } else {
                            if (acc.length === 0) {
                              acc.push([]);
                            }
                            acc[acc.length - 1].push(game);
                          }
                        }
                        return acc;
                      }, [])
                      .map((group, index) => (
                        <tr
                          className="w-15 border-b dark:border-neutral-500"
                          key={index}
                        >
                          {group.map((game, gameIndex) => (
                            <React.Fragment key={gameIndex}>
                              <td className="w-18 border-r px-6 py-4 font-medium dark:border-neutral-500">
                                {/* {game.selectedTime} */}
                                {format(new Date(game.selectedTime), "hh:mm a")}
                              </td>
                              <td className="w-32  sm:w-27 border-r dark:border-neutral-500">
                                {game.resultValue}
                              </td>
                            </React.Fragment>
                          ))}
                          {group.length < 2 && (
                            <>
                              <td className="w-15  px-6 py-4">Play and win</td>
                              <td className="w-15  px-6 py-4"></td>
                            </>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TableResult;
