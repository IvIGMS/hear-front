
import './PageSizeSelector.css';

const PageSizeSelector = ({ currentPageSize, onPageSizeChange, options }) => {
  return (
    <div className="page-size-selector">
      <label htmlFor="page-size">Items por página:</label>
      <select 
        id="page-size"
        value={currentPageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="custom-select"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PageSizeSelector;
