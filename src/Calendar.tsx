import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

const SHEET_ID = "1YGSZ7rJkSkhyb0OFkMVxRht-4L6tXlgDN3vRELJuzIo";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
const BOARDS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=quadros`;

const MONTHS = [
  { month: 8,  name: "Agosto",   year: 2026 },
  { month: 9,  name: "Setembro", year: 2026 },
  { month: 10, name: "Outubro",  year: 2026 },
  { month: 11, name: "Novembro", year: 2026 },
  { month: 12, name: "Dezembro", year: 2026 },
];

const MONTH_NAMES: Record<number, string> = {
  8: "Agosto", 9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro",
};

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const PRESET_COLORS = [
  { label: "White",  value: "#ffffff" },
  { label: "Red",    value: "#fecaca" },
  { label: "Orange", value: "#fed7aa" },
  { label: "Yellow", value: "#fef08a" },
  { label: "Green",  value: "#bbf7d0" },
  { label: "Blue",   value: "#bfdbfe" },
  { label: "Purple", value: "#e9d5ff" },
  { label: "Pink",   value: "#fbcfe8" },
  { label: "Teal",   value: "#99f6e4" },
  { label: "Gray",   value: "#e5e7eb" },
];

const PROFESSORS = [
  { name: "Marcia",             email: "marma.jual@gmail.com" },
  { name: "Kacielly",          email: "kaciellylima@gmail.com" },
  { name: "Rodrigo Geografia",  email: "RodrigoGeo2014@gmail.com" },
  { name: "Rodrigo Literatura", email: "rodmartins1922@gmail.com" },
  { name: "Christian",         email: "christian.gomes.1993@gmail.com" },
  { name: "Tatiana",           email: "tatiana.besada@gmail.com" },
  { name: "Limarcos",          email: "limarcos.ferreira@gmail.com" },
  { name: "Diego",             email: "bottinodiego@gmail.com" },
  { name: "Ronaldo",             email: "ronaldofg1@gmail.com" },
  { name: "Thiago",             email: "thiagovs2@gmail.com" },
  { name: "Email da Escola",              email: "contato.ceam@gmail.com" },
];

const OWNER_PASSWORD = "jose";

// ─── Themes ───────────────────────────────────────────────────────────────────

const THEMES = [
  {
    name: "azul",
    icon: "🔄",
    from:   "#6366f1",
    to:     "#a855f7",
    tab:    "from-indigo-500 to-purple-500",
    header: "from-indigo-500 to-purple-600",
    emailHeader: "from-blue-500 to-indigo-600",
    dot:    "from-indigo-400 to-purple-400",
    badge:  "from-blue-500 to-indigo-500",
    text:   "from-indigo-600 to-purple-600",
    ring:   "ring-indigo-400",
    bg:     "linear-gradient(135deg,#f0f4ff 0%,#faf5ff 50%,#f0f9ff 100%)",
    dark:   false,
  },
  {
    name: "vermelho",
    icon: "🔄",
    from:   "#ef4444",
    to:     "#f97316",
    tab:    "from-red-500 to-orange-500",
    header: "from-red-500 to-orange-600",
    emailHeader: "from-red-500 to-orange-500",
    dot:    "from-red-400 to-orange-400",
    badge:  "from-red-500 to-orange-500",
    text:   "from-red-600 to-orange-600",
    ring:   "ring-red-400",
    bg:     "linear-gradient(135deg,#fff1f2 0%,#fff7ed 50%,#fef9f0 100%)",
    dark:   false,
  },
  {
    name: "amarelo",
    icon: "🔄",
    from:   "#eab308",
    to:     "#84cc16",
    tab:    "from-yellow-500 to-lime-500",
    header: "from-yellow-500 to-lime-500",
    emailHeader: "from-yellow-500 to-lime-500",
    dot:    "from-yellow-400 to-lime-400",
    badge:  "from-yellow-500 to-lime-500",
    text:   "from-yellow-600 to-lime-600",
    ring:   "ring-yellow-400",
    bg:     "linear-gradient(135deg,#fefce8 0%,#f7fee7 50%,#fefce8 100%)",
    dark:   false,
  },
  {
    name: "roxo",
    icon: "🔄",
    from:   "#8b5cf6",
    to:     "#ec4899",
    tab:    "from-violet-500 to-pink-500",
    header: "from-violet-500 to-pink-600",
    emailHeader: "from-violet-500 to-pink-500",
    dot:    "from-violet-400 to-pink-400",
    badge:  "from-violet-500 to-pink-500",
    text:   "from-violet-600 to-pink-600",
    ring:   "ring-violet-400",
    bg:     "linear-gradient(135deg,#f5f3ff 0%,#fdf4ff 50%,#fdf2f8 100%)",
    dark:   false,
  },
  {
    name: "preto",
    icon: "🔄",
    from:   "#1f2937",
    to:     "#374151",
    tab:    "from-gray-700 to-gray-900",
    header: "from-gray-800 to-gray-900",
    emailHeader: "from-gray-700 to-gray-900",
    dot:    "from-gray-500 to-gray-700",
    badge:  "from-gray-700 to-gray-900",
    text:   "from-gray-700 to-gray-900",
    ring:   "ring-gray-500",
    bg:     "linear-gradient(135deg,#f9fafb 0%,#f3f4f6 50%,#f1f5f9 100%)",
    dark:   false,
  },
  {
    name: "dark",
    icon: "🔄",
    from:   "#818cf8",
    to:     "#e879f9",
    tab:    "from-violet-600 to-fuchsia-600",
    header: "from-violet-700 to-fuchsia-800",
    emailHeader: "from-violet-700 to-fuchsia-800",
    dot:    "from-violet-400 to-fuchsia-400",
    badge:  "from-violet-600 to-fuchsia-600",
    text:   "from-violet-400 to-fuchsia-400",
    ring:   "ring-violet-400",
    bg:     "linear-gradient(135deg,#0b0f19 0%,#0f1120 50%,#0a0e17 100%)",
    dark:   true,
  },
];

type Theme = typeof THEMES[0];



// ─── Types ────────────────────────────────────────────────────────────────────

type Assignment = { id: string; title: string; description: string };
type DayKey = string; // "year-month-day"
type SheetData = Record<DayKey, Assignment[]>;
type ColorData = Record<DayKey, string>;

function dayKey(year: number, month: number, day: number) {
  return `${year}-${month}-${day}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

