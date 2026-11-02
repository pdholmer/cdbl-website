import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface PickerPlayer {
  id: string;
  initials: string;
  name: string;
}

interface PlayerPickerProps {
  players: PickerPlayer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Opens the add-player sheet. */
  onAdd?: () => void;
}

/** Round player pickers. Display only: selection never changes data. */
export const PlayerPicker = ({ players, selectedId, onSelect, onAdd }: PlayerPickerProps) => (
  <div className="-mx-1 overflow-x-auto pb-1">
    <ul className="flex w-max gap-4 px-1" role="list">
      {players.map((p) => {
        const on = p.id === selectedId;
        return (
          <li key={p.id}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(p.id)}
              className="flex min-h-[44px] w-[72px] flex-col items-center gap-1.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full font-display text-lg font-bold",
                  on
                    ? "is-selected bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "tex-mesh border border-border bg-card text-foreground",
                )}
              >
                {p.initials}
              </span>
              <span className="max-w-full truncate font-label text-sm font-semibold text-foreground">
                {p.name}
              </span>
            </button>
          </li>
        );
      })}
      <li>
        {onAdd ? (
          <button type="button" onClick={onAdd} aria-label="Add a player" className="flex min-h-[44px] w-[72px] flex-col items-center gap-1.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground font-display text-2xl font-bold text-muted-foreground">
            +
          </span>
          <span className="font-label text-sm font-semibold text-muted-foreground">Add</span>
          </button>
        ) : (
          <Link to="/registration" className="flex min-h-[44px] w-[72px] flex-col items-center gap-1.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground font-display text-2xl font-bold text-muted-foreground">
            +
          </span>
          <span className="font-label text-sm font-semibold text-muted-foreground">Add</span>
          </Link>
        )}
      </li>
    </ul>
  </div>
);

export default PlayerPicker;
