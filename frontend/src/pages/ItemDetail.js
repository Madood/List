// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import './ItemDetail.css'; // optional styling

// function ItemDetail() {
//   const { id } = useParams();
//   const [item, setItem] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetch('http://localhost:3001/api/items/' + id)
//       .then(res => res.ok ? res.json() : Promise.reject(res))
//       .then(setItem)
//       .catch(() => navigate('/'));
//   }, [id, navigate]);

//   if (!item) return <p className="loading-text">Loading item details...</p>;

//   return (
//     <div className="detail-container">
//       <h2 className="detail-title">{item.name || 'Unnamed Item'}</h2>
//       <p><strong>Category:</strong> {item.category || 'N/A'}</p>
//       <p><strong>Price:</strong> ${Number(item.price || 0).toFixed(2)}</p>
//       <button className="back-button" onClick={() => navigate(-1)}>⬅ Back</button>
//     </div>
//   );
// }

// export default ItemDetail;
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ItemDetail.css';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/api/items/' + id)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(setItem)
      .catch(() => navigate('/'));
  }, [id, navigate]);

  if (!item) return <p className="loading-text">Loading item details...</p>;

  return (
    <div className="detail-container">
      <h2 className="detail-title">{item.name || 'Unnamed Item'}</h2>

      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          className="detail-image"
        />
      )}

      <p><strong>Category:</strong> {item.category || 'N/A'}</p>
      <p><strong>Price:</strong> ${Number(item.price || 0).toFixed(2)}</p>

      <button className="back-button" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>
    </div>
  );
}

export default ItemDetail;