// ─── Board Photo type ────────────────────────────────────────────────────────

type BoardPhoto = { year: number; month: number; link: string; descricao: string };

function parseBoardsCSV(csv: string): BoardPhoto[] {
  const lines = csv.trim().split("\n");
  const photos: BoardPhoto[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cols: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === "," && !inQuote) { cols.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    cols.push(cur.trim());
    const year  = parseInt(cols[0]);
    const month = parseInt(cols[1]);
    const link  = (cols[2] ?? "").replace(/^"|"$/g, "").trim();
    const descricao = (cols[3] ?? "").replace(/^"|"$/g, "").trim();
    if (!year || !month || !link) continue;
    photos.push({ year, month, link, descricao });
  }
  return photos;
}

// ─── Color name → hex ────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  vermelho: "#fecaca",
  laranja:  "#fed7aa",
  amarelo:  "#fef08a",
  verde:    "#bbf7d0",
  azul:     "#bfdbfe",
  roxo:     "#e9d5ff",
  rosa:     "#fbcfe8",
  turquesa: "#99f6e4",
  cinza:    "#e5e7eb",
};

function resolveColor(raw: string): string | undefined {
  const key = raw.toLowerCase().trim();
  return COLOR_MAP[key] ?? (raw.startsWith("#") ? raw : undefined);
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

function parseCSV(csv: string): { sheetData: SheetData; sheetColors: ColorData } {
  const lines = csv.trim().split("\n");
  const sheetData: SheetData = {};
  const sheetColors: ColorData = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cols: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === "," && !inQuote) { cols.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    cols.push(cur.trim());

    const year  = parseInt(cols[0]);
    const month = parseInt(cols[1]);
    const day   = parseInt(cols[2]);
    const title       = (cols[3] ?? "").replace(/^"|"$/g, "").trim();
    const description = (cols[4] ?? "").replace(/^"|"$/g, "").trim();
    const colorRaw    = (cols[5] ?? "").replace(/^"|"$/g, "").trim();

    if (!year || !month || !day) continue;

    const key = dayKey(year, month, day);

    // color (one per day — last non-empty wins)
    if (colorRaw) {
      const hex = resolveColor(colorRaw);
      if (hex) sheetColors[key] = hex;
    }

    // assignment (skip if no title)
    if (title) {
      if (!sheetData[key]) sheetData[key] = [];
      sheetData[key].push({ id: `${key}-${sheetData[key].length}`, title, description });
    }
  }
  return { sheetData, sheetColors };
}

