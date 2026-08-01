import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Undo2,
  Check, 
  X, 
  Smartphone,
  Download,
  Share,
  Sparkles
} from "lucide-react";
import { Workspace } from "./types";

interface PressHistoryItem {
  points: number;
  workspaceId: string;
  buttonValue: string;
  timestamp: number;
  prevLastPressTime: number | null;
  prevLastPressValue: number | null;
}

// Предустановленные рабочие столы по умолчанию для быстрого старта
const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: "w-1",
    name: "РЦ/П",
    buttons: ["3.96", "4.25", "6.79", "6.82", "7.55", "7.88"]
  },
  {
    id: "w-2",
    name: "РЦ/Р",
    buttons: ["3.87", "4.99", "6.37"]
  },
  {
    id: "w-3",
    name: "ОХЛ",
    buttons: ["3.75", "4.30", "6.50", "9.27"]
  },
  {
    id: "w-4",
    name: "Сборки РЦ",
    buttons: ["8.68", "8.75", "10.91"]
  }
];

export default function App() {
  // --- ИНИЦИАЛИЗА СОСТОЯНИЙ ---
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    const saved = localStorage.getItem("yarche_workspaces");
    return saved ? JSON.parse(saved) : DEFAULT_WORKSPACES;
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    const saved = localStorage.getItem("yarche_active_ws");
    if (saved) return saved;
    const ws = localStorage.getItem("yarche_workspaces");
    const parsed = ws ? JSON.parse(ws) : DEFAULT_WORKSPACES;
    return parsed[0]?.id || "w-1";
  });

  const [totalSum, setTotalSum] = useState<number>(() => {
    const saved = localStorage.getItem("yarche_total_sum");
    return saved ? parseFloat(saved) : 0;
  });

  const [pressCount, setPressCount] = useState<number>(() => {
    const saved = localStorage.getItem("yarche_press_count");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lastPressTime, setLastPressTime] = useState<number | null>(() => {
    const saved = localStorage.getItem("yarche_last_press_time");
    return saved ? parseInt(saved, 10) : null;
  });

  const [lastPressValue, setLastPressValue] = useState<number | null>(() => {
    const saved = localStorage.getItem("yarche_last_press_value");
    return saved ? parseFloat(saved) : null;
  });

  const [pressHistory, setPressHistory] = useState<PressHistoryItem[]>(() => {
    const saved = localStorage.getItem("yarche_press_history");
    return saved ? JSON.parse(saved) : [];
  });

  // --- СОСТОЯНИЯ ИНТЕРФЕЙСА ---
  const [pointsInput, setPointsInput] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [showAddWorkspaceModal, setShowAddWorkspaceModal] = useState<boolean>(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>("");
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [renameWorkspaceId, setRenameWorkspaceId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");
  
  // Часы и дата в реальном времени
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  // Текст времени с последнего нажатия
  const [elapsedText, setElapsedText] = useState<string>("—");

  // Состояние видимости верхней шапки с названием и кнопкой установки
  const [showTopHeader, setShowTopHeader] = useState<boolean>(() => {
    const saved = localStorage.getItem("yarche_show_top_header");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Состояния мотивирующих достижений
  const [shownMilestones, setShownMilestones] = useState<string[]>(() => {
    const saved = localStorage.getItem("yarche_shown_milestones");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeMilestoneText, setActiveMilestoneText] = useState<string | null>(null);

  // --- СОСТОЯНИЯ УСТАНОВКИ PWA ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [installTab, setInstallTab] = useState<"android" | "ios">("android");
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Определение запуска в режиме установленного приложения
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Определение ОС для вкладки по умолчанию
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOSDevice) {
      setInstallTab("ios");
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setShowInstallModal(false);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  // Отслеживание кликов по кнопкам
  const [buttonClicks, setButtonClicks] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("yarche_button_clicks");
    return saved ? JSON.parse(saved) : {};
  });

  // --- СОХРАНЕНИЕ В LOCALSTORAGE ---
  useEffect(() => {
    localStorage.setItem("yarche_show_top_header", JSON.stringify(showTopHeader));
  }, [showTopHeader]);

  useEffect(() => {
    localStorage.setItem("yarche_workspaces", JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem("yarche_active_ws", activeWorkspaceId);
  }, [activeWorkspaceId]);

  useEffect(() => {
    localStorage.setItem("yarche_total_sum", totalSum.toString());
  }, [totalSum]);

  useEffect(() => {
    localStorage.setItem("yarche_press_count", pressCount.toString());
  }, [pressCount]);

  useEffect(() => {
    if (lastPressTime !== null) {
      localStorage.setItem("yarche_last_press_time", lastPressTime.toString());
    } else {
      localStorage.removeItem("yarche_last_press_time");
    }
  }, [lastPressTime]);

  useEffect(() => {
    if (lastPressValue !== null) {
      localStorage.setItem("yarche_last_press_value", lastPressValue.toString());
    } else {
      localStorage.removeItem("yarche_last_press_value");
    }
  }, [lastPressValue]);

  useEffect(() => {
    localStorage.setItem("yarche_press_history", JSON.stringify(pressHistory));
  }, [pressHistory]);

  useEffect(() => {
    localStorage.setItem("yarche_shown_milestones", JSON.stringify(shownMilestones));
  }, [shownMilestones]);

  useEffect(() => {
    localStorage.setItem("yarche_button_clicks", JSON.stringify(buttonClicks));
  }, [buttonClicks]);

  // Проверка достижений по баллам
  useEffect(() => {
    const milestones = [
      { threshold: 900, text: "ты это сделал, горжусь" },
      { threshold: 750, text: "ты почти у цели" },
      { threshold: 500, text: "ты можешь лучше" }
    ];

    for (const milestone of milestones) {
      const milestoneKey = milestone.threshold.toString();
      if (totalSum >= milestone.threshold && !shownMilestones.includes(milestoneKey)) {
        setActiveMilestoneText(milestone.text);
        setShownMilestones(prev => [...prev, milestoneKey]);
        break; // Отображаем по одному достижению
      }
    }
  }, [totalSum, shownMilestones]);

  // --- ТАЙМЕРЫ (ЧАСЫ И ВРЕМЯ ПОСЛЕДНЕГО КЛИКА) ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDate(now);

      if (lastPressTime) {
        const diffSeconds = Math.floor((now.getTime() - lastPressTime) / 1000);
        if (diffSeconds < 2) {
          setElapsedText("только что");
        } else if (diffSeconds < 60) {
          setElapsedText(`${diffSeconds}с назад`);
        } else if (diffSeconds < 3600) {
          const mins = Math.floor(diffSeconds / 60);
          const secs = diffSeconds % 60;
          setElapsedText(`${mins}м ${secs}с назад`);
        } else {
          const hours = Math.floor(diffSeconds / 3600);
          const mins = Math.floor((diffSeconds % 3600) / 60);
          setElapsedText(`${hours}ч ${mins}м назад`);
        }
      } else {
        setElapsedText("—");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastPressTime]);

  useEffect(() => {
    if (lastPressTime) {
      const diffSeconds = Math.floor((Date.now() - lastPressTime) / 1000);
      if (diffSeconds < 2) {
        setElapsedText("только что");
      } else if (diffSeconds < 60) {
        setElapsedText(`${diffSeconds}с назад`);
      } else {
        const mins = Math.floor(diffSeconds / 60);
        setElapsedText(`${mins}м назад`);
      }
    } else {
      setElapsedText("—");
    }
  }, [lastPressTime]);

  // --- ОБРАБОТЧИКИ ДЕЙСТВИЙ ---
  const handleAddButton = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseFloat(pointsInput.replace(",", "."));
    if (isNaN(val) || val <= 0) return;
    const formatted = val.toFixed(2);

    setWorkspaces(prev => prev.map(ws => {
      if (ws.id === activeWorkspaceId) {
        if (ws.buttons.includes(formatted)) return ws;
        return {
          ...ws,
          buttons: [...ws.buttons, formatted].sort((a, b) => parseFloat(a) - parseFloat(b))
        };
      }
      return ws;
    }));
    setPointsInput("");
  };

  const handleDeleteButton = (buttonValue: string) => {
    setWorkspaces(prev => prev.map(ws => {
      if (ws.id === activeWorkspaceId) {
        return {
          ...ws,
          buttons: ws.buttons.filter(b => b !== buttonValue)
        };
      }
      return ws;
    }));
  };

  const handlePointClick = (valueStr: string) => {
    if (isEditMode) {
      handleDeleteButton(valueStr);
      return;
    }
    const points = parseFloat(valueStr);

    // Save history item (up to 5 items max)
    const historyItem: PressHistoryItem = {
      points,
      workspaceId: activeWorkspaceId,
      buttonValue: valueStr,
      timestamp: Date.now(),
      prevLastPressTime: lastPressTime,
      prevLastPressValue: lastPressValue,
    };
    setPressHistory(prev => {
      const updated = [...prev, historyItem];
      return updated.length > 5 ? updated.slice(updated.length - 5) : updated;
    });

    setTotalSum(prev => Math.round((prev + points) * 100) / 100);
    setPressCount(prev => prev + 1);
    setLastPressTime(Date.now());
    setLastPressValue(points);

    // Track click count for the specific button on the current workspace
    const clickKey = `${activeWorkspaceId}_${valueStr}`;
    setButtonClicks(prev => ({
      ...prev,
      [clickKey]: (prev[clickKey] || 0) + 1
    }));
  };

  // Undo last action (up to 5 history steps)
  const handleUndo = () => {
    if (pressHistory.length === 0) return;
    const lastItem = pressHistory[pressHistory.length - 1];
    const newHistory = pressHistory.slice(0, pressHistory.length - 1);
    setPressHistory(newHistory);

    // Revert sum and count
    setTotalSum(prev => Math.max(0, Math.round((prev - lastItem.points) * 100) / 100));
    setPressCount(prev => Math.max(0, prev - 1));

    // Revert click count for that button
    const clickKey = `${lastItem.workspaceId}_${lastItem.buttonValue}`;
    setButtonClicks(prev => ({
      ...prev,
      [clickKey]: Math.max(0, (prev[clickKey] || 1) - 1)
    }));

    // Restore last press time and value
    if (newHistory.length > 0) {
      const prevItem = newHistory[newHistory.length - 1];
      setLastPressTime(prevItem.timestamp);
      setLastPressValue(prevItem.points);
    } else {
      setLastPressTime(lastItem.prevLastPressTime);
      setLastPressValue(lastItem.prevLastPressValue);
    }
  };

  const handleReset = () => {
    setTotalSum(0);
    setPressCount(0);
    setLastPressTime(null);
    setLastPressValue(null);
    setElapsedText("—");
    setShownMilestones([]);
    setButtonClicks({});
    setPressHistory([]);
    setShowResetConfirm(false);
  };

  const handleAddWorkspace = () => {
    const name = newWorkspaceName.trim() || `Стол ${workspaces.length + 1}`;
    const newId = `w-${Date.now()}`;
    const newWs: Workspace = {
      id: newId,
      name,
      buttons: []
    };
    setWorkspaces(prev => [...prev, newWs]);
    setActiveWorkspaceId(newId);
    setNewWorkspaceName("");
    setShowAddWorkspaceModal(false);
  };

  const handleDeleteWorkspace = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (workspaces.length <= 1) return;
    const index = workspaces.findIndex(ws => ws.id === id);
    const updated = workspaces.filter(ws => ws.id !== id);
    setWorkspaces(updated);
    
    if (activeWorkspaceId === id) {
      const nextActiveIndex = index === 0 ? 0 : index - 1;
      setActiveWorkspaceId(updated[nextActiveIndex].id);
    }
  };

  const triggerRenameWorkspace = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameWorkspaceId(id);
    setRenameValue(currentName);
  };

  const handleRenameWorkspace = () => {
    if (!renameWorkspaceId) return;
    const name = renameValue.trim();
    if (name) {
      setWorkspaces(prev => prev.map(ws => {
        if (ws.id === renameWorkspaceId) {
          return { ...ws, name };
        }
        return ws;
      }));
    }
    setRenameWorkspaceId(null);
    setRenameValue("");
  };

  const activeWorkspace = workspaces.find(ws => ws.id === activeWorkspaceId) || workspaces[0];

  return (
    <div className="min-h-screen w-full bg-[#000000] text-zinc-100 flex justify-center selection:bg-emerald-950 font-sans p-0 m-0">
      
      {/* Мобильный контейнер приложения */}
      <div className="w-full max-w-md min-h-screen flex flex-col justify-between bg-[#050507] border-x border-zinc-900 shadow-2xl relative overflow-x-hidden">
        
        {/* ВЕРХНЯЯ ШАПКА ПРИЛОЖЕНИЯ И КНОПКА УСТАНОВКИ PWA */}
        <AnimatePresence>
          {showTopHeader && (
            <motion.header 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mx-4 mt-3 mb-1 flex items-center justify-between bg-[#0d0d10] border border-zinc-800/90 rounded-xl p-2.5 shadow-md overflow-hidden relative"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E30613] p-1 flex items-center justify-center shadow-md shrink-0">
                  <img src="./icon.svg" alt="Ярче!" className="w-full h-full" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black tracking-wider text-white uppercase font-mono leading-none">
                    Ярче! Баллы
                  </span>
                  <span className="text-[9px] text-zinc-500 font-semibold leading-none mt-1">
                    Калькулятор смены
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleInstallClick}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isInstalled
                      ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/50 text-amber-300 hover:bg-amber-500/20 shadow-sm"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isInstalled ? "Установлено ✓" : "На экран Домой"}</span>
                </motion.button>

                {/* Кнопка скрытия шапки */}
                <button
                  onClick={() => setShowTopHeader(false)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer"
                  title="Скрыть верхнюю строку"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        {/* Кнопка возобновления отображения шапки, если она скрыта */}
        {!showTopHeader && (
          <div className="mx-4 mt-2 mb-0.5 flex justify-between items-center px-1">
            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest font-mono">
              Ярче! Баллы
            </span>
            <button
              onClick={() => setShowTopHeader(true)}
              className="text-[9px] text-zinc-500 hover:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1 px-2 py-0.5 rounded bg-[#0d0d10] border border-zinc-800/80 transition-colors cursor-pointer"
              title="Показать название и инструкцию по установке"
            >
              <Smartphone className="w-3 h-3 text-amber-400" />
              <span>Показать шапку</span>
            </button>
          </div>
        )}

        {/* ВЕРХНЯЯ ПАНЕЛЬ СТАТУСА (Сумма, Время, Дата) */}
        <div className="mx-4 mt-1 mb-1 flex justify-between items-center bg-[#0d0d10] border border-zinc-800 rounded-xl px-4 py-2.5 shadow-lg">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Дата</span>
            <span className="text-xs font-bold text-emerald-400">
              {currentDate.toLocaleDateString("ru-RU", { day: "numeric", month: "short", weekday: "short" })}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Баллы за смену</span>
            <span className="text-xl font-black tracking-tight text-white font-mono">
              {totalSum.toFixed(2)} <span className="text-[10px] text-emerald-500 font-normal">б.</span>
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Время</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {currentDate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
        </div>

        {/* СЕКЦИЯ СТАТИСТИКИ (Последнее нажатие, Сброс, Счетчик, Отмена) */}
        <section className="mx-4 mt-2 mb-2 flex flex-col gap-2">
          {/* Строка 1: Последнее нажатие и Кнопка сброса */}
          <div className="bg-[#0a0a0c] border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase text-zinc-500 tracking-wider font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Последнее нажатие
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-base font-mono text-emerald-400 font-bold">{elapsedText}</span>
                {lastPressValue !== null && (
                  <span className="text-xs font-mono text-emerald-500/90 font-semibold">
                    +{lastPressValue.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-1.5 bg-red-950/20 border border-red-900/40 hover:bg-red-900/20 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Сбросить все данные"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Сброс
            </motion.button>
          </div>

          {/* Строка 2: Счетчик нажатий и Кнопка отмены */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0a0a0c] border border-zinc-800 rounded-xl p-3 flex flex-col justify-center items-center text-center">
              <span className="text-[9px] uppercase text-zinc-500 tracking-wider font-semibold">Количество нажатий</span>
              <span className="text-xl font-black text-white font-mono mt-0.5">{pressCount}</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleUndo}
              disabled={pressHistory.length === 0}
              className={`rounded-xl p-3 flex flex-col items-center justify-center border transition-all cursor-pointer ${
                pressHistory.length > 0
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20 shadow-sm"
                  : "bg-[#0a0a0c] border-zinc-800 text-zinc-600 cursor-not-allowed opacity-60"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs">
                <Undo2 className="w-4 h-4" />
                <span>Отменить</span>
              </div>
              <span className="text-[10px] font-mono mt-0.5 opacity-80">
                {pressHistory.length > 0 ? `Осталось: ${pressHistory.length}` : "Нет отмен"}
              </span>
            </motion.button>
          </div>
        </section>

        {/* ВКЛАДКИ РАБОЧИХ СТОЛОВ */}
        <section className="mb-2 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              Рабочие столы:
            </span>
            
            {/* Переключатель режима редактирования */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`text-xs px-3 py-1 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                isEditMode 
                ? "bg-amber-950/50 text-amber-400 border-amber-800" 
                : "bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-zinc-200"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditMode ? "Готово" : "Редакт"}
            </button>
          </div>

          {/* Список рабочих столов */}
          <div className="flex flex-wrap items-center gap-2.5 bg-[#030305] p-2.5 border border-zinc-800/80 rounded-2xl select-none">
            {workspaces.map((ws) => {
              const isActive = ws.id === activeWorkspaceId;
              return (
                <div
                  key={ws.id}
                  onClick={() => !renameWorkspaceId && setActiveWorkspaceId(ws.id)}
                  className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                    isActive
                      ? "bg-emerald-500 text-black shadow-lg"
                      : "hover:bg-zinc-900 text-zinc-300 border border-transparent"
                  }`}
                >
                  {renameWorkspaceId === ws.id ? (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="bg-zinc-950 text-white font-mono text-xs px-2 py-1 rounded-lg border border-emerald-500 focus:outline-none w-28"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameWorkspace();
                          if (e.key === "Escape") setRenameWorkspaceId(null);
                        }}
                      />
                      <button 
                        onClick={handleRenameWorkspace}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setRenameWorkspaceId(null)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span>{ws.name}</span>
                      {isEditMode && (
                        <div className="flex items-center gap-1.5 ml-2">
                          <button
                            onClick={(e) => triggerRenameWorkspace(ws.id, ws.name, e)}
                            className="p-1 text-zinc-800 hover:text-black transition-colors"
                            title="Переименовать"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {workspaces.length > 1 && (
                            <button
                              onClick={(e) => handleDeleteWorkspace(ws.id, e)}
                              className="p-1 text-red-950/70 hover:text-red-900 transition-colors"
                              title="Удалить"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {/* Кнопка добавления нового стола (только в режиме редактирования) */}
            {isEditMode && (
              <button
                onClick={() => setShowAddWorkspaceModal(true)}
                className="px-5 py-3 bg-[#121215] border border-zinc-700 hover:border-emerald-500 text-emerald-400 rounded-xl transition-colors flex items-center justify-center text-xs font-bold uppercase tracking-wider cursor-pointer animate-fade-in"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>+ стол</span>
              </button>
            )}
          </div>
        </section>

        {/* ФОРМА ДОБАВЛЕНИЯ КНОПКИ (только в режиме редактирования) */}
        {isEditMode && (
          <section className="px-4 py-1.5">
            <form onSubmit={handleAddButton} className="bg-[#0a0a0c] border border-amber-900/40 p-3 rounded-xl">
              <span className="text-[10px] text-amber-400/90 font-bold uppercase tracking-wider block mb-2">
                Создать кнопку на стол "{activeWorkspace?.name || "Основной"}":
              </span>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Например 5.50"
                    value={pointsInput}
                    onChange={(e) => setPointsInput(e.target.value)}
                    className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-700 border border-zinc-850 rounded-lg px-3 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                  />
                  {pointsInput && (
                    <button
                      type="button"
                      onClick={() => setPointsInput("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-3.5 py-2 rounded-lg text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  Создать
                </motion.button>
              </div>
            </form>
          </section>
        )}

        {/* СЕТКА КНОПОК С БАЛЛАМИ (3 колонки) */}
        <section className="flex-1 px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              {activeWorkspace?.name || "Основной"}
              <span className="text-xs text-zinc-500 font-mono font-normal">
                ({activeWorkspace?.buttons?.length || 0} кн.)
              </span>
            </span>
            {isEditMode && (
              <span className="text-[10px] text-amber-400 animate-pulse font-medium">
                ⚠️ Нажмите на кнопку для удаления
              </span>
            )}
          </div>

          {activeWorkspace?.buttons && activeWorkspace.buttons.length > 0 ? (
            <div className="grid grid-cols-3 gap-3.5 p-2.5 bg-[#030305] rounded-2xl border border-zinc-900 shadow-inner">
              {activeWorkspace.buttons.map((btnVal) => {
                const clickKey = `${activeWorkspaceId}_${btnVal}`;
                const clickCount = buttonClicks[clickKey] || 0;
                return (
                  <motion.button
                    key={btnVal}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handlePointClick(btnVal)}
                    animate={isEditMode ? { rotate: [0.5, -0.5, 0.5] } : {}}
                    transition={isEditMode ? { repeat: Infinity, duration: 0.25 } : {}}
                    className={`point-button relative flex flex-col items-center justify-center py-5 px-2 rounded-2xl font-mono border transition-all select-none cursor-pointer h-24 overflow-hidden ${
                      isEditMode
                        ? "bg-red-950/20 text-red-200 border-red-800/60 hover:bg-red-950/30"
                        : "bg-[#111114] hover:bg-emerald-500/10 hover:border-emerald-500/50 text-zinc-100 border-zinc-800/80 active:border-emerald-500 shadow-md"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/[0.01] pointer-events-none"></div>

                    {isEditMode && (
                      <div className="absolute top-1.5 right-1.5 text-red-500 font-bold text-[10px] bg-red-950/80 px-1.5 py-0.5 rounded">
                        ✕
                      </div>
                    )}
                    
                    {/* Значение баллов */}
                    <span className="text-2xl tracking-tight leading-none text-zinc-100 font-black">
                      {btnVal}
                    </span>
                    
                    {/* Индикатор количества нажатий */}
                    <span className="text-xs text-emerald-400 font-bold font-mono leading-none mt-2">
                      {clickCount}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-zinc-950/30 border border-zinc-900 border-dashed rounded-xl text-center">
              <Smartphone className="w-6 h-6 text-zinc-700 mb-1.5" />
              <p className="text-[10px] text-zinc-600 font-medium max-w-xs leading-relaxed">
                {isEditMode 
                  ? 'В этом столе нет кнопок. Напечатайте значение выше и нажмите "Создать"!'
                  : 'В этом столе нет кнопок. Включите "Редакт", чтобы добавить кнопки!'}
              </p>
            </div>
          )}
        </section>

        {/* Отступ снизу */}
        <div className="h-4"></div>

        {/* --- МОДАЛЬНЫЕ ОКНА И ОВЕРЛЕИ --- */}

        {/* 1. ДИАЛОГ ДОБАВЛЕНИЯ РАБОЧЕГО СТОЛА */}
        <AnimatePresence>
          {showAddWorkspaceModal && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-[#0f0f12] border border-zinc-800 rounded-2xl p-5 w-full max-w-xs shadow-2xl"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-zinc-200">Новый рабочий стол</h3>
                  <button 
                    onClick={() => setShowAddWorkspaceModal(false)}
                    className="p-1 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  maxLength={18}
                  className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-700 border border-zinc-800 rounded-xl px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none mb-4"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddWorkspace();
                  }}
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddWorkspaceModal(false)}
                    className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-semibold text-xs cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleAddWorkspace}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs cursor-pointer"
                  >
                    Создать
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 2. ДИАЛОГ ПОДТВЕРЖДЕНИЯ СБРОСА */}
        <AnimatePresence>
          {showResetConfirm && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0f0f12] border border-red-900/40 rounded-2xl p-5 w-full max-w-xs text-center shadow-2xl"
              >
                <div className="w-12 h-12 rounded-full bg-red-950/50 border border-red-900 text-red-400 flex items-center justify-center mx-auto mb-3">
                  <RotateCcw className="w-6 h-6" />
                </div>
                
                <h3 className="text-sm font-bold text-zinc-200 mb-1">Обнулить все баллы?</h3>
                <p className="text-xs text-zinc-500 mb-4 max-w-xs leading-relaxed">
                  Это сбросит накопленную сумму, счетчик нажатий и время последнего клика на ноль. Это действие необратимо.
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-semibold text-xs cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Да, сбросить
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 3. ВСПОЛЫВАЮЩЕЕ ОКНО ДОСТИЖЕНИЯ */}
        <AnimatePresence>
          {activeMilestoneText && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[#0c0c0f] border-2 border-emerald-500/30 rounded-3xl p-6 w-full max-w-xs text-center shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-emerald-500/10 rounded-full filter blur-xl"></div>
                
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl animate-pulse">⚡</span>
                </div>
                
                <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold block mb-1">Достижение!</span>
                <h3 className="text-xl font-black text-white leading-tight font-sans tracking-tight mb-3 font-mono">
                  {totalSum.toFixed(2)} баллов
                </h3>
                
                <p className="text-sm text-zinc-300 font-bold px-3 py-3.5 bg-zinc-950/80 rounded-xl border border-zinc-900 mb-5 font-sans leading-relaxed italic">
                  « {activeMilestoneText} »
                </p>

                <button
                  onClick={() => setActiveMilestoneText(null)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer transition-colors shadow-lg shadow-emerald-500/10"
                >
                  Продолжить работу
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 4. ИНСТРУКЦИЯ ПО УСТАНОВКЕ (iPhone и Android) */}
        <AnimatePresence>
          {showInstallModal && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-[#0e0e12] border border-zinc-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl relative"
              >
                {/* Кнопка закрытия */}
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Заголовок и иконка */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E30613] p-2 flex items-center justify-center shadow-lg">
                    <img src="./icon.svg" alt="Ярче!" className="w-full h-full" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white leading-tight font-mono">
                      Ярче! Баллы
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium">
                      Установка на рабочий стол
                    </p>
                  </div>
                </div>

                {/* Переключатель ОС */}
                <div className="grid grid-cols-2 gap-2 bg-[#050507] p-1.5 rounded-xl border border-zinc-850 mb-4">
                  <button
                    onClick={() => setInstallTab("ios")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      installTab === "ios"
                        ? "bg-emerald-500 text-black shadow-md"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>iPhone / iOS</span>
                  </button>
                  <button
                    onClick={() => setInstallTab("android")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      installTab === "android"
                        ? "bg-emerald-500 text-black shadow-md"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>Android</span>
                  </button>
                </div>

                {/* Содержимое: Инструкция для iOS */}
                {installTab === "ios" && (
                  <div className="space-y-3 bg-[#050507] p-3.5 rounded-2xl border border-zinc-800/80 mb-4 text-xs text-zinc-300">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                        1
                      </div>
                      <p className="leading-relaxed">
                        В браузере <strong className="text-white">Safari</strong> нажмите кнопку <strong className="text-emerald-400">«Поделиться»</strong> <Share className="w-3.5 h-3.5 inline mx-0.5 text-emerald-400" /> (внизу экрана).
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                        2
                      </div>
                      <p className="leading-relaxed">
                        Прокрутите меню вниз и выберите <strong className="text-amber-300">«На экран "Домой"»</strong> <Plus className="w-3.5 h-3.5 inline mx-0.5 text-amber-300" />.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                        3
                      </div>
                      <p className="leading-relaxed">
                        Нажмите <strong className="text-white">«Добавить»</strong> в верхнем углу. Иконка появится на экране телефона!
                      </p>
                    </div>
                  </div>
                )}

                {/* Содержимое: Инструкция для Android */}
                {installTab === "android" && (
                  <div className="space-y-3 bg-[#050507] p-3.5 rounded-2xl border border-zinc-800/80 mb-4 text-xs text-zinc-300">
                    {deferredPrompt ? (
                      <div className="text-center py-2">
                        <p className="text-zinc-300 mb-3 font-semibold">
                          Ваше устройство поддерживает быструю установку!
                        </p>
                        <button
                          onClick={handleInstallClick}
                          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                        >
                          <Download className="w-4 h-4" />
                          Установить на Android
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                            1
                          </div>
                          <p className="leading-relaxed">
                            Нажмите <strong className="text-white">⁞ (три точки)</strong> в верхнем углу браузера (Chrome / Yandex / Opera).
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                            2
                          </div>
                          <p className="leading-relaxed">
                            Выберите <strong className="text-amber-300">«Установить приложение»</strong> или <strong className="text-amber-300">«На главный экран»</strong>.
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                            3
                          </div>
                          <p className="leading-relaxed">
                            Приложение установится на смартфон и будет работать как отдельная программа без браузера!
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setShowInstallModal(false)}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider cursor-pointer border border-zinc-800"
                >
                  Закрыть
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

