type TextFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

type TextAreaProps = TextFieldProps & {
  compact?: boolean;
};

export function TextField({ label, value, placeholder, onChange }: TextFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-base font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  placeholder,
  onChange,
  compact = false,
}: TextAreaProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full resize-none rounded-md border border-slate-300 bg-white p-3 text-base font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 ${
          compact ? "min-h-20" : "min-h-28"
        }`}
      />
    </label>
  );
}
