import { ChevronsUpDown, Plus, Store } from "lucide-react";
import { useBrand } from "../../features/domain/BrandProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../../shared/ui/dropdown-menu";

export function BrandSwitcher({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { activeBrand, brands, setActiveBrand } = useBrand();

  return (
    <div className="brand-switcher">
      <DropdownMenu>
        <DropdownMenuTrigger className="brand-switcher-trigger" aria-label="Switch brand">
          <span className="brand-switcher-mark"><Store size={14} /></span>
          <span className="brand-switcher-name">{activeBrand?.name ?? "No brand yet"}</span>
          <ChevronsUpDown size={14} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[240px]">
          <DropdownMenuLabel>Your brands</DropdownMenuLabel>
          {brands.map((brand) => (
            <DropdownMenuItem key={brand.itemId} onSelect={() => { setActiveBrand(brand.itemId); onNavigate("/app"); }}>
              <Store size={16} />
              <span>{brand.name}</span>
              {brand.itemId === activeBrand?.itemId ? <span className="muted">✓</span> : null}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => onNavigate("/app/setup")}>
            <Plus size={16} /> Create another brand
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
