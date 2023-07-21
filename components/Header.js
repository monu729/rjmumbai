"use client";
import { React, useState, useEffect } from "react";
import {
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../components/config/fire-config";
import Link from "next/link";

function Header() {
  const [gameData, setGameData] = useState({ game: null, result: null });

  useEffect(() => {
    const unsubscribeGames = onSnapshot(
      collection(db, "games"),
      (gamesSnapshot) => {
        const games = gamesSnapshot?.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const rjMumbaiGame = games?.find((game) => game.name === "Rj Mumbai");

        if (rjMumbaiGame) {
          const currentTimeInSeconds = Math.floor(Date.now() / 1000);

          const unsubscribeResults = onSnapshot(
            query(
              collection(db, "results"),
              where("game_id", "==", rjMumbaiGame?.id),
              where("selected_time", "<=", new Date()),
              orderBy("selected_time", "desc"),
              limit(1)
            ),
            (resultsSnapshot) => {
              const results = resultsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));

              if (results?.length > 0) {
                const selectedResult = results[0];
                const selectedTimeInSeconds =
                  selectedResult.selected_time.seconds;

                if (selectedTimeInSeconds <= currentTimeInSeconds) {
                  setGameData({ game: rjMumbaiGame, result: selectedResult });
                } else {
                  setGameData({ game: null, result: null });
                }
              } else {
                setGameData({ game: null, result: null });
              }
            }
          );

          return () => {
            unsubscribeResults();
          };
        } else {
          setGameData({ game: null, result: null });
        }
      }
    );

    return () => {
      unsubscribeGames();
    };
  }, []);
  console.log("gameData", gameData);
  return (
    <>
      <section className="mb-8 overflow-hidden">
        <div className="relative overflow-hidden bg-cover bg-no-repeat bg-[50%] h-[500px] bg-[url('https://tecdn.b-cdn.net/img/new/standard/city/078.jpg')]">
          <div className="absolute top-0 right-0 bottom-0 left-0 h-full w-full overflow-hidden bg-fixed bg-[hsla(0,0%,0%,0.75)]">
            <div className="flex h-full items-center justify-center">
              <div className="px-6 text-center text-white md:px-12">
                <h2 className="mt-6 mb-16 text-5xl font-bold tracking-tight md:text-6xl xl:text-7xl">
                  {gameData?.game && gameData?.game
                    ? gameData?.game?.name
                    : "Rj Mumbai"}{" "}
                  <br />
                  <span>
                    Live <br /> {gameData?.result?.value}
                  </span>
                </h2>
                <Link
                  className="mb-2 inline-block rounded-full border-2 border-neutral-50 px-[46px] pt-[14px] pb-[12px] text-sm font-medium uppercase leading-normal text-neutral-50 transition duration-150 ease-in-out hover:border-neutral-100 hover:bg-neutral-500 hover:bg-opacity-10 hover:text-neutral-100 focus:border-neutral-100 focus:text-neutral-100 focus:outline-none focus:ring-0 active:border-neutral-200 active:text-neutral-200 md:mr-2 md:mb-0"
                  data-te-ripple-init
                  data-te-ripple-color="light"
                  href="/resultchart"
                  role="button"
                >
                  Chart{" "}
                </Link>
                <a
                  className="inline-block rounded-full px-12 pt-4 pb-3.5 text-sm font-medium uppercase leading-normal text-neutral-50 transition duration-150 ease-in-out hover:bg-neutral-500 hover:bg-opacity-20 hover:text-neutral-200 focus:text-neutral-200 focus:outline-none focus:ring-0 active:text-neutral-300"
                  data-te-ripple-init
                  data-te-ripple-color="light"
                  href="#!"
                  role="button"
                >
                  Learn more
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="-mt-2.5 text-white dark:text-neutral-800 md:-mt-4 lg:-mt-6 xl:-mt-10 h-[50px] scale-[2] origin-[top_center]">
          <svg viewBox="0 0 2880 48" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 0 48 L 1437.5 48 L 2880 48 L 2880 0 L 2160 0 C 1453.324 60.118 726.013 4.51 720 0 L 0 0 L 0 48 Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
        <div className="div-2 bg-green-500 shadow-xl border-2 border-white my-1 py-0 px-0 rounded-xl border-t-5 border-b-5">
          <h2 className="h5 text-white py-2 px-4 rounded-tl-xl rounded-tr-xl font-bold text-sm text-shadow text-center">
           rj mjumbai  |rj mjumbai  SATTA MATKA | SATTA | RJ
            MUMBAI SATTA RESULT
          </h2>
          <h2 className="h4 bg-white text-black py-2 px-2 rounded-br-xl rounded-bl-xl shadow-md font-bold text-base border-2 border-black border-t-5 text-center ">
           rj mjumbai  SATTA{" "}
          </h2>
          <p className="p mt-3 border-2 border-dark text-black py-2 px-4 bg-white rounded-br-xl rounded-bl-xl font-bold text-sm leading-6 shadow border-2 border-black border-t-5">
           rj mjumbai  SATTA | MATKA |rj mjumbai  SATTA MATKA
            RESULT |rj mjumbai  SATTA | DPBOSS | MADHUR MATKA | INDIAN
            MATKA CENTER | SATTA MATKA NUMBER | SATTA MATKA RESULT | SATTA MATKA
            GUESSING | SATTA | PLAY ONLINErj mjumbai  SATTA | SATTA KING
            | MATKA GUESSING | FASTEST SATTA MATKA | SATTA MATKA CENTER | SATTA
            MATKA FREE SEVA | SATTA MATKA TIPS | SATTA MATKA GAME | SATTA |
            MATKA GAME KING | SATTA MATKA COM | SATTA MATKA BAZAR | SATTA FAST
            RESULT | SATTA KING | SATTA RECORD | SATKA MATKA RESULT | MATKA
            SATTA GAME | SATKA MATKA | SATTA RESULTS | SATTA KING RESULT{" "}
          </p>
        </div>
      </section>
    </>
  );
}

export default Header;
