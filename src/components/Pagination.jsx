
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Lógica para no mostrar todos los números si hay muchas páginas
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow + 2) { // 1 2 3 4 5 6 7
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= maxPagesToShow - 1) { // 1 2 3 4 ... 10
      for (let i = 1; i <= maxPagesToShow; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - (maxPagesToShow - 2)) { // 1 ... 7 8 9 10
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else { // 1 ... 4 5 6 ... 10
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="pagination-nav">
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
            &lsaquo;
          </button>
        </li>
        {pageNumbers.map((number, index) => (
          <li key={index} className={`page-item ${currentPage === number ? 'active' : ''} ${number === '...' ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => typeof number === 'number' && onPageChange(number)}>
              {number}
            </button>
          </li>
        ))}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            &rsaquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
