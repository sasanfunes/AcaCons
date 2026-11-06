"use client";
import { useState } from "react";
import { COUNTRIES, HONDURAS_DEPARTMENTS } from "@/lib/constants";
import { Field, Input, Select } from "@/components/ui/form";

type Props = {
  defaults?: { country?: string | null; department?: string | null; city?: string | null };
  errors?: Record<string, string[] | undefined>;
};

export function LocationFields({ defaults, errors }: Props) {
  const [country, setCountry] = useState(defaults?.country ?? "HN");
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Field label="País" htmlFor="country" error={errors?.country}>
        <Select id="country" name="country" value={country} onChange={(e) => setCountry(e.target.value)} required>
          {Object.entries(COUNTRIES).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={country === "HN" ? "Departamento" : "Departamento / provincia"} htmlFor="department" error={errors?.department}>
        {country === "HN" ? (
          <Select id="department" name="department" defaultValue={defaults?.department ?? ""} key="hn">
            <option value="">Seleccione…</option>
            {HONDURAS_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        ) : (
          <Input id="department" name="department" defaultValue={defaults?.department ?? ""} key="other" />
        )}
      </Field>
      <Field label="Ciudad / municipio" htmlFor="city" error={errors?.city}>
        <Input id="city" name="city" defaultValue={defaults?.city ?? ""} autoComplete="address-level2" />
      </Field>
    </div>
  );
}
