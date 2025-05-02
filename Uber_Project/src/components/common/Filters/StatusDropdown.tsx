interface StatusDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
  }
  
  const StatusDropdown = ({ value, onChange, options }: StatusDropdownProps) => {
    return (
      <select
        className="border px-3 py-1 rounded-md"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((status) => (
          <option key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </option>
        ))}
      </select>
    );
  };
  
  export default StatusDropdown;
  