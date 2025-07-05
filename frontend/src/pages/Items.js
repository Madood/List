// // import React, { useEffect, useState } from 'react';
// // import { useData } from '../state/DataContext'; // ✅ Make sure this path is correct
// // import { Link } from 'react-router-dom';

// // function Items() {
// //   const { items, fetchItems, page, total, q } = useData(); // ✅ This must include fetchItems
// //   const [search, setSearch] = useState(q);

// //   useEffect(() => {
// //     fetchItems(search, page);
// //   }, [fetchItems, search, page]);

// //   const handleSearch = (e) => {
// //     e.preventDefault();
// //     fetchItems(search, 1); // reset to page 1
// //   };

// //   const handlePageChange = (newPage) => {
// //     fetchItems(search, newPage);
// //   };

// //   const totalPages = Math.ceil(total / 5);

// //   return (
// //     <div>
// //       <form onSubmit={handleSearch}>
// //         <input
// //           value={search}
// //           onChange={(e) => setSearch(e.target.value)}
// //           placeholder="Search items..."
// //         />
// //         <button type="submit">Search</button>
// //       </form>

// //       <ul>
// //         {items.map(item => (
// //           <li key={item.id}>
// //             <Link to={`/items/${item.id}`}>{item.name}</Link>
// //           </li>
// //         ))}
// //       </ul>

// //       <div>
// //         <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
// //           Prev
// //         </button>
// //         <span> Page {page} of {totalPages} </span>
// //         <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>
// //           Next
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }

// // export default Items;
// import React, { useEffect, useState } from 'react';
// import { useData } from '../state/DataContext';
// import { Link } from 'react-router-dom';
// import { FixedSizeList as List } from 'react-window';

// function Items() {
//   const { items, fetchItems, page, total, q } = useData();
//   const [search, setSearch] = useState(q);

//   useEffect(() => {
//     fetchItems(search, page);
//   }, [fetchItems, search, page]);

//   const handleSearch = (e) => {
//     e.preventDefault();
//     fetchItems(search, 1); // Reset to page 1 on new search
//   };

//   const handlePageChange = (newPage) => {
//     fetchItems(search, newPage);
//   };

//   const totalPages = Math.ceil(total / 5);

//   const Row = ({ index, style }) => {
//     const item = items[index];
//     return (
//       <div style={style} key={item.id}>
//         <Link to={`/items/${item.id}`}>{item.name}</Link>
//       </div>
//     );
//   };

//   return (
//     <div>
//       <form onSubmit={handleSearch}>
//         <input
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="Search items..."
//         />
//         <button type="submit">Search</button>
//       </form>

//       {/* ✅ Virtualized list */}
//       <List
//         height={300}        // Height of the container
//         itemCount={items.length}
//         itemSize={35}       // Height of each item row
//         width={'100%'}
//       >
//         {Row}
//       </List>

//       {/* ✅ Pagination */}
//       <div style={{ marginTop: '1rem' }}>
//         <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
//           Prev
//         </button>
//         <span> Page {page} of {totalPages} </span>
//         <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Items;

import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import './Items.css'; // ✅ External CSS for styling

function Items() {
  const { items, fetchItems, page, total, q } = useData();
  const [search, setSearch] = useState(q);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchItems(search, page);
      setLoading(false);
    };
    load();
  }, [fetchItems, search, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems(search, 1);
  };

  const handlePageChange = (newPage) => {
    fetchItems(search, newPage);
  };

  const totalPages = Math.ceil(total / 5);

  const Row = ({ index, style }) => {
    const item = items[index];
    return (
      <div style={style} className="item-row">
        <Link to={`/items/${item.id}`}>{item.name}</Link>
      </div>
    );
  };

  return (
    <div className="container">
      <h1 className="heading">📦 Item Explorer</h1>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          className="search-input"
          aria-label="Search items"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items by name..."
        />
        <button className="search-button" type="submit">🔍 Search</button>
      </form>

      {loading ? (
        <div className="skeleton-list">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="skeleton-row" key={i}></div>
          ))}
        </div>
      ) : (
        <List
          className="virtual-list"
          height={300}
          itemCount={items.length}
          itemSize={40}
          width={'100%'}
        >
          {Row}
        </List>
      )}

      <div className="pagination">
        <button
          className="nav-button"
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
        >
          ◀ Prev
        </button>
        <span className="page-info">Page {page} of {totalPages}</span>
        <button
          className="nav-button"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next ▶
        </button>
      </div>

      <footer className="footer">© 2025 Madood Maharvi</footer>
    </div>
  );
}

export default Items;