// ─── Main Calendar ────────────────────────────────────────────────────────────

export default function Calendar() {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [themeIdx, setThemeIdx] = useState<number>(() => {
    try { return parseInt(localStorage.getItem("ceam_theme") ?? "0"); } catch { return 0; }
  });
  const theme = THEMES[themeIdx % THEMES.length];

  const cycleTheme = () => {
    const next = (themeIdx + 1) % THEMES.length;
    setThemeIdx(next);
    localStorage.setItem("ceam_theme", String(next));
  };

  // Liga/desliga o modo escuro do Tailwind (classe "dark" na raiz do documento)
  // sempre que o tema selecionado mudar.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme.dark);
  }, [theme.dark]);

  const [selectedDay, setSelectedDay] = useState<{ year: number; month: number; day: number } | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showOwnerLogin, setShowOwnerLogin] = useState(false);
  const [ownerPasswordInput, setOwnerPasswordInput] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showEmails, setShowEmails] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showBoards, setShowBoards] = useState(false);

  // Google Sheets data
  const [sheetData, setSheetData] = useState<SheetData>({});
  const [boardsData, setBoardsData] = useState<BoardPhoto[]>([]);
  const [sheetColors, setSheetColors] = useState<ColorData>({});
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch Google Sheets data
  const fetchSheetData = useCallback(async () => {
    try {
      const res = await fetch(SHEET_URL);
      const csv = await res.text();
      const { sheetData: sd, sheetColors: sc } = parseCSV(csv);
      setSheetData(sd);
      setSheetColors(sc);
    } catch (e) {
      toast.error("Erro ao carregar dados da planilha.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBoardsData = useCallback(async () => {
    try {
      const res = await fetch(BOARDS_URL);
      const csv = await res.text();
      setBoardsData(parseBoardsCSV(csv));
    } catch (e) {
      // Silently fail for boards
    }
  }, []);

  useEffect(() => {
    fetchSheetData();
    fetchBoardsData();
    // auto-refresh every 60s
    const interval = setInterval(() => { fetchSheetData(); fetchBoardsData(); }, 60000);
    return () => clearInterval(interval);
  }, [fetchSheetData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = currentMonthIndex * scrollRef.current.offsetWidth;
    }
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth);
    setCurrentMonthIndex(idx);
  };

  const scrollToMonth = (idx: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: idx * scrollRef.current.offsetWidth, behavior: "smooth" });
    setCurrentMonthIndex(idx);
  };



  const handleOwnerLogin = () => {
    if (ownerPasswordInput === OWNER_PASSWORD) {
      setIsOwner(true);
      setEditMode(true);
      setShowOwnerLogin(false);
      setOwnerPasswordInput("");
      toast.success("Modo de edição ativado!");
    } else {
      toast.error("Senha incorreta.");
    }
  };



  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: theme.bg }}>
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-indigo-100 dark:border-gray-800 shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${theme.header} flex items-center justify-center text-white text-sm shadow-md`}>
            📅
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">Calendário CEAM</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">Trabalhos · 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={cycleTheme}
            className="px-2 py-1.5 rounded-xl text-sm transition-all hover:scale-110"
            title={`Tema: ${theme.name}`}
            style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.15))" }}
          >
            🎨
          </button>
          <button
            onClick={fetchSheetData}
            className="px-2 py-1.5 rounded-xl text-sm text-gray-400 dark:text-gray-500 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all"
            title="Atualizar dados"
          >
            🔄
          </button>
          <button
            onClick={() => setShowBoards(true)}
            className={`hidden sm:block px-3 py-1.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${theme.dot} text-white transition-all shadow-sm hover:shadow-md`}
          >
            🖼️ Quadros
          </button>
          <button
            onClick={() => setShowSchedule(true)}
            className="hidden sm:block px-3 py-1.5 rounded-xl text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
          >
            🕐 Horários
          </button>
          <button
            onClick={() => setShowEmails(true)}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${theme.badge} text-white transition-all shadow-sm hover:shadow-md`}
          >
            📧 Emails
          </button>
          {isOwner && (
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${editMode ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
            >
              {editMode ? "✏️ Editando" : "👁 Ver"}
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => { setIsOwner(false); setEditMode(false); }}
              className="px-3 py-1.5 rounded-xl text-sm bg-red-50 dark:bg-red-950 text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
            >
              Sair
            </button>
          )}
        </div>
      </header>

      {/* Month tabs */}
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-b border-indigo-50 dark:border-gray-800 px-4 py-2.5 flex gap-2 overflow-x-auto hide-scrollbar">
        {MONTHS.map((m, i) => (
          <button
            key={m.month}
            onClick={() => scrollToMonth(i)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              currentMonthIndex === i
                ? `bg-gradient-to-r ${theme.tab} text-white shadow-md`
                : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-300 border border-gray-100 dark:border-gray-700"
            }`}
          >
            {m.name}
          </button>
        ))}

      </div>

      {/* Loading bar */}
      {loading && (
        <div className="h-0.5 bg-indigo-100 dark:bg-gray-800 overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${theme.dot} animate-pulse w-full`} />
        </div>
      )}

      {/* Calendar scroll container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {MONTHS.map((m) => (
          <MonthView
            key={`${m.year}-${m.month}`}
            year={m.year}
            month={m.month}
            monthName={m.name}
            sheetData={sheetData}
            colorData={sheetColors}
            theme={theme}
            onDayClick={(day) => {
              setSelectedDay({ year: m.year, month: m.month, day });
              setSelectedAssignment(null);
            }}

          />
        ))}
      </div>



      {/* Mobile boards button */}
      <div className="sm:hidden px-4 pt-3 pb-1 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setShowBoards(true)}
          className={`w-full py-3 rounded-2xl text-sm font-bold bg-gradient-to-r ${theme.dot} text-white active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2`}
        >
          🖼️ Ver Quadros da Sala
        </button>
      </div>

      {/* Mobile schedule button — shown below calendar on small screens */}
      <div className="sm:hidden px-4 py-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
        <button
          onClick={() => setShowSchedule(true)}
          className="w-full py-3 rounded-2xl text-sm font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
        >
          🕐 Ver Horários das Aulas
        </button>
      </div>

      {/* Day detail modal */}
      {selectedDay && (
        <DayModal
          year={selectedDay.year}
          month={selectedDay.month}
          day={selectedDay.day}
          sheetData={sheetData}
          theme={theme}
          onClose={() => { setSelectedDay(null); setSelectedAssignment(null); }}
          selectedAssignment={selectedAssignment}
          onSelectAssignment={setSelectedAssignment}
          onBackFromAssignment={() => setSelectedAssignment(null)}
        />
      )}



      {/* Emails modal */}
      {showEmails && <EmailsModal theme={theme} onClose={() => setShowEmails(false)} />}

      {/* Boards modal */}
      {showBoards && <BoardsModal theme={theme} photos={boardsData} onClose={() => setShowBoards(false)} />}

      {/* Schedule modal */}
      {showSchedule && <ScheduleModal theme={theme} onClose={() => setShowSchedule(false)} />}

      {/* Owner login modal */}
      {showOwnerLogin && (
        <Modal onClose={() => { setShowOwnerLogin(false); setOwnerPasswordInput(""); }}>
          <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Modo Edição</h2>
          <input
            type="password"
            placeholder="Senha"
            value={ownerPasswordInput}
            onChange={(e) => setOwnerPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleOwnerLogin()}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            autoFocus
          />
          <button
            onClick={handleOwnerLogin}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700"
          >
            Entrar
          </button>
        </Modal>
      )}
    </div>
  );
}

