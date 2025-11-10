import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
type FormFieldProps = {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function FormField({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-slate-50">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        className="rounded-lg focus-visible:ring-emerald-500 bg-slate-800 border-slate-700 text-slate-50"
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
}
export default FormField;
