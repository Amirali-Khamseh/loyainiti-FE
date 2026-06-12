/**
 * IconPicker - visual Lucide icon chooser for non-technical admins.
 *
 * Renders a button showing the currently-selected icon (or a placeholder).
 * Clicking opens a popover with a searchable grid of curated, business-
 * relevant icons. Selecting one stores its kebab-case Lucide name (the
 * same string the BE persists and the apps resolve).
 *
 * We deliberately curate (~60 icons) rather than expose all ~1500 Lucide
 * icons: it keeps the grid scannable and every option is relevant to a
 * shop category. The stored value is still a normal Lucide name, so a
 * power user can set anything via the API if they ever need to.
 */
import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  // food & drink
  UtensilsCrossed, Coffee, CupSoda, Beer, Wine, IceCreamCone, Croissant, Pizza, Sandwich, Cake,
  // grocery
  ShoppingCart, ShoppingBasket, Apple, Carrot, Beef, Fish, Milk,
  // beauty & wellness
  Scissors, Sparkles, Heart, Flower2, Bath,
  // fitness
  Dumbbell, Bike, PersonStanding, Activity,
  // retail
  ShoppingBag, Shirt, Footprints, Gem, Book, BookOpen, Pencil, Gift, Gamepad2, Smartphone, Laptop, Wrench, Glasses,
  // pets
  PawPrint, Dog, Cat, Bird,
  // auto & transport
  Car, Fuel, Bus,
  // services
  Briefcase, Hammer, Paintbrush, Camera, Shirt as ShirtAlt, Key, Stamp,
  // hospitality
  BedDouble, Hotel, Building2, Building,
  // arts & culture
  Palette, Music, Film, Theater, Mic,
  // generic / fallback
  Store, Tag, MapPin, Star, Search, X,
  type LucideIcon,
} from 'lucide-react';

/** name -> component. The name (kebab) is what we persist. */
const ICONS: { name: string; Comp: LucideIcon; keywords: string }[] = [
  { name: 'utensils-crossed', Comp: UtensilsCrossed, keywords: 'food restaurant eat dining' },
  { name: 'coffee', Comp: Coffee, keywords: 'cafe coffee tea hot drink' },
  { name: 'cup-soda', Comp: CupSoda, keywords: 'juice soda cold drink' },
  { name: 'beer', Comp: Beer, keywords: 'bar pub alcohol' },
  { name: 'wine', Comp: Wine, keywords: 'wine bar alcohol' },
  { name: 'ice-cream-cone', Comp: IceCreamCone, keywords: 'ice cream gelato dessert' },
  { name: 'croissant', Comp: Croissant, keywords: 'bakery pastry bread' },
  { name: 'pizza', Comp: Pizza, keywords: 'pizza fast food italian' },
  { name: 'sandwich', Comp: Sandwich, keywords: 'deli sandwich lunch' },
  { name: 'cake', Comp: Cake, keywords: 'cake bakery dessert sweet' },

  { name: 'shopping-cart', Comp: ShoppingCart, keywords: 'grocery supermarket store' },
  { name: 'shopping-basket', Comp: ShoppingBasket, keywords: 'grocery basket convenience' },
  { name: 'apple', Comp: Apple, keywords: 'fruit greengrocer produce' },
  { name: 'carrot', Comp: Carrot, keywords: 'vegetable greengrocer produce' },
  { name: 'beef', Comp: Beef, keywords: 'butcher meat' },
  { name: 'fish', Comp: Fish, keywords: 'fishmonger seafood' },
  { name: 'milk', Comp: Milk, keywords: 'dairy grocery' },

  { name: 'scissors', Comp: Scissors, keywords: 'barber hair salon cut' },
  { name: 'sparkles', Comp: Sparkles, keywords: 'beauty spa nails clean' },
  { name: 'heart', Comp: Heart, keywords: 'wellness health care' },
  { name: 'flower-2', Comp: Flower2, keywords: 'spa florist beauty' },
  { name: 'bath', Comp: Bath, keywords: 'spa bath wellness' },

  { name: 'dumbbell', Comp: Dumbbell, keywords: 'gym fitness weights' },
  { name: 'bike', Comp: Bike, keywords: 'cycling spin fitness' },
  { name: 'person-standing', Comp: PersonStanding, keywords: 'yoga studio fitness' },
  { name: 'activity', Comp: Activity, keywords: 'fitness health pulse' },

  { name: 'shopping-bag', Comp: ShoppingBag, keywords: 'retail shop store' },
  { name: 'shirt', Comp: Shirt, keywords: 'clothing fashion apparel' },
  { name: 'footprints', Comp: Footprints, keywords: 'shoes footwear' },
  { name: 'gem', Comp: Gem, keywords: 'jewelry jewellery' },
  { name: 'book', Comp: Book, keywords: 'bookstore books' },
  { name: 'book-open', Comp: BookOpen, keywords: 'bookstore reading library' },
  { name: 'pencil', Comp: Pencil, keywords: 'stationery office' },
  { name: 'gift', Comp: Gift, keywords: 'gift shop present' },
  { name: 'gamepad-2', Comp: Gamepad2, keywords: 'toy games' },
  { name: 'smartphone', Comp: Smartphone, keywords: 'mobile phone accessories' },
  { name: 'laptop', Comp: Laptop, keywords: 'electronics computer' },
  { name: 'wrench', Comp: Wrench, keywords: 'hardware tools repair' },
  { name: 'glasses', Comp: Glasses, keywords: 'optician eyewear' },

  { name: 'paw-print', Comp: PawPrint, keywords: 'pets pet shop grooming' },
  { name: 'dog', Comp: Dog, keywords: 'pets dog' },
  { name: 'cat', Comp: Cat, keywords: 'pets cat' },
  { name: 'bird', Comp: Bird, keywords: 'pets bird' },

  { name: 'car', Comp: Car, keywords: 'auto car wash repair' },
  { name: 'fuel', Comp: Fuel, keywords: 'petrol gas fuel station' },
  { name: 'bus', Comp: Bus, keywords: 'transport bus' },

  { name: 'briefcase', Comp: Briefcase, keywords: 'services business office' },
  { name: 'hammer', Comp: Hammer, keywords: 'services repair handyman' },
  { name: 'paintbrush', Comp: Paintbrush, keywords: 'services painting decorating' },
  { name: 'camera', Comp: Camera, keywords: 'photography studio' },
  { name: 'key', Comp: Key, keywords: 'locksmith services' },
  { name: 'stamp', Comp: Stamp, keywords: 'laundry dry cleaning services' },

  { name: 'bed-double', Comp: BedDouble, keywords: 'hotel hospitality room' },
  { name: 'hotel', Comp: Hotel, keywords: 'hotel hospitality' },
  { name: 'building-2', Comp: Building2, keywords: 'office co-working building' },
  { name: 'building', Comp: Building, keywords: 'building venue' },

  { name: 'palette', Comp: Palette, keywords: 'art gallery culture' },
  { name: 'music', Comp: Music, keywords: 'music venue' },
  { name: 'film', Comp: Film, keywords: 'cinema film' },
  { name: 'theater', Comp: Theater, keywords: 'theatre performing arts' },
  { name: 'mic', Comp: Mic, keywords: 'music venue karaoke' },

  { name: 'store', Comp: Store, keywords: 'shop store generic' },
  { name: 'tag', Comp: Tag, keywords: 'generic category tag' },
  { name: 'map-pin', Comp: MapPin, keywords: 'location place' },
  { name: 'star', Comp: Star, keywords: 'featured generic' },
];

