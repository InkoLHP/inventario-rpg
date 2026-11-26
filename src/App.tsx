import React, { useState } from "react";
import { motion, useSpring } from "framer-motion";
import {
  Shield,
  Sword,
  Crown,
  Shirt,
  Gem,
  Sparkles,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  ScrollText,
} from "lucide-react";
import { OrbitCardStack, type OrbitStackItem } from "@/components/ui/orbit-card-stack";
import { Carousel_002 } from "@/components/ui/skiper-ui/skiper48";

// Mesma física de mola do Skiper61 para a aura mágica do cursor
const SPRING = {
  mass: 0.1,
  damping: 10,
  stiffness: 131,
};

type SlotType = "HELMET" | "ARMOR" | "WEAPON" | "SHIELD" | "AMULET";

interface RPGItem extends OrbitStackItem {
  id: string;
  slot: SlotType;
  attack: number;
  defense: number;
  magic: number;
}

const INITIAL_ITEMS: RPGItem[] = [
  {
    id: "elmo-corvo",
    name: "Elmo do Corvo",
    role: "CABEÇA • ELMO PESADO",
    description: "Forjado em ferro negro nas montanhas de cinzas. Protege contra golpes críticos.",
    accent: "#94a3b8",
    initials: "EL",
    stat: "+14 DEFESA",
    slot: "HELMET",
    attack: 0,
    defense: 14,
    magic: 2,
  },
  {
    id: "lamina-solar",
    name: "Lâmina Solar",
    role: "MÃO PRINCIPAL • ESPADA",
    description: "Aço templário banhado em ouro velho que arde contra criaturas das trevas.",
    accent: "#f59e0b",
    initials: "ES",
    stat: "+26 ATAQUE",
    slot: "WEAPON",
    attack: 26,
    defense: 2,
    magic: 6,
  },
  {
    id: "cota-draconica",
    name: "Couraça de Sangue",
    role: "TORSO • ARMADURA",
    description: "Placas sobrepostas de couro de wyvern e bronze antigo. Resistência lendária.",
    accent: "#b91c1c",
    initials: "AR",
    stat: "+32 DEFESA",
    slot: "ARMOR",
    attack: 0,
    defense: 32,
    magic: 4,
  },
  {
    id: "egide-carvalho",
    name: "Égide de Carvalho",
    role: "MÃO SECUNDÁRIA • ESCUDO",
    description: "Escudo rúnico capaz de dissipar maldições e aparar investidas brutais.",
    accent: "#10b981",
    initials: "EC",
    stat: "+18 DEF / +8 MAG",
    slot: "SHIELD",
    attack: 2,
    defense: 18,
    magic: 8,
  },
  {
    id: "coracao-rubi",
    name: "Amuleto Carmesim",
    role: "ACESSÓRIO • AMULETO",
    description: "Pulsa com o calor de uma forja ancestral, amplificando o poder arcano.",
    accent: "#e11d48",
    initials: "AM",
    stat: "+20 MAGIA",
    slot: "AMULET",
    attack: 5,
    defense: 3,
    magic: 20,
  },
];

// Cartas para o componente Skiper48 (Grimório de Relíquias)
const GRIMOIRE_CARDS = [
  {
    src: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
    alt: "Tomo das Cinzas",
  },
  {
    src: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80",
    alt: "Pergaminho Rúnico",
  },
  {
    src: "https://images.unsplash.com/photo-1615672968435-75b78769f282?w=600&q=80",
    alt: "Relíquia de Ouro",
  },
  {
    src: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80",
    alt: "Cálice Antigo",
  },
];

const SLOT_CONFIG: {
  key: SlotType;
  label: string;
  hint: string;
  icon: React.ReactNode;
}[] = [
  { key: "HELMET", label: "Elmo", hint: "Cabeça", icon: <Crown className="size-5" /> },
  { key: "ARMOR", label: "Armadura", hint: "Torso", icon: <Shirt className="size-5" /> },
  { key: "WEAPON", label: "Mão Principal", hint: "Espada", icon: <Sword className="size-5" /> },
  { key: "SHIELD", label: "Mão Secundária", hint: "Escudo", icon: <Shield className="size-5" /> },
  { key: "AMULET", label: "Relíquia", hint: "Amuleto", icon: <Gem className="size-5" /> },
];