// ─── Month View ───────────────────────────────────────────────────────────────

function MonthView({
  year, month, monthName, sheetData, colorData, theme, onDayClick,
}: {
  year: number; month: number; monthName: string;
  sheetData: SheetData;
  colorData: ColorData;
  theme: Theme;
  onDayClick: (day: number) => void;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

  return (
    <div className="min-w-full snap-start flex flex-col p-4">
      <div className="mb-5 text-center">
        <h2 className={`text-3xl font-extrabold bg-gradient-to-r ${theme.text} bg-clip-text text-transparent`}>
          {monthName}
        </h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">{year}</p>
      </div>
      <div className="grid grid-cols-7 mb-2 bg-white/60 dark:bg-gray-900/40 rounded-xl px-1 py-1 border border-indigo-50 dark:border-gray-800">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const key = dayKey(year, month, day);
          const assignments = sheetData[key] ?? [];
          const hasAssignments = assignments.length > 0;
          const bgColor = colorData[key] && colorData[key] !== "#ffffff" ? colorData[key] : undefined;
          const isToday = isCurrentMonth && today.getDate() === day;

          return (
            <button
              key={day}
              onClick={() => onDayClick(day)}
              className={`
                day-cell relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl text-sm font-medium
                transition-all duration-200 hover:scale-105 active:scale-95
                ${isToday ? `ring-2 ${theme.ring} today-pulse` : ""}
                ${bgColor ? "border border-white/60 dark:border-gray-900/60" : "bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 border border-indigo-50 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-600"}
                shadow-sm
              `}
              style={bgColor ? { backgroundColor: bgColor } : {}}
            >
              <span className={`text-xs font-bold ${bgColor ? "text-gray-700" : "text-gray-700 dark:text-gray-200"}`}>
                {day}
              </span>
              {hasAssignments && (
                <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                  {assignments.slice(0, 3).map((_, idx) => (
                    <div key={idx} className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${theme.dot}`} />
                  ))}
                </div>
              )}

            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Day Modal ────────────────────────────────────────────────────────────────

function DayModal({
  year, month, day, sheetData, theme, onClose, selectedAssignment, onSelectAssignment, onBackFromAssignment,
}: {
  year: number; month: number; day: number;
  sheetData: SheetData;
  theme: Theme;
  onClose: () => void;
  selectedAssignment: Assignment | null;
  onSelectAssignment: (a: Assignment) => void;
  onBackFromAssignment: () => void;
}) {
  const monthName = MONTH_NAMES[month] ?? "";
  const assignments = sheetData[dayKey(year, month, day)] ?? [];

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`bg-gradient-to-r ${theme.header} px-5 py-5 flex items-center justify-between`}>
          {selectedAssignment ? (
            <button onClick={onBackFromAssignment} className="text-white/90 font-semibold flex items-center gap-1 hover:text-white transition-colors">
              ← Voltar
            </button>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-white">{day} de {monthName}</h3>
              <p className="text-white/60 text-sm">{year}</p>
            </div>
          )}
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {selectedAssignment ? (
            <AssignmentDetail assignment={selectedAssignment} />
          ) : (
            <AssignmentList assignments={assignments} theme={theme} onSelect={onSelectAssignment} />
          )}
        </div>
      </div>
    </div>
  );
}

function AssignmentList({ assignments, theme, onSelect }: { assignments: Assignment[]; theme: Theme; onSelect: (a: Assignment) => void }) {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 dark:text-gray-500">
        <div className="text-5xl mb-3">📭</div>
        <p className="text-sm font-medium">Nenhuma atividade nesse dia</p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Aproveite a folga! 🎉</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold mb-2 tracking-wider">Atividades</p>
      {assignments.map((a, idx) => (
        <button
          key={a.id}
          onClick={() => onSelect(a)}
          className="w-full text-left px-4 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-700/70 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-gray-700 dark:hover:to-gray-600 border border-indigo-100 dark:border-gray-600 transition-all flex items-center justify-between group shadow-sm hover:shadow"
        >
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${theme.dot} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
              {idx + 1}
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{a.title}</span>
          </div>
          <span className="text-indigo-400 dark:text-indigo-300 group-hover:translate-x-1 transition-transform text-lg">→</span>
        </button>
      ))}
    </div>
  );
}

function AssignmentDetail({ assignment }: { assignment: Assignment }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-lg shadow-md">
          📝
        </div>
        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100">{assignment.title}</h4>
      </div>
      <div className="bg-indigo-50 dark:bg-gray-700/60 rounded-2xl p-4 border border-indigo-100 dark:border-gray-600">
        <p className="text-xs text-indigo-400 dark:text-indigo-300 uppercase font-bold mb-2 tracking-wider">Descrição</p>
        <div className="prose prose-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {assignment.description || <span className="text-gray-400 dark:text-gray-500 italic">Sem descrição.</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Emails Modal ─────────────────────────────────────────────────────────────

function EmailsModal({ theme, onClose }: { theme: Theme; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`bg-gradient-to-r ${theme.emailHeader} px-5 py-5 flex items-center justify-between`}>
          <div>
            <h3 className="text-xl font-bold text-white">Emails dos Professores</h3>
            <p className="text-white/70 text-sm">Clique para enviar uma mensagem</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2.5">
          {PROFESSORS.map((p) => (
            <a
              key={p.email}
              href={`mailto:${p.email}`}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700/60 border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow group"
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${theme.dot} flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0`}>
                {p.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{p.name}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs truncate">{p.email}</p>
              </div>
              <span className="text-gray-300 dark:text-gray-500 group-hover:translate-x-1 transition-transform text-lg">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Generic Modal ────────────────────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ─── Schedule Modal ───────────────────────────────────────────────────────────

const SCHEDULE = [
  {
    time: "08:00 - 08:50",
    seg: { subject: "Química",           teacher: "Thiago",         color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
    ter: { subject: "Espanhol",          teacher: "Ronaldo",        color: "bg-orange-100 text-orange-800 border-orange-200" },
    qua: { subject: "Biologia",          teacher: "Christian",      color: "bg-green-100 text-green-800 border-green-200" },
    qui: { subject: "Biologia",          teacher: "Christian",      color: "bg-green-100 text-green-800 border-green-200" },
    sex: { subject: "Língua Portuguesa", teacher: "Márcia",         color: "bg-rose-100 text-rose-800 border-rose-200" },
  },
  {
    time: "08:50 - 09:40",
    seg: { subject: "MAT II",            teacher: "Kacielly",       color: "bg-blue-100 text-blue-800 border-blue-200" },
    ter: { subject: "MAT I",             teacher: "Maycon",         color: "bg-blue-100 text-blue-800 border-blue-200" },
    qua: { subject: "Língua Portuguesa", teacher: "Márcia",         color: "bg-rose-100 text-rose-800 border-rose-200" },
    qui: { subject: "MAT I",             teacher: "Maycon",         color: "bg-blue-100 text-blue-800 border-blue-200" },
    sex: { subject: "Literatura",        teacher: "Rodrigo Martins",color: "bg-purple-100 text-purple-800 border-purple-200" },
  },
  {
    time: "09:40 - 10:30",
    seg: { subject: "Redação",           teacher: "Ronaldo",        color: "bg-amber-100 text-amber-800 border-amber-200" },
    ter: { subject: "Sociologia",        teacher: "Jeff",           color: "bg-teal-100 text-teal-800 border-teal-200" },
    qua: { subject: "Química",           teacher: "Thiago",         color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
    qui: { subject: "Língua Inglesa",    teacher: "Vanessa",        color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    sex: { subject: "IF. MAT",           teacher: "Kacielly",       color: "bg-blue-100 text-blue-800 border-blue-200" },
  },
  { time: "10:30 - 10:50", recreio: true },
  {
    time: "10:50 - 11:40",
    seg: { subject: "Física",            teacher: "Limarcos",       color: "bg-violet-100 text-violet-800 border-violet-200" },
    ter: { subject: "Geografia",         teacher: "Rodrigo",        color: "bg-lime-100 text-lime-800 border-lime-200" },
    qua: { subject: "História",          teacher: "Arthur",         color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    qui: { subject: "História",          teacher: "Arthur",         color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    sex: { subject: "Língua Inglesa",    teacher: "Vanessa",        color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  },
  {
    time: "11:40 - 12:30",
    seg: { subject: "Física",            teacher: "Limarcos",       color: "bg-violet-100 text-violet-800 border-violet-200" },
    ter: { subject: "Ed. Física",        teacher: "Diego",          color: "bg-pink-100 text-pink-800 border-pink-200" },
    qua: { subject: "Projeto de Vida",   teacher: "Tatiana",        color: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200" },
    qui: { subject: "Biologia",          teacher: "Christian",      color: "bg-green-100 text-green-800 border-green-200" },
    sex: { subject: "IF. Língua Port.",  teacher: "Márcia",         color: "bg-rose-100 text-rose-800 border-rose-200" },
  },
  {
    time: "12:30 - 13:20",
    seg: { subject: "MAT II",            teacher: "Kacielly",       color: "bg-blue-100 text-blue-800 border-blue-200" },
    ter: { subject: "Filosofia",         teacher: "Jeff",           color: "bg-slate-100 text-slate-800 border-slate-200" },
    qua: { subject: "Redação",           teacher: "Ronaldo",        color: "bg-amber-100 text-amber-800 border-amber-200" },
    qui: { subject: "MAT I",             teacher: "Maycon",         color: "bg-blue-100 text-blue-800 border-blue-200" },
    sex: { subject: "Geografia",         teacher: "Rodrigo",        color: "bg-lime-100 text-lime-800 border-lime-200" },
  },
];

const DAYS = ["seg", "ter", "qua", "qui", "sex"] as const;
const DAY_LABELS: Record<typeof DAYS[number], string> = {
  seg: "Segunda", ter: "Terça", qua: "Quarta", qui: "Quinta", sex: "Sexta",
};

type SlotData = { subject: string; teacher: string; color: string };
type ScheduleRow = { time: string; recreio?: boolean } & Partial<Record<typeof DAYS[number], SlotData>>;

function ScheduleModal({ theme, onClose }: { theme: Theme; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 w-full sm:max-w-5xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${theme.header} px-5 py-5 flex items-center justify-between shrink-0`}>
          <div>
            <h3 className="text-xl font-bold text-white">🕐 Horários das Aulas</h3>
            <p className="text-white/60 text-sm">Grade semanal · CEAM 2026</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Table — desktop */}
        <div className="hidden sm:block overflow-auto flex-1">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider w-32">Horário</th>
                {DAYS.map((d) => (
                  <th key={d} className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wider">
                    {DAY_LABELS[d]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(SCHEDULE as ScheduleRow[]).map((row, i) => (
                <tr key={i} className={`border-b border-gray-100 dark:border-gray-700 ${row.recreio ? "bg-gray-50 dark:bg-gray-900/60" : "hover:bg-gray-50/60 dark:hover:bg-gray-700/40"}`}>
                  <td className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{row.time}</td>
                  {row.recreio ? (
                    <td colSpan={5} className="px-4 py-3 text-center font-bold text-gray-400 dark:text-gray-500 text-xs uppercase tracking-widest">
                      — Recreio —
                    </td>
                  ) : (
                    DAYS.map((d) => {
                      const slot = row[d] as SlotData | undefined;
                      return (
                        <td key={d} className="px-3 py-2.5">
                          {slot && (
                            <div className={`rounded-xl px-3 py-2 border ${slot.color} text-center`}>
                              <p className="font-semibold text-xs leading-tight">{slot.subject}</p>
                              <p className="text-xs opacity-70 leading-tight mt-0.5">{slot.teacher}</p>
                            </div>
                          )}
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards — mobile */}
        <div className="sm:hidden overflow-y-auto flex-1 px-4 py-4 flex flex-col gap-4">
          {DAYS.map((d) => (
            <div key={d}>
              <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm mb-2 uppercase tracking-wider">{DAY_LABELS[d]}</h4>
              <div className="flex flex-col gap-2">
                {(SCHEDULE as ScheduleRow[]).map((row, i) => {
                  if (row.recreio) return (
                    <div key={i} className="bg-gray-50 dark:bg-gray-900/60 rounded-xl px-3 py-2 text-center text-xs text-gray-400 dark:text-gray-500 font-semibold border border-gray-100 dark:border-gray-700">
                      {row.time} · Recreio
                    </div>
                  );
                  const slot = row[d] as SlotData | undefined;
                  if (!slot) return null;
                  return (
                    <div key={i} className={`rounded-xl px-3 py-2.5 border ${slot.color} flex items-center justify-between`}>
                      <div>
                        <p className="font-semibold text-xs">{slot.subject}</p>
                        <p className="text-xs opacity-70">{slot.teacher}</p>
                      </div>
                      <span className="text-xs opacity-60 whitespace-nowrap ml-2">{row.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Boards Modal ─────────────────────────────────────────────────────────────

const MONTH_NAMES_FULL: Record<number, string> = {
  1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
  5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
  9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro",
};

function BoardsModal({ theme, photos, onClose }: { theme: Theme; photos: BoardPhoto[]; onClose: () => void }) {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear] = useState(currentYear);
  const [lightbox, setLightbox] = useState<BoardPhoto | null>(null);

  // Get unique months that have photos
  const availableMonths = Array.from(
    new Set(photos.map((p) => `${p.year}-${p.month}`))
  ).map((key) => {
    const [y, m] = key.split("-").map(Number);
    return { year: y, month: m };
  }).sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);

  const filtered = photos.filter((p) => p.month === selectedMonth && p.year === selectedYear);

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: "90vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${theme.header} px-5 py-5 flex items-center justify-between shrink-0`}>
            <div>
              <h3 className="text-xl font-bold text-white">🖼️ Quadros da Sala</h3>
              <p className="text-white/70 text-sm">Fotos organizadas por mês</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-xl w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >✕</button>
          </div>

          {/* Month tabs */}
          {availableMonths.length > 0 && (
            <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 shrink-0 hide-scrollbar">
              {availableMonths.map((m) => (
                <button
                  key={`${m.year}-${m.month}`}
                  onClick={() => setSelectedMonth(m.month)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedMonth === m.month && selectedYear === m.year
                      ? `bg-gradient-to-r ${theme.tab} text-white shadow-md`
                      : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {MONTH_NAMES_FULL[m.month]}
                </button>
              ))}
            </div>
          )}

          {/* Photos grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {photos.length === 0 && (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                <div className="text-5xl mb-3">🖼️</div>
                <p className="text-sm font-medium">Nenhuma foto ainda</p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Adicione fotos na aba "quadros" da planilha</p>
              </div>
            )}
            {photos.length > 0 && filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                <div className="text-5xl mb-3">📅</div>
                <p className="text-sm font-medium">Sem fotos em {MONTH_NAMES_FULL[selectedMonth]}</p>
              </div>
            )}
            {filtered.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filtered.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox(photo)}
                    className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95 bg-gray-100 dark:bg-gray-900"
                  >
                    <img
                      src={photo.link}
                      alt={photo.descricao || `Quadro ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {photo.descricao && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {photo.descricao}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.link}
              alt={lightbox.descricao}
              className="w-full rounded-2xl shadow-2xl max-h-[80vh] object-contain"
            />
            {lightbox.descricao && (
              <p className="text-white text-center mt-3 text-sm">{lightbox.descricao}</p>
            )}
            <div className="flex gap-3 justify-center mt-4">
              <a
                href={lightbox.link}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white text-gray-800 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                ⬇️ Baixar
              </a>
              <button
                onClick={() => setLightbox(null)}
                className="px-4 py-2 bg-white/20 text-white rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