const BY_NAME = new Map(ICONS.map((i) => [i.name, i.Comp]));

/** Resolve a stored name (kebab) to a component, falling back to Tag. */
export function iconByName(name: string | null | undefined): LucideIcon {
  if (!name) return Tag;
  return BY_NAME.get(name) ?? Tag;
}

export function IconPicker({
  value,
  onChange,
  disabled,
}: {
  value: string | null;
  onChange: (name: string | null) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  const Selected = iconByName(value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICONS;
    return ICONS.filter((i) => i.name.includes(q) || i.keywords.includes(q));
  }, [query]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          borderRadius: 10,
          border: `1px solid ${value ? 'var(--action)' : 'var(--border-default)'}`,
          background: value ? 'var(--action-subtle-bg)' : 'var(--bg-card)',
          color: value ? 'var(--action)' : 'var(--fg-3)',
          cursor: disabled ? 'default' : 'pointer',
        }}
        aria-label="Choose icon"
        title={value ?? 'Choose icon'}
      >
        <Selected size={20} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 50,
            left: 0,
            zIndex: 50,
            width: 280,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 10,
            boxShadow: 'var(--shadow-3)',
            padding: 10,
          }}
        >
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <Search
              size={14}
              color="var(--fg-3)"
              style={{ position: 'absolute', left: 10, top: 10 }}
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons…"
              style={{
                width: '100%',
                padding: '8px 10px 8px 30px',
                borderRadius: 10,
                border: '1px solid var(--border-default)',
                background: 'var(--bg-canvas)',
                color: 'var(--fg-1)',
                font: 'var(--t-body-sm)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 4,
              maxHeight: 220,
              overflowY: 'auto',
            }}
          >
            {value && (
              <button
                type="button"
                onClick={() => { onChange(null); setOpen(false); }}
                title="No icon"
                style={iconCellStyle(false)}
              >
                <X size={16} color="var(--fg-3)" />
              </button>
            )}
            {filtered.map(({ name, Comp }) => {
              const active = name === value;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => { onChange(name); setOpen(false); }}
                  title={name}
                  style={iconCellStyle(active)}
                >
                  <Comp size={18} color={active ? 'var(--action)' : 'var(--fg-1)'} />
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p
                className="caption"
                style={{ color: 'var(--fg-3)', gridColumn: '1 / -1', padding: 8 }}
              >
                No icons match “{query}”.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function iconCellStyle(active: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    background: active ? 'var(--action-subtle-bg)' : 'transparent',
  };
}
