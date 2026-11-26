import { useEffect, useRef, useState, type DragEvent, type PointerEvent } from "react";
import { EffectCards } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards";
import type { RPGItem } from "./types";

interface InventoryDeckProps {
  items: RPGItem[];
  onSelect: (item: RPGItem) => void;
  onDragStart: (event: DragEvent<HTMLElement>, item: RPGItem) => void;
  onDropOnSlot: (item: RPGItem, slot: string) => void;
}

export function InventoryDeck({ items, onSelect, onDragStart, onDropOnSlot }: InventoryDeckProps) {
  const [activeId, setActiveId] = useState(items[0]?.id);
  const [dragging, setDragging] = useState<RPGItem | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ item: RPGItem; startX: number; startY: number; active: boolean } | null>(null);

  useEffect(() => {
    const move = (event: globalThis.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      setPointer({ x: event.clientX, y: event.clientY });
      if (!drag.active && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 7) {
        drag.active = true;
        setDragging(drag.item);
      }
    };
    const finish = (event: globalThis.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      if (drag.active) {
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-equipment-slot]");
        if (target?.dataset.equipmentSlot) onDropOnSlot(drag.item, target.dataset.equipmentSlot);
      }
      dragRef.current = null;
      setDragging(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, [onDropOnSlot]);

  const startPointerDrag = (event: PointerEvent<HTMLElement>, item: RPGItem) => {
    if (event.button !== 0) return;
    dragRef.current = { item, startX: event.clientX, startY: event.clientY, active: false };
  };

  if (!items.length) return null;

  return (
    <div className="flex min-h-[430px] items-center justify-center overflow-hidden py-5">
      <Swiper
        key={items.map((item) => item.id).join("-")}
        effect="cards"
        grabCursor
        modules={[EffectCards]}
        className="h-[390px] w-[min(78vw,270px)]"
        onSlideChange={(swiper) => {
          const item = items[swiper.realIndex];
          if (item) {
            setActiveId(item.id);
            onSelect(item);
          }
        }}
      >
        {items.map((item) => (
          <SwiperSlide key={item.id} className="overflow-hidden rounded-[1.75rem]">
            <article
              draggable
              onPointerDown={(event) => startPointerDrag(event, item)}
              onDragStart={(event) => onDragStart(event, item)}
              onClick={() => {
                setActiveId(item.id);
                onSelect(item);
              }}
              className="relative flex h-full cursor-grab flex-col border-2 border-amber-700/60 bg-[#f4e4bc] p-4 text-[#24170e] shadow-2xl active:cursor-grabbing"
              style={{ borderColor: item.accent }}
            >
              <div className="relative grid min-h-0 flex-1 place-items-center overflow-hidden rounded-2xl border border-amber-950/20 bg-[radial-gradient(ellipse_at_center,#fff5d7_0%,#c8aa78_100%)]">
                <div className="absolute inset-3 rounded-xl border border-amber-950/20" />
                <span className="absolute left-3 top-3 rounded-full bg-[#21140c]/90 px-3 py-1 font-medieval text-[9px] tracking-[0.18em] text-amber-200">
                  {item.role}
                </span>
                <span className="font-medieval text-7xl font-black" style={{ color: item.accent }}>
                  {item.initials}
                </span>
                <span className="absolute bottom-3 right-3 rounded-full border border-amber-900/30 bg-[#f4e4bc]/90 px-3 py-1 font-medieval text-xs font-bold text-amber-950">
                  {item.stat}
                </span>
              </div>
              <div className="pt-4">
                <p className="font-medieval text-[10px] font-bold uppercase tracking-[0.18em] text-amber-900/60">Relíquia da Ordem</p>
                <h3 className="mt-1 font-medieval text-xl font-bold leading-tight">{item.name}</h3>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-snug text-[#4c3928]">{item.description}</p>
                <div className="mt-3 flex items-center justify-between border-t border-amber-900/20 pt-2 text-[10px] font-bold uppercase tracking-wider text-amber-950/60">
                  <span>{activeId === item.id ? "Carta selecionada" : "Relíquia"}</span>
                  <span>Arraste para equipar</span>
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
      {dragging && <div className="pointer-events-none fixed z-[100000] w-48 -translate-y-1/2 rounded-xl border-2 border-amber-300 bg-[#f4e4bc] p-3 text-[#24170e] shadow-[0_18px_50px_rgba(0,0,0,.65)]" style={{ left: pointer.x + 16, top: pointer.y + 8, transform: "rotate(-5deg) scale(1.04)" }}>
        <div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-lg bg-amber-900/10 font-medieval font-black" style={{ color: dragging.accent }}>{dragging.initials}</span><span className="font-medieval text-xs font-bold">{dragging.name}</span></div>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-amber-900/70">Solte no encaixe</p>
      </div>}
    </div>
  );
}