export function App() {
  const [equipped, setEquipped] = useState<Partial<Record<SlotType, RPGItem>>>({});
  const [selectedItem, setSelectedItem] = useState<RPGItem | null>(INITIAL_ITEMS[2]);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    text: string;
  }>({
    type: "info",
    text: "Arraste uma carta do leque até o slot correspondente ou clique para selecionar.",
  });
  const [wrongSlot, setWrongSlot] = useState<SlotType | null>(null);

  // Aura mágica do cursor baseada no Skiper61 (SpringMouseFollow)
  const xSpring = useSpring(0, SPRING);
  const ySpring = useSpring(0, SPRING);
  const opacitySpring = useSpring(0, SPRING);

  const equippedIds = new Set(Object.values(equipped).map((i) => i?.id));
  const bagItems = INITIAL_ITEMS.filter((item) => !equippedIds.has(item.id));

  // Soma total dos atributos equipados
  const stats = Object.values(equipped).reduce(
    (acc, item) => ({
      attack: acc.attack + (item?.attack ?? 0),
      defense: acc.defense + (item?.defense ?? 0),
      magic: acc.magic + (item?.magic ?? 0),
    }),
    { attack: 10, defense: 5, magic: 5 }
  );

  const tryEquipItem = (item: RPGItem, targetSlot: SlotType) => {
    if (item.slot !== targetSlot) {
      setWrongSlot(targetSlot);
      setTimeout(() => setWrongSlot(null), 500);
      setFeedback({
        type: "error",
        text: `Encaixe inválido! "${item.name}" pertence ao slot de ${
          SLOT_CONFIG.find((s) => s.key === item.slot)?.label
        }.`,
      });
      return;
    }

    setEquipped((prev) => ({ ...prev, [targetSlot]: item }));
    if (selectedItem?.id === item.id) setSelectedItem(null);
    setFeedback({
      type: "success",
      text: `${item.name} equipado com sucesso!`,
    });
  };

  const unequipSlot = (slot: SlotType) => {
    const item = equipped[slot];
    if (!item) return;
    setEquipped((prev) => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });
    setFeedback({
      type: "info",
      text: `${item.name} retornou ao baú.`,
    });
  };

  const handleDragStart = (e: React.DragEvent, item: OrbitStackItem) => {
    const rpgItem = INITIAL_ITEMS.find((i) => i.name === item.name);
    if (!rpgItem) return;
    e.dataTransfer.setData("text/plain", rpgItem.id);
    setSelectedItem(rpgItem);
  };

  const handleDropOnSlot = (e: React.DragEvent, targetSlot: SlotType) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    const item = INITIAL_ITEMS.find((i) => i.id === itemId);
    if (item) {
      tryEquipItem(item, targetSlot);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#2a1d15_0%,#120d0a_75%)] text-[#e8dcc4] selection:bg-amber-600/40">
      {/* Cabeçalho Medieval */}
      <header className="border-b border-amber-500/20 bg-[#18110c]/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl border border-amber-500/40 bg-amber-950/50 text-amber-400 shadow-inner">
              <Shield className="size-6" />
            </div>
            <div>
              <h1 className="font-medieval text-2xl font-bold tracking-wider text-amber-300">
                ARSENAL DA ORDEM
              </h1>
              <p className="text-sm italic text-stone-400">
                Equipe as relíquias nos engastes corretos para despertar seus atributos
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEquipped({});
              setFeedback({ type: "info", text: "Todos os itens foram guardados no baú." });
            }}
            className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-[#261a12] px-4 py-2 font-medieval text-xs tracking-widest text-amber-200 transition hover:border-amber-400 hover:bg-amber-950/60"
          >
            <RotateCcw className="size-4" />
            DESEQUIPAR TUDO
          </button>
        </div>
      </header>

      {/* Barra de Feedback / Mensagens do Mestre */}
      <div className="mx-auto mt-4 max-w-7xl px-6">
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-base transition-colors ${
            feedback.type === "error"
              ? "border-red-500/50 bg-red-950/40 text-red-200"
              : feedback.type === "success"
                ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-200"
                : "border-amber-500/25 bg-[#1c140e]/80 text-amber-100/90"
          }`}
        >
          {feedback.type === "error" ? (
            <AlertCircle className="size-5 shrink-0 text-red-400" />
          ) : feedback.type === "success" ? (
            <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
          ) : (
            <Sparkles className="size-5 shrink-0 text-amber-400" />
          )}
          <span>{feedback.text}</span>
        </div>
      </div>

      {/* Layout Principal */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-6 lg:grid-cols-12">
        {/* COLUNA ESQUERDA: Boneco & Slots de Equipamento (com aura física do Skiper61) */}
        <section
          onPointerMove={(e) => {
            const bounds = e.currentTarget.getBoundingClientRect();
            xSpring.set(e.clientX - bounds.left - 80);
            ySpring.set(e.clientY - bounds.top - 80);
          }}
          onPointerEnter={() => opacitySpring.set(0.35)}
          onPointerLeave={() => opacitySpring.set(0)}
          className="relative overflow-hidden rounded-3xl border-2 border-amber-500/25 bg-[#1a120d]/95 p-6 shadow-2xl lg:col-span-5"
        >
          {/* Brilho mágico seguindo o cursor (Skiper61 Spring) */}
          <motion.div
            style={{ x: xSpring, y: ySpring, opacity: opacitySpring }}
            className="pointer-events-none absolute size-40 rounded-full bg-amber-500/30 blur-3xl"
          />

          <div className="relative z-10">
            <div className="mb-5 flex items-center justify-between border-b border-amber-500/20 pb-3">
              <h2 className="font-medieval text-lg font-bold tracking-wider text-amber-300">
                CAVALEIRO • ENGASTES
              </h2>
              <span className="rounded-full border border-amber-500/30 bg-amber-950/60 px-3 py-0.5 text-xs text-amber-200">
                {Object.keys(equipped).length} / 5 Equipados
              </span>
            </div>

            {/* Grade de Slots */}
            <div className="space-y-3">
              {SLOT_CONFIG.map((slot) => {
                const current = equipped[slot.key];
                const isWrong = wrongSlot === slot.key;

                return (
                  <motion.div
                    key={slot.key}
                    animate={isWrong ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
                    transition={{ duration: 0.35 }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDropOnSlot(e, slot.key)}
                    onClick={() => {
                      if (current) {
                        unequipSlot(slot.key);
                      } else if (selectedItem) {
                        tryEquipItem(selectedItem, slot.key);
                      }
                    }}
                    className={`group relative flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all ${
                      isWrong
                        ? "border-red-500 bg-red-950/40"
                        : current
                          ? "border-amber-400/70 bg-gradient-to-r from-amber-950/60 to-[#241810] shadow-lg shadow-amber-950/30"
                          : "border-dashed border-amber-500/25 bg-[#130d09]/80 hover:border-amber-400/50 hover:bg-[#1f1610]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`grid size-12 place-items-center rounded-xl border ${
                          current
                            ? "border-amber-400 bg-amber-500/20 text-amber-300"
                            : "border-stone-700 bg-stone-900/80 text-stone-500 group-hover:text-amber-400"
                        }`}
                      >
                        {slot.icon}
                      </div>

                      <div>
                        <p className="font-medieval text-xs uppercase tracking-widest text-amber-500/80">
                          {slot.label} ({slot.hint})
                        </p>
                        {current ? (
                          <h3 className="font-medieval text-lg font-bold text-amber-100">
                            {current.name}
                          </h3>
                        ) : (
                          <p className="text-sm italic text-stone-500">
                            Arraste ou clique para equipar...
                          </p>
                        )}
                      </div>
                    </div>

                    {current ? (
                      <div className="text-right">
                        <span className="block font-medieval text-xs font-bold text-amber-300">
                          {current.stat}
                        </span>
                        <span className="text-xs text-stone-400 group-hover:text-red-300">
                          Clique p/ remover
                        </span>
                      </div>
                    ) : (
                      <span className="rounded border border-stone-800 px-2 py-1 font-medieval text-[10px] tracking-widest text-stone-600">
                        VAZIO
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Painel de Atributos Calculados */}
            <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-amber-500/20 bg-[#120c08] p-4 text-center">
              <div>
                <span className="block font-medieval text-xs text-stone-400">ATAQUE</span>
                <span className="font-medieval text-2xl font-bold text-amber-400">
                  {stats.attack}
                </span>
              </div>
              <div className="border-x border-amber-500/15">
                <span className="block font-medieval text-xs text-stone-400">DEFESA</span>
                <span className="font-medieval text-2xl font-bold text-emerald-400">
                  {stats.defense}
                </span>
              </div>
              <div>
                <span className="block font-medieval text-xs text-stone-400">MAGIA</span>
                <span className="font-medieval text-2xl font-bold text-purple-400">
                  {stats.magic}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* COLUNA DIREITA: Baú em Leque (OrbitCardStack) + Grimório (Skiper48) */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* Baú de Relíquias (OrbitCardStack) */}
          <section className="rounded-3xl border-2 border-amber-500/25 bg-[#1a120d]/95 p-6 shadow-2xl">
            <div className="mb-2 flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div>
                <h2 className="font-medieval text-lg font-bold tracking-wider text-amber-300">
                  BAÚ DE RELÍQUIAS
                </h2>
                <p className="text-sm text-stone-400">
                  Passe o cursor para abrir o leque • Arraste a carta para o slot à esquerda
                </p>
              </div>
              {selectedItem && (
                <span className="rounded-lg border border-amber-400/40 bg-amber-950/60 px-3 py-1 font-medieval text-xs text-amber-200">
                  Selecionado: {selectedItem.name}
                </span>
              )}
            </div>

            {bagItems.length > 0 ? (
              <OrbitCardStack
                items={bagItems}
                spread={115}
                lift={26}
                defaultActiveIndex={Math.floor(bagItems.length / 2)}
                className="min-h-[430px] p-2"
                cardClassName="w-[16.5rem] border-2 border-amber-600/50 bg-[#f4e4bc] text-[#24170e] shadow-2xl"
                onActiveChange={(item) => {
                  const found = INITIAL_ITEMS.find((i) => i.name === item.name);
                  if (found) setSelectedItem(found);
                }}
                onCardDragStart={handleDragStart}
              />
            ) : (
              <div className="flex h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-amber-500/20 text-center">
                <Sparkles className="mb-2 size-10 text-amber-400" />
                <p className="font-medieval text-lg text-amber-200">
                  Arsenal Totalmente Equipado!
                </p>
                <p className="text-sm text-stone-400">
                  Clique em qualquer slot à esquerda para devolver um item ao baú.
                </p>
              </div>
            )}
          </section>

          {/* Grimório de Tomos & Cartas (Skiper48 Carousel_002) */}
          <section className="grid grid-cols-1 items-center gap-6 rounded-3xl border-2 border-amber-500/25 bg-[#1a120d]/95 p-6 shadow-2xl md:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center gap-2 text-amber-400">
                <ScrollText className="size-5" />
                <span className="font-medieval text-xs tracking-widest uppercase">
                  Grimório Antigo
                </span>
              </div>
              <h3 className="font-medieval text-xl font-bold text-amber-200">
                Cartas de Lore & Mapas
              </h3>
              <p className="mt-2 text-base leading-relaxed text-stone-300">
                Deslize o baralho ao lado para consultar os manuscritos da campanha e as
                ilustrações das relíquias guardadas pela Ordem.
              </p>
            </div>

            <div className="flex justify-center">
              <Carousel_002
                images={GRIMOIRE_CARDS}
                loop
                className="max-w-[260px]"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;