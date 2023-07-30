"use client";
import { React, useState, useEffect } from "react";
import { useData } from "./services/useDataSource";

function CardResult({ data }) {
  const { games, results } = useData();

  const [gameData, setGameData] = useState({
    game: null,
    result: null,
    color: null,
  });
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, month, 0).getDate();

  const formattedCurrentDate = currentDate.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    // Adjust the text color based on the luminance of the background color
    const luminance =
      (0.299 * parseInt(color.substr(1, 2), 16) +
        0.587 * parseInt(color.substr(3, 2), 16) +
        0.114 * parseInt(color.substr(5, 2), 16)) /
      255;

    const textColor = luminance > 0.5 ? "black" : "white";

    return { color, textColor };
  }; 
  const formatDateTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      hourCycle: "h12",
    };
    const formattedDateTime = date.toLocaleString(undefined, options);
    const dateTimeParts = formattedDateTime.split(", ");
    const timePart = dateTimeParts[1];
    const amPm = timePart.slice(-2).toUpperCase();
    const formattedTime = timePart.slice(0, -2).trim();
    return `${dateTimeParts[0]}, ${formattedTime} ${amPm}`;
  };
  
  useEffect(() => {
    if (games && results) {
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      const updatedGameData = {};

      games.forEach((game) => {
        const selectedResults = results.filter(
          (result) =>
            result.game_id === game.id &&
            result.selected_time.seconds <= currentTimeInSeconds
        );

        if (selectedResults.length > 0) {
          selectedResults.sort(
            (a, b) => b.selected_time.seconds - a.selected_time.seconds
          );

          const selectedResult = selectedResults[0];
          const { color, textColor } = getRandomColor();

          updatedGameData[game.id] = {
            game,
            result: selectedResult,
            color,
            textColor,
          };
        } else {
          // Check for future results and set the nearest one
          const futureResults = results.filter(
            (result) => result.game_id === game.id
          );

          if (futureResults.length > 0) {
            futureResults.sort(
              (a, b) => a.selected_time.seconds - b.selected_time.seconds
            );

            const selectedResult = futureResults[0];
            const { color, textColor } = getRandomColor();

            updatedGameData[game.id] = {
              game,
              result: selectedResult,
              color,
              textColor,
            };
          } else {
            // If there are no results at all
            const { color, textColor } = getRandomColor();
            updatedGameData[game.id] = {
              game,
              result: null,
              color,
              textColor,
            };
          }
        }
      });

      setGameData(updatedGameData);
    }
  }, [games, results]);
  return (
    <>
      <div
        className="mb-4 rounded-lg bg-neutral-800 px-6 py-5 text-base text-neutral-50 dark:bg-neutral-900 text-center"
        role="alert"
      >
        <h3 className="font-bold text-green-500 text-xl mb-4">
          -: Rj Mumbai Satta Result :-
        </h3>
        <div className="text-green-500 mb-4">{formattedCurrentDate}</div>
      </div>
      {/* RESULT  */}
      {/* <Image src={arrow} className="mx-2" alt="Arrow" /> */}
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {Object.keys(gameData)?.length > 0 ? (
            Object.values(gameData)?.map((data) =>
              data?.result?.value ? (
                <div key={data?.game?.id}>
                  <div
                    className="shadow rounded p-4 mb -4 text-center"
                    style={{
                      backgroundColor: data.color,
                      color: data.textColor,
                    }}
                  >
                    <h3 className="text-xl font-bold mb-2">
                      {data?.game?.name}
                    </h3>
                    <p className="text-600 flex items-center font-bold justify-center">
                      Result: {data?.result?.value}
                    </p>
                    <p className="text-600 font-bold  flex items-center justify-center">
                      Time: {formatDateTime(data.result.selected_time.seconds)}
                    </p>
                  </div>
                </div>
              ) : null
            )
          ) : (
            <p>No game data available</p>
          )}
        </div>
      </div>
    </>
  );
}

export default CardResult;
