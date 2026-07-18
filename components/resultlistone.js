"use client";

import React from "react";
import { useState, useMemo } from "react";
import { useData, useResults } from "./services/useDataSource";

import {
  format,
  getMonth,
  getYear,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays,
  getDaysInMonth,
} from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Resultlistone = () => {
  const { games } = useData();

  const [selectedDate, setSelectedDate] = useState(
    new Date(getYear(new Date()), getMonth(new Date()), 1)
  );

  // The month is fetched in two slices so each gets the right CDN cache
  // tier: the bulk (month start -> yesterday) caches long at the edge,
  // while today's slice stays on the 60s tier so new results show up fast.
  // For past months the bulk covers the whole month and the today-slice
  // request is skipped.
  const monthStartMs = startOfMonth(selectedDate).getTime();
  const monthEndMs = endOfMonth(selectedDate).getTime();
  const todayStartMs = startOfDay(new Date()).getTime();
  const monthIncludesToday =
    todayStartMs >= monthStartMs && todayStartMs <= monthEndMs;
  const bulkEndMs = monthIncludesToday ? todayStartMs - 1 : monthEndMs;

  const { results: bulkResults } = useResults({
    startMs: monthStartMs,
    endMs: bulkEndMs,
    // On the 1st of the month there are no past days to fetch yet.
    enabled: bulkEndMs >= monthStartMs,
  });
  const { results: todayResults } = useResults({
    startMs: todayStartMs,
    endMs: endOfDay(new Date()).getTime(),
    enabled: monthIncludesToday,
  });
  const results = useMemo(
    () => [...bulkResults, ...todayResults],
    [bulkResults, todayResults]
  );

  const handleDateSelection = (date) => {
    setSelectedDate(new Date(getYear(date), getMonth(date), 1));
  };

  // One pass over all results -> Map(dayOfMonth -> Map(gameId -> [{timeMs, value}]))
  // for the selected month. Cells then read straight from the map instead of
  // re-scanning the results array per cell (31 rows x N games).
  const resultsByDayAndGame = useMemo(() => {
    const month = getMonth(selectedDate);
    const year = getYear(selectedDate);
    const now = Date.now();
    const map = new Map();

    for (const result of results) {
      const timeMs = result.selected_time.seconds * 1000;
      if (timeMs > now) continue; // never show future results
      const time = new Date(timeMs);
      if (getMonth(time) !== month || getYear(time) !== year) continue;

      const day = time.getDate();
      if (!map.has(day)) map.set(day, new Map());
      const byGame = map.get(day);
      if (!byGame.has(result.game_id)) byGame.set(result.game_id, []);
      byGame.get(result.game_id).push({ timeMs, value: result.value });
    }

    for (const byGame of map.values()) {
      for (const list of byGame.values()) {
        list.sort((a, b) => a.timeMs - b.timeMs);
      }
    }
    return map;
  }, [results, selectedDate]);

  const datesInMonth = useMemo(() => {
    const startDate = startOfMonth(selectedDate);
    return Array.from({ length: getDaysInMonth(selectedDate) }, (_, index) =>
      addDays(startDate, index)
    );
  }, [selectedDate]);

  return (
    <>
      <div
        className="mb-4 mt-6 rounded-lg bg-neutral-800 px-6 py-5 text-base text-neutral-50 dark:bg-neutral-900 text-center"
        role="alert"
      >
        <h3 className="font-bold text-blue-500 text-xl mb-4">
          -: Monthly Result Chart :-
        </h3>
        <div className="text-blue-500">
          Chart of {format(selectedDate, "MMMM yyyy")}
        </div>
      </div>

      <div className="flex flex-col items-center mt-10 sm:flex-row sm:justify-center sm:items-center">
        <div className="pl-0 sm:pl-8 relative z-0">
          <label htmlFor="monthSelect" className="text-lg font-bold">
            Select Month:{" "}
          </label>
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

      {games.length === 0 ? (
        <p className="text-center text-base text-neutral-500 mt-6">
          Loading games...
        </p>
      ) : (
        <div className="flex flex-col">
          <div className="overflow-x-auto pl-4 pr-4  sm:-mx-6  lg:-mx-8">
            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
              <div className="overflow-hidden">
                <table className="min-w-full border text-center text-sm font-light dark:border-neutral-500">
                  <thead className="border-b font-medium dark:border-neutral-500">
                    <tr className="w-15">
                      <th
                        scope="col"
                        className="border-r px-6 py-4 dark:border-neutral-500 bg-red-500"
                      >
                        Date
                      </th>
                      {games.map((game) => (
                        <th
                          key={game.id}
                          scope="col"
                          className="border-r px-6 py-4 dark:border-neutral-500 bg-yellow-500"
                        >
                          {game.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {datesInMonth.map((date) => {
                      const byGame = resultsByDayAndGame.get(date.getDate());
                      return (
                        <tr
                          key={date}
                          className="w-15 border-b dark:border-neutral-500 "
                        >
                          <td className="w-15 bg-red-500 border-r px-6 py-4 font-medium dark:border-neutral-500 ">
                            {format(date, "dd-MMM-yyyy")}
                          </td>
                          {games.map((game) => {
                            const dayResults = byGame?.get(game.id) ?? [];
                            return (
                              <td
                                key={game.id}
                                className="w-15 bg-blue-200 border-r px-4 py-2 font-extrabold dark:border-neutral-500"
                              >
                                {dayResults.length === 0 ? (
                                  "-"
                                ) : game.type === "datewise" ? (
                                  // Datewise: a single result per day.
                                  dayResults[0].value
                                ) : (
                                  // Timewise: every result of the day, in time order.
                                  dayResults.map((result) => (
                                    <div
                                      key={result.timeMs}
                                      className="whitespace-nowrap py-0.5"
                                    >
                                      <span className="text-xs font-medium text-neutral-600">
                                        {format(result.timeMs, "hh:mm a")}
                                      </span>{" "}
                                      {result.value}
                                    </div>
                                  ))
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Resultlistone;
