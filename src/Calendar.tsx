import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

const MONTHS = [
  { month: 4, name: "Abril", year: 2026 },
  { month: 6, name: "Junho", year: 2026 },
  { month: 9, name: "Setembro", year: 2026 },
  { month: 11, name: "Novembro", year: 2026 },
];

const DAY_NAMES = ["Dom", "Seg", "Ter", "Quar", "Quin", "Sex", "Sab"];

const PRESET_COLORS = [
  { label: "White", value: "#ffffff" },
  { label: "Red", value: "#fecaca" },
  { label: "Orange", value: "#fed7aa" },
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Purple", value: "#e9d5ff" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Teal", value: "#99f6e4" },
  { label: "Gray", value: "#e5e7eb" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

type Assignment = { id: string; title: string; description: string };
type DayData = {
  _id: string;
  year: number;
  month: number;
  day: number;
  color?: string;
  assignments: Assignment[];
} | null | undefined;

const OWNER_PASSWORD = "jose";

export default function Calendar() {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState<{ year: number; month: number; day: number } | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showOwnerLogin, setShowOwnerLogin] = useState(false);
  const [ownerPasswordInput, setOwnerPasswordInput] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editingDay, setEditingDay] = useState<{ year: number; month: number; day: number } | null>(null);
  const [showEmails, setShowEmails] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const hiddenButtonClickCount = useRef(0);
  const hiddenButtonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const upsertDayData = useMutation(api.calendar.upsertDayData);

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

  const handleHiddenButtonClick = () => {
    hiddenButtonClickCount.current += 1;
    if (hiddenButtonTimer.current) clearTimeout(hiddenButtonTimer.current);
    hiddenButtonTimer.current = setTimeout(() => {
      hiddenButtonClickCount.current = 0;
    }, 2000);
    if (hiddenButtonClickCount.current >= 1) {
      setShowOwnerLogin(true);
      hiddenButtonClickCount.current = 0;
    }
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
    <div className="relative min-h-screen flex flex-col" style={{ background: "#f5f0e8" }}>
      {/* Header */}
      <header className="sticky top-0 z-20 px-5 py-3 flex items-center justify-between" style={{ background: "#f5f0e8" }}>
        <h1 className="text-sm font-semibold text-gray-500 tracking-wide uppercase">📅 CEAM · AV3</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmails(true)}
            className="px-4 py-1.5 rounded-full text-sm font-medium border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
          >
            Emails
          </button>
          {isOwner && (
            <button
              onClick={() => { setEditMode(!editMode); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${editMode ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}
            >
              {editMode ? "✏️ Editando" : "Ver"}
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => { setIsOwner(false); setEditMode(false); }}
              className="px-3 py-1.5 rounded-full text-sm bg-white text-gray-500 border border-gray-200"
            >
              Sair
            </button>
          )}
        </div>
      </header>

      {/* Month tabs */}
      <div className="px-5 py-2 flex gap-2 overflow-x-auto" style={{ background: "#f5f0e8" }}>
        {MONTHS.map((m, i) => (
          <button
            key={m.month}
            onClick={() => scrollToMonth(i)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
              currentMonthIndex === i
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

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
            editMode={editMode}
            onDayClick={(day) => {
              setSelectedDay({ year: m.year, month: m.month, day });
              setSelectedAssignment(null);
            }}
            onEditDay={(day) => setEditingDay({ year: m.year, month: m.month, day })}
          />
        ))}
      </div>

      {/* Hidden owner button - bottom left corner */}
      <button
        onClick={handleHiddenButtonClick}
        className="fixed bottom-4 left-4 w-6 h-6 rounded-full bg-blue-600 opacity-20 hover:opacity-40 transition-opacity z-50"
        aria-label="Owner access"
      />

      {/* Day detail modal */}
      {selectedDay && (
        <DayModal
          year={selectedDay.year}
          month={selectedDay.month}
          day={selectedDay.day}
          onClose={() => { setSelectedDay(null); setSelectedAssignment(null); }}
          selectedAssignment={selectedAssignment}
          onSelectAssignment={setSelectedAssignment}
          onBackFromAssignment={() => setSelectedAssignment(null)}
        />
      )}

      {/* Edit day modal */}
      {editingDay && (
        <EditDayModal
          year={editingDay.year}
          month={editingDay.month}
          day={editingDay.day}
          onClose={() => setEditingDay(null)}
          upsertDayData={upsertDayData}
        />
      )}

      {/* Emails modal */}
      {showEmails && (
        <EmailsModal
          onClose={() => setShowEmails(false)}
        />
      )}

      {/* Owner login modal */}
      {showOwnerLogin && (
        <Modal onClose={() => { setShowOwnerLogin(false); setOwnerPasswordInput(""); }}>
          <h2 className="text-lg font-bold mb-4 text-gray-800">Editar</h2>
          <input
            type="password"
            placeholder="Senha"
            value={ownerPasswordInput}
            onChange={(e) => setOwnerPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleOwnerLogin()}
            className="w-full border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
  year, month, monthName, editMode, onDayClick, onEditDay,
}: {
  year: number; month: number; monthName: string;
  editMode: boolean;
  onDayClick: (day: number) => void;
  onEditDay: (day: number) => void;
}) {
  const monthData = useQuery(api.calendar.getMonthData, { year, month });
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const dayMap: Record<number, { color?: string; assignments: Assignment[] }> = {};
  if (monthData) {
    for (const d of monthData) {
      dayMap[d.day] = { color: d.color, assignments: d.assignments };
    }
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

  const DAY_NAMES_FULL = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

  return (
    <div className="min-w-full snap-start flex flex-col px-4 pb-6">
      {/* Big month title like the reference */}
      <div className="mb-4 mt-2">
        <h2 className="text-5xl font-bold text-gray-900 leading-none">{monthName}</h2>
        <p className="text-sm text-gray-400 mt-1">{year}</p>
      </div>

      {/* Calendar card */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAY_NAMES_FULL.map((d, i) => (
            <div key={d} className={`text-center text-xs font-semibold py-3 tracking-wider ${i === 2 ? "text-blue-500" : "text-gray-400"}`}>
              {d}
            </div>
          ))}
        </div>
        {/* Day cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="aspect-square sm:aspect-auto sm:min-h-[80px]" />;
            const data = dayMap[day];
            const hasAssignments = data && data.assignments.length > 0;
            const bgColor = data?.color && data.color !== "#ffffff" ? data.color : undefined;
            const isToday = isCurrentMonth && today.getDate() === day;

            return (
              <button
                key={day}
                onClick={() => editMode ? onEditDay(day) : onDayClick(day)}
                className={`
                  relative aspect-square sm:aspect-auto sm:min-h-[80px] flex flex-col items-start justify-start p-1.5 sm:p-3
                  transition-colors hover:bg-blue-50 active:bg-blue-100
                  ${bgColor ? "" : "bg-white"}
                  ${editMode ? "ring-inset ring-1 ring-blue-200" : ""}
                `}
                style={bgColor ? { backgroundColor: bgColor } : {}}
              >
                <span className={`text-sm sm:text-base font-semibold leading-none ${isToday ? "text-blue-600 bg-blue-100 rounded-full w-7 h-7 flex items-center justify-center -mt-0.5 -ml-0.5" : "text-gray-800"}`}>
                  {day}
                </span>
                {hasAssignments && (
                  <div className="flex flex-col gap-0.5 mt-1 w-full hidden sm:flex">
                    {data.assignments.slice(0, 2).map((a, idx) => (
                      <div key={idx} className="text-xs text-blue-700 bg-blue-50 rounded px-1 py-0.5 truncate leading-tight">
                        {a.title}
                      </div>
                    ))}
                    {data.assignments.length > 2 && (
                      <div className="text-xs text-gray-400">+{data.assignments.length - 2}</div>
                    )}
                  </div>
                )}
                {hasAssignments && (
                  <div className="flex gap-0.5 mt-1 sm:hidden">
                    {data.assignments.slice(0, 3).map((_, idx) => (
                      <div key={idx} className="w-1 h-1 rounded-full bg-blue-500" />
                    ))}
                  </div>
                )}
                {editMode && (
                  <div className="absolute top-0.5 right-0.5 text-blue-400 text-xs">✏️</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Day Modal ────────────────────────────────────────────────────────────────

function DayModal({
  year, month, day, onClose, selectedAssignment, onSelectAssignment, onBackFromAssignment,
}: {
  year: number; month: number; day: number;
  onClose: () => void;
  selectedAssignment: Assignment | null;
  onSelectAssignment: (a: Assignment) => void;
  onBackFromAssignment: () => void;
}) {
  const dayData = useQuery(api.calendar.getDayData, { year, month, day });
  const monthName = MONTHS.find((m) => m.month === month)?.name ?? "";

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          {selectedAssignment ? (
            <button onClick={onBackFromAssignment} className="text-indigo-600 font-medium flex items-center gap-1">
              ← Voltar
            </button>
          ) : (
            <h3 className="text-lg font-bold text-gray-800">
              {monthName} {day}, {year}
            </h3>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {selectedAssignment ? (
            <AssignmentDetail assignment={selectedAssignment} />
          ) : (
            <AssignmentList dayData={dayData} onSelect={onSelectAssignment} />
          )}
        </div>
      </div>
    </div>
  );
}

function AssignmentList({
  dayData, onSelect,
}: {
  dayData: DayData;
  onSelect: (a: Assignment) => void;
}) {
  if (dayData === undefined) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" /></div>;
  }
  if (!dayData || dayData.assignments.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <div className="text-4xl mb-2">📭</div>
        <p className="text-sm">Nada nesse dia</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Atividades</p>
      {dayData.assignments.map((a) => (
        <button
          key={a.id}
          onClick={() => onSelect(a)}
          className="w-full text-left px-4 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-colors flex items-center justify-between group"
        >
          <span className="font-medium text-gray-800">{a.title}</span>
          <span className="text-indigo-400 group-hover:translate-x-1 transition-transform">→</span>
        </button>
      ))}
    </div>
  );
}

function AssignmentDetail({ assignment }: { assignment: Assignment }) {
  return (
    <div>
      <h4 className="text-xl font-bold text-gray-800 mb-3">{assignment.title}</h4>
      <div className="prose prose-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
        {assignment.description || <span className="text-gray-400 italic">Sem descrição.</span>}
      </div>
    </div>
  );
}

// ─── Edit Day Modal ───────────────────────────────────────────────────────────

function EditDayModal({
  year, month, day, onClose, upsertDayData,
}: {
  year: number; month: number; day: number;
  onClose: () => void;
  upsertDayData: any;
}) {
  const dayData = useQuery(api.calendar.getDayData, { year, month, day });
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [color, setColor] = useState("#ffffff");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const monthName = MONTHS.find((m) => m.month === month)?.name ?? "";

  useEffect(() => {
    if (dayData !== undefined && !loaded) {
      setAssignments(dayData?.assignments ?? []);
      setColor(dayData?.color ?? "#ffffff");
      setLoaded(true);
    }
  }, [dayData, loaded]);

  const addAssignment = () => {
    setAssignments((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: "", description: "" },
    ]);
  };

  const updateAssignment = (id: string, field: "title" | "description", value: string) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const removeAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertDayData({
        year, month, day,
        color: color === "#ffffff" ? undefined : color,
        assignments: assignments.filter((a) => a.title.trim()),
        ownerPassword: OWNER_PASSWORD,
      });
      toast.success("Salvo!");
      onClose();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Editar: {monthName} {day}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {/* Color picker */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Cor do Dia</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === c.value ? "border-indigo-600 scale-110" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* Assignments */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Atividades</p>
            <div className="flex flex-col gap-3">
              {assignments.map((a) => (
                <div key={a.id} className="border rounded-xl p-3 bg-gray-50 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Título da atividade"
                      value={a.title}
                      onChange={(e) => updateAssignment(a.id, "title", e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                    <button
                      onClick={() => removeAssignment(a.id)}
                      className="text-red-400 hover:text-red-600 text-lg leading-none"
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    placeholder="Descrição (opcional)"
                    value={a.description}
                    onChange={(e) => updateAssignment(a.id, "description", e.target.value)}
                    rows={3}
                    className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                  />
                </div>
              ))}
              <button
                onClick={addAssignment}
                className="flex items-center justify-center gap-2 border-2 border-dashed border-indigo-300 rounded-xl py-2.5 text-indigo-500 hover:bg-indigo-50 transition-colors text-sm font-medium"
              >
                + Adicionar Atividade
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Emails Modal ────────────────────────────────────────────────────────────

const PROFESSORS = [
  { name: "Marcia",             email: "marma.jual@gmail.com" },
  { name: "Kacielly",           email: "kaciellylima@gmail.com" },
  { name: "Rodrigo Geografia",  email: "RodrigoGeo2014@gmail.com" },
  { name: "Rodrigo Literatura", email: "rodmartins1922@gmail.com" },
  { name: "Christian",          email: "christian.gomes.1993@gmail.com" },
  { name: "Tatiana",            email: "tatiana.besada@gmail.com" },
  { name: "Limarcos",           email: "limarcos.ferreira@gmail.com" },
  { name: "Diego",              email: "bottinodiego@gmail.com" },
  { name: "Lais",               email: "laispaivar@gmail.com" },
];

function EmailsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">📧 Emails dos Professores</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {PROFESSORS.map((p) => (
            <div key={p.email} className="border rounded-xl p-3 bg-gray-50">
              <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
              <a href={`mailto:${p.email}`} className="text-blue-600 hover:underline text-sm">{p.email}</a>
            </div>
          ))}
          <p className="text-xs text-center text-gray-400 mt-2">Clique no email para enviar uma mensagem.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Generic Modal ────────────────────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
