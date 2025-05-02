import { FiSearch } from "react-icons/fi";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchField = ({ value, onChange, placeholder = "Search..." }: SearchFieldProps) => {
  return (
    <div className="relative w-64">
      <input
        type="text"
        className="border pr-10 pl-3 py-1 rounded-md w-45 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <span className="absolute inset-y-0 right-18 pr-3 flex items-center text-gray-500 pointer-events-none">
        <FiSearch />
      </span>
    </div>
  );
};

export default SearchField;
