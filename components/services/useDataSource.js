'use client'
import {
  useReducer,
  useEffect,
  createContext,
  useContext,
} from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../config/fire-config";

function useDataSource() {
  const [{ games, results }, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "setGames":
          return { ...state, games: action.payload };
        case "setResults":
          return { ...state, results: action.payload };
        default:
          return { ...state, ...action.payload };
      }
    },
    {
      games: [],
      results: [],
    }
  );

  useEffect(() => {
    // get games
    async function fetchGames() {
      const querySnapshot = await getDocs(collection(db, "games"));
      const games = [];
      querySnapshot.forEach((doc) => {
        games.push({
          id: doc?.id,
          ...doc.data(),
        });
      });
      dispatch({
        type: "setGames",
        payload: games,
      });
    }
    fetchGames();
    // get results
    async function fetchResults() {
      const querySnapshot = await getDocs(collection(db, "results"));
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({
          id: doc?.id,
          ...doc.data(),
        });
      });
      dispatch({
        type: "setResults",
        payload: results,
      });
    }
    fetchResults();
  }, []);


  return { games, results };
}

const DataContext = createContext({ games: [], results: [] });

// exports

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  return (
    <DataContext.Provider value={useDataSource()}>
      {children}
    </DataContext.Provider>
  );
}