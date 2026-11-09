import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { VehicleSearchForm } from "@/components/vehicle-search-form";
import type { Filters } from "@/data/search-options";

function renderSearchForm(onSearch: (filters: Filters) => void) {
  function SearchFormHarness() {
    const [draft, setDraft] = useState<Filters>({});
    return <VehicleSearchForm draft={draft} onDraftChange={setDraft} onSearch={onSearch} />;
  }
  render(<SearchFormHarness />);
}

describe("vehicle search submission", () => {
  it("does not apply text changes until the search form is submitted", () => {
    const onSearch = vi.fn();
    renderSearchForm(onSearch);
    const query = screen.getByRole("textbox", { name: "Marca, modelo o frase" });

    fireEvent.change(query, { target: { value: "Toyota" } });

    expect(onSearch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(onSearch).toHaveBeenCalledWith({ q: "Toyota" });
  });

  it("submits search filters through the form submit event", () => {
    const onSearch = vi.fn();
    renderSearchForm(onSearch);
    const query = screen.getByRole("textbox", { name: "Marca, modelo o frase" });

    fireEvent.change(query, { target: { value: "Hyundai" } });
    fireEvent.submit(query.closest("form")!);

    expect(onSearch).toHaveBeenCalledWith({ q: "Hyundai" });
  });

  it("does not apply dropdown filters until the form is submitted", () => {
    const onSearch = vi.fn();
    renderSearchForm(onSearch);
    const make = screen.getByRole("combobox", { name: "Marca" });

    fireEvent.change(make, { target: { value: "Toyota" } });

    expect(onSearch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(onSearch).toHaveBeenCalledWith({ make: "Toyota" });
  });
});
