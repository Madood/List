import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');

  const fetchItems = useCallback(async (query = '', pageNum = 1, limit = 5) => {
    const res = await fetch(`http://localhost:3001/api/items?q=${query}&page=${pageNum}&limit=${limit}`);
    const json = await res.json();
    setItems(json.items);
    setTotal(json.total);
    setPage(json.page);
    setQ(query);
  }, []);

  return (
    <DataContext.Provider value={{ items, fetchItems, page, total, q }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
