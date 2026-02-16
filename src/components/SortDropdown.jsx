/**
 * SortDropdown Component
 * Displays radio buttons to sort flight results (matches Filters styling)
 * 
 * @param {string} sortType - Current sort type
 * @param {function} setSortType - Function to update sort type
 * @param {boolean} disabled - Whether the sorting should be disabled
 */
export default function SortDropdown({ sortType, setSortType, disabled = false }) {
  const sortOptions = [
    { value: "relevant", label: "Recommended" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "duration_asc", label: "Duration: Shortest First" },
  ];

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-bold text-lg mb-4 text-[#0f294d]">Sort By</h3>
      
      <div className="space-y-4 text-sm text-gray-700">
        <details open className="border border-gray-200 rounded-lg p-3">
          <summary className="cursor-pointer font-semibold text-[#0f294d]">Sort Options</summary>
          <div className="mt-3 space-y-2">
            {sortOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="sortType"
                  value={option.value}
                  checked={sortType === option.value}
                  onChange={(e) => setSortType(e.target.value)}
                  disabled={disabled}
                  className="accent-[#0f294d] w-4 h-4"
                />
                {option.label}
              </label>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
