interface StatusOption {
  value: string;
  label: string;
}
interface StatusDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: StatusOption[];
}

const StatusDropdown = ({ value, onChange, options }: StatusDropdownProps) => {
  return (
    <select
      className="border px-3 py-1 rounded-md"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  );
};

export default StatusDropdown;
