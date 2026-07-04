type MetricProps = {
  label: string;
  value: string;
};

export function Metric({ label, value }: MetricProps) {
  return (
    <div className="min-w-24 border border-stone-300 bg-white px-3 py-2">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="text-lg font-semibold text-stone-950">{value}</p>
    </div>
  );
}
