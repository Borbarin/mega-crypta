import { useState } from 'react';
import { SEARCH_DEBOUNCE_MS } from '../config';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { parseLooseNumber } from '../lib/format';
import { useMarketStore } from '../store/useMarketStore';

export function SearchPanel() {
  const query = useMarketStore((state) => state.filters.query);
  const minPrice = useMarketStore((state) => state.filters.minPrice);
  const maxPrice = useMarketStore((state) => state.filters.maxPrice);
  const setQuery = useMarketStore((state) => state.setQuery);
  const setPriceRange = useMarketStore((state) => state.setPriceRange);
  const resetFilters = useMarketStore((state) => state.resetFilters);

  const [draftQuery, setDraftQuery] = useState(query);
  const [draftMin, setDraftMin] = useState(minPrice);
  const [draftMax, setDraftMax] = useState(maxPrice);

  const commitQuery = useDebouncedCallback(setQuery, SEARCH_DEBOUNCE_MS);
  const commitRange = useDebouncedCallback(
    (min, max) => setPriceRange(min, max),
    SEARCH_DEBOUNCE_MS,
  );

  const min = parseLooseNumber(draftMin);
  const max = parseLooseNumber(draftMax);
  const minInvalid = draftMin.trim() !== '' && min == null;
  const maxInvalid = draftMax.trim() !== '' && max == null;
  const rangeInvalid = min != null && max != null && min > max;

  const reset = () => {
    commitQuery.cancel();
    commitRange.cancel();
    setDraftQuery('');
    setDraftMin('');
    setDraftMax('');
    resetFilters();
  };

  return (
    <form className="card filters" onSubmit={(event) => event.preventDefault()}>
      <label className="field grow">
        <span>Поиск по названию</span>
        <input
          id="coin-search"
          type="search"
          value={draftQuery}
          placeholder="Например, bitcoin"
          maxLength={80}
          autoComplete="off"
          onChange={(event) => {
            const value = event.target.value;
            setDraftQuery(value);
            commitQuery(value);
          }}
        />
      </label>

      <label className="field">
        <span>Цена от, USD</span>
        <input
          id="price-min"
          type="text"
          inputMode="decimal"
          value={draftMin}
          placeholder="0"
          autoComplete="off"
          onChange={(event) => {
            const value = event.target.value;
            setDraftMin(value);
            commitRange(value, draftMax);
          }}
        />
      </label>

      <label className="field">
        <span>Цена до, USD</span>
        <input
          id="price-max"
          type="text"
          inputMode="decimal"
          value={draftMax}
          placeholder="100000"
          autoComplete="off"
          onChange={(event) => {
            const value = event.target.value;
            setDraftMax(value);
            commitRange(draftMin, value);
          }}
        />
      </label>

      <button type="button" className="button ghost" onClick={reset}>
        Сбросить
      </button>

      {minInvalid || maxInvalid ? <p className="hint">Введите число в диапазоне цены.</p> : null}
      {rangeInvalid ? <p className="hint">Минимальная цена больше максимальной.</p> : null}
    </form>
  );
}
