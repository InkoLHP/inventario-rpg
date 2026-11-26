import { useState, type DragEvent } from "react";
import { AnimatePresence, motion, useSpring } from "framer-motion";
import { AlertCircle, CheckCircle2, Crown, Gem, Hand, RotateCcw, Shield, Shirt, Sparkles, Sword } from "lucide-react";
import { InventoryDeck } from "@/features/inventory/InventoryDeck";
import { MagicCursor } from "@/components/ui/magic-cursor";
import { EQUIPMENT_SLOTS, INITIAL_ITEMS } from "@/features/inventory/data";
import type { Feedback, RPGItem, SlotType } from "@/features/inventory/types";

const SPRING = { mass: 0.1, damping: 10, stiffness: 131 };
const SLOT_ICONS = { helmet: Crown, armor: Shirt, weapon: Sword, shield: Shield, amulet: Gem };

export function App() {
  const [equipped, setEquipped] = useState<Partial<Record<SlotType, RPGItem>>>({});
  const [selectedItem, setSelectedItem] = useState<RPGItem | null>(INITIAL_ITEMS[2] ?? null);
  const [feedback, setFeedback] = useState<Feedback>({
    type: "info",
    text: "Arraste uma carta até o encaixe correspondente ou selecione e clique em um espaço vazio.",
  });
  const [wrongSlot, setWrongSlot] = useState<SlotType | null>(null);
  const xSpring = useSpring(0, SPRING);
  const ySpring = useSpring(0, SPRING);
  const opacitySpring = useSpring(0, SPRING);
  const equippedIds = new Set(Object.values(equipped).map((item) => item?.id));
  const bagItems = INITIAL_ITEMS.filter((item) => !equippedIds.has(item.id));
  const stats = Object.values(equipped).reduce(
    (total, item) => ({
      attack: total.attack + (item?.attack ?? 0),
      defense: total.defense + (item?.defense ?? 0),
      magic: total.magic + (item?.magic ?? 0),
    }),
    { attack: 10, defense: 5, magic: 5 },
  );

  const equipItem = (item: RPGItem, target: SlotType) => {
    if (item.slot !== target) {
      setWrongSlot(target);
      window.setTimeout(() => setWrongSlot(null), 500);
      setFeedback({
        type: "error",
        text: `Encaixe inválido! ${item.name} pertence ao espaço ${EQUIPMENT_SLOTS.find((slot) => slot.key === item.slot)?.label}.`,
      });
      return;
    }
    const replaced = equipped[target];
    setEquipped((previous) => ({ ...previous, [target]: item }));
    setSelectedItem(replaced ?? null);
    setFeedback({ type: "success", text: `${item.name} equipado com sucesso!` });
  };

  const unequipSlot = (slot: SlotType) => {
    const item = equipped[slot];
    if (!item) return;
    setEquipped((previous) => {
      const next = { ...previous };
      delete next[slot];
      return next;
    });
    setSelectedItem(item);
    setFeedback({ type: "info", text: `${item.name} voltou para o baú.` });
  };

  const handleDragStart = (event: DragEvent<HTMLElement>, item: RPGItem) => {
    event.dataTransfer.setData("text/plain", item.id);
    event.dataTransfer.effectAllowed = "move";
    setSelectedItem(item);
  };

  const handleDrop = (event: DragEvent, slot: SlotType) => {
    event.preventDefault();
    const item = INITIAL_ITEMS.find((entry) => entry.id === event.dataTransfer.getData("text/plain"));
    if (item) equipItem(item, slot);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#2a1d15_0%,#120d0a_75%)] text-[#e8dcc4] selection:bg-amber-600/40">
      <header className="border-b border-amber-500/20 bg-[#18110c]/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl border border-amber-500/40 bg-amber-950/50 text-amber-400"><Shield className="size-6" /></div>
            <div><h1 className="font-medieval text-2xl font-bold tracking-wider text-amber-300">ARSENAL DA ORDEM</h1><p className="text-sm italic text-stone-400">Equipe relíquias para despertar os atributos do cavaleiro</p></div>
          </div>
          <button onClick={() => { setEquipped({}); setFeedback({ type: "info", text: "Todos os itens voltaram para o baú." }); }} className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-[#261a12] px-4 py-2 font-medieval text-xs tracking-widest text-amber-200 transition hover:border-amber-400"><RotateCcw className="size-4" />DESEQUIPAR TUDO</button>
        </div>
      </header>

      <div className="mx-auto mt-4 max-w-7xl px-6">
        <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${feedback.type === "error" ? "border-red-500/50 bg-red-950/40 text-red-200" : feedback.type === "success" ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-200" : "border-amber-500/25 bg-[#1c140e]/80 text-amber-100"}`}>
          {feedback.type === "error" ? <AlertCircle className="size-5" /> : feedback.type === "success" ? <CheckCircle2 className="size-5" /> : <Sparkles className="size-5 text-amber-400" />}{feedback.text}
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-6 lg:grid-cols-12">
        <section onPointerMove={(event) => { const bounds = event.currentTarget.getBoundingClientRect(); xSpring.set(event.clientX - bounds.left - 80); ySpring.set(event.clientY - bounds.top - 80); }} onPointerEnter={() => opacitySpring.set(0.35)} onPointerLeave={() => opacitySpring.set(0)} className="relative overflow-hidden rounded-3xl border-2 border-amber-500/25 bg-[#1a120d]/95 p-6 shadow-2xl lg:col-span-5">
          <motion.div style={{ x: xSpring, y: ySpring, opacity: opacitySpring }} className="pointer-events-none absolute size-40 rounded-full bg-amber-500/30 blur-3xl" />
          <div className="relative z-10">
            <div className="mb-5 flex items-center justify-between border-b border-amber-500/20 pb-3"><h2 className="font-medieval text-lg font-bold text-amber-300">CAVALEIRO • EQUIPAMENTO</h2><span className="rounded-full border border-amber-500/30 bg-amber-950/60 px-3 py-1 text-xs text-amber-200">{Object.keys(equipped).length} / 5</span></div>
            <div className="mb-5 flex min-h-56 items-center justify-center rounded-2xl border border-amber-500/15 bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,.15),transparent_68%)]">
              <div className="relative h-56 w-40" aria-label="Cavaleiro com seus equipamentos" role="img">
                <img src="/knight-unarmored.svg" alt="" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_0_20px_rgba(217,119,6,.18)]" />
                <AnimatePresence>{EQUIPMENT_SLOTS.filter((slot) => equipped[slot.key]).map((slot) => {
                  const Icon = SLOT_ICONS[slot.icon];
                  const placement = { HELMET: "top-7 left-1/2 -translate-x-1/2", ARMOR: "top-[6.4rem] left-1/2 -translate-x-1/2", WEAPON: "bottom-8 right-0", SHIELD: "bottom-8 left-0", AMULET: "top-[8.4rem] left-1/2 -translate-x-1/2" }[slot.key];
                  return <motion.div key={slot.key} initial={{ opacity: 0, scale: 0.3, y: -22, rotate: -20 }} animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, scale: 0.3, y: 18 }} transition={{ type: "spring", stiffness: 280, damping: 18 }} title={equipped[slot.key]?.name} className={`absolute z-20 grid size-9 place-items-center rounded-xl border border-amber-300/80 bg-[#21140c]/90 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,.35)] ${placement}`}><Icon className="size-5" /></motion.div>;
                })}</AnimatePresence>
              </div>
            </div>
            <div className="space-y-3">{EQUIPMENT_SLOTS.map((slot) => {
              const current = equipped[slot.key];
              const Icon = SLOT_ICONS[slot.icon];
              const isWrong = wrongSlot === slot.key;
              return <motion.div key={slot.key} data-equipment-slot={slot.key} animate={isWrong ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }} transition={{ duration: 0.35 }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, slot.key)} onClick={() => current ? unequipSlot(slot.key) : selectedItem && equipItem(selectedItem, slot.key)} className={`group flex cursor-pointer items-center justify-between rounded-2xl border-2 p-3 transition-colors ${isWrong ? "border-red-500 bg-red-950/40" : current ? "border-amber-400/70 bg-amber-950/40" : "border-dashed border-amber-500/25 bg-[#130d09]/80 hover:border-amber-400/50"}`}>
                <div className="flex items-center gap-3"><div className={`grid size-11 place-items-center rounded-xl border ${current ? "border-amber-400 bg-amber-500/20 text-amber-300" : "border-stone-700 text-stone-500"}`}><Icon className="size-5" /></div><div><p className="font-medieval text-xs tracking-widest text-amber-500/80">{slot.label} ({slot.hint})</p>{current ? <AnimatePresence mode="wait" initial={false}><motion.p key={current.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="font-medieval font-bold text-amber-100">{current.name}</motion.p></AnimatePresence> : <p className="text-sm italic text-stone-500">Arraste ou clique para equipar</p>}</div></div>
                {current ? <span className="text-right font-medieval text-xs text-amber-300">{current.stat}<span className="block font-sans text-stone-400">Clique para remover</span></span> : <span className="text-xs tracking-widest text-stone-600">VAZIO</span>}
              </motion.div>;
            })}</div>
            <div className="mt-5 grid grid-cols-3 rounded-2xl border border-amber-500/20 bg-[#120c08] p-4 text-center">{([["ATAQUE", stats.attack, "text-amber-400"], ["DEFESA", stats.defense, "text-emerald-400"], ["MAGIA", stats.magic, "text-purple-400"]] as const).map(([label, value, color]) => <div key={label}><span className="block font-medieval text-xs text-stone-400">{label}</span><span className={`font-medieval text-2xl font-bold ${color}`}>{value}</span></div>)}</div>
          </div>
        </section>

        <section className="rounded-3xl border-2 border-amber-500/25 bg-[#1a120d]/95 p-6 shadow-2xl lg:col-span-7">
          <div className="mb-2 flex items-center justify-between border-b border-amber-500/20 pb-3"><div><h2 className="font-medieval text-lg font-bold text-amber-300">BAÚ DE RELÍQUIAS</h2><p className="text-sm text-stone-400">Passe o cursor para abrir o leque • Arraste uma carta até o encaixe</p></div>{selectedItem && <span className="hidden rounded-lg border border-amber-400/40 bg-amber-950/60 px-3 py-1 font-medieval text-xs text-amber-200 sm:inline">Na mão: {selectedItem.name}</span>}</div>
          {bagItems.length ? <InventoryDeck items={bagItems} onSelect={setSelectedItem} onDragStart={handleDragStart} onDropOnSlot={(item, slot) => equipItem(item, slot as SlotType)} /> : <div className="flex h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-amber-500/20 text-center"><Sparkles className="mb-2 size-10 text-amber-400" /><p className="font-medieval text-lg text-amber-200">Arsenal totalmente equipado!</p><p className="text-sm text-stone-400">Remova um item do cavaleiro para devolvê-lo ao baú.</p></div>}
          <p className="flex items-center justify-center gap-2 text-center text-sm text-amber-200/70"><Hand className="size-4" /> As cartas acompanham o cursor durante o arraste</p>
        </section>
      </main>
      <MagicCursor />
    </div>
  );
}

export default App;
