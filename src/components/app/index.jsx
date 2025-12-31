import React, { useEffect, useMemo, useRef, useState } from 'react';
import OpCodeTable from '../op-code-table';
import DetailsSidebar from '../details-sidebar';
import { generateAllInstructions } from '../../generators';
import { createInitialOpCodesGrid, setCellForOpCode } from '../../helpers/grid-helpers';
import { matchesInstruction } from '../../helpers/instruction-search';

import styles from './styles.module.css';

import gameboyDark from '../../../img/gameboy-dark.svg';
import gameboyLight from '../../../img/gameboy-light.svg';

const THEME_STORAGE_KEY = 'sharpboy-opcode-manual-theme';

const emptyInstruction = {
  mnemonic: '',
  type: '',
  flags: {
    CY: '',
    H: '',
    N: '',
    Z: '',
  },
  cycles: '',
  bytes: -1,
  opCode: '',
  description: null,
};

const parseOpCode = (opCode) => {
  const normalized = String(opCode).toUpperCase();
  if (normalized.startsWith('CB') && normalized.length === 4) {
    return { prefix: 0xCB, value: parseInt(normalized.slice(2), 16) };
  }
  return { prefix: 0x00, value: parseInt(normalized, 16) };
};

const getGridLocationForOpCode = (opCode) => {
  const normalized = String(opCode).toUpperCase();
  const isCB = normalized.startsWith('CB') && normalized.length === 4;
  const raw = isCB ? normalized.slice(2) : normalized;
  if (raw.length !== 2) return null;

  const row = parseInt(raw[0], 16);
  const column = parseInt(raw[1], 16);
  if (Number.isNaN(row) || Number.isNaN(column)) return null;

  return { gridIndex: isCB ? 1 : 0, row, column };
};

const compareInstructionsByOpCode = (a, b) => {
  const ap = parseOpCode(a.opCode);
  const bp = parseOpCode(b.opCode);
  if (ap.prefix !== bp.prefix) return ap.prefix - bp.prefix;
  return ap.value - bp.value;
};

const App = () => {
  const instructions = useMemo(() => generateAllInstructions(), []);

  const grids = useMemo(() => {
    const nextGrids = [createInitialOpCodesGrid(), createInitialOpCodesGrid()];
    instructions.forEach((instruction) => {
      setCellForOpCode(instruction.opCode, instruction, nextGrids);
    });
    return nextGrids;
  }, [instructions]);

  const [searchQuery, setSearchQuery] = useState('');
  const [hideNonMatches, setHideNonMatches] = useState(false);
  const [showResultsPanel, setShowResultsPanel] = useState(true);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = window.localStorage?.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
  });

  const [showSidebar, setShowSidebar] = useState(false);
  const [activeInstruction, setActiveInstruction] = useState(emptyInstruction);
  const [activeGridLocation, setActiveGridLocation] = useState(null);
  const lastClickedButtonElRef = useRef(null);
  const sidebarRef = useRef(null);
  const sidebarContainerRef = useRef(null);

  const updateSidebarFromCell = (instruction, buttonRef) => {
    setActiveInstruction(instruction);
    setActiveGridLocation(getGridLocationForOpCode(instruction.opCode));
    lastClickedButtonElRef.current = buttonRef?.current ?? null;
    setShowSidebar(true);
    sidebarRef.current?.focus();
  };

  const hideSidebar = () => {
    setShowSidebar(false);
    lastClickedButtonElRef.current?.focus?.();
  };

  useEffect(() => {
    if (!showSidebar) return () => {};
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      hideSidebar();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showSidebar]);

  useEffect(() => {
    if (!showSidebar) return () => {};

    const onPointerDown = (event) => {
      const sidebarEl = sidebarContainerRef.current;
      const target = event.target;

      if (!(target instanceof Element)) return;
      if (!sidebarEl) return;
      if (sidebarEl.contains(target)) return;
      if (target.closest('[data-open-details="true"]')) return;

      hideSidebar();
    };

    window.addEventListener('pointerdown', onPointerDown, true);
    return () => window.removeEventListener('pointerdown', onPointerDown, true);
  }, [showSidebar]);

  const matchedInstructions = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return [];
    return instructions
      .filter((instruction) => matchesInstruction(instruction, query))
      .slice()
      .sort(compareInstructionsByOpCode);
  }, [instructions, searchQuery]);

  const matchedOpCodesSet = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const set = new Set();
    matchedInstructions.forEach((instruction) => {
      set.add(String(instruction.opCode).toLowerCase());
    });
    return set;
  }, [matchedInstructions, searchQuery]);

  const focusAndScrollToOpCode = (opCode) => {
    const id = `opcode-${String(opCode).toLowerCase()}`;
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    el.focus?.({ preventScroll: true });
  };

  const openFromSearch = (instruction) => {
    focusAndScrollToOpCode(instruction.opCode);
    setActiveInstruction(instruction);
    setActiveGridLocation(getGridLocationForOpCode(instruction.opCode));
    setShowSidebar(true);
    sidebarRef.current?.focus();
  };

  const shouldShowResults = Boolean(searchQuery.trim()) && showResultsPanel;

  useEffect(() => {
    if (!searchQuery.trim()) setShowResultsPanel(true);
  }, [searchQuery]);

  useEffect(() => {
    const nextTheme = isDarkMode ? 'dark' : 'light';
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage?.setItem(THEME_STORAGE_KEY, nextTheme);
  }, [isDarkMode]);

  return (
    <div className={`${styles.page} sharpboy-app`}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <img
              className={styles.logo}
              src={isDarkMode ? gameboyDark : gameboyLight}
              alt="Game Boy"
            />
            <h1 className={styles.title}>Game Boy CPU Opcodes</h1>
          </div>
          <div className={styles.searchRow}>
            <label className={styles.searchLabel} htmlFor="search">
              Search
            </label>
            <input
              id="search"
              className={`${styles.searchInput} nes-input`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mnemonic, opcode (e.g. 3e / 0x3e / cb11), or category…"
              spellCheck={false}
              autoComplete="off"
            />
            <label className={styles.toggle}>
              <input
                type="checkbox"
                className="nes-checkbox"
                checked={hideNonMatches}
                onChange={(e) => setHideNonMatches(e.target.checked)}
                disabled={!searchQuery.trim()}
              />
              <span>Hide non-matches</span>
            </label>
          </div>

          <div className={styles.searchMetaRow}>
            {searchQuery.trim() ? (
              <div className={styles.searchMeta}>
                {matchedInstructions.length} match{matchedInstructions.length === 1 ? '' : 'es'}
              </div>
            ) : (
              <div className={styles.searchMeta}>Tip: type a mnemonic (e.g. LD) or opcode (e.g. 3E).</div>
            )}
            <div className={styles.headerActions}>
              <button
                type="button"
                className={`${styles.modeToggle} nes-btn is-primary`}
                aria-pressed={isDarkMode}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={() => setIsDarkMode((v) => !v)}
              >
                {isDarkMode ? 'Light' : 'Dark'}
              </button>
              {searchQuery.trim() ? (
                <button
                  type="button"
                  className={`${styles.resultsToggle} nes-btn is-primary`}
                  onClick={() => setShowResultsPanel((v) => !v)}
                >
                  {showResultsPanel ? 'Hide results' : 'Show results'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <div className={[styles.contentGrid, shouldShowResults ? null : styles.contentGridFull].filter(Boolean).join(' ')}>
          {shouldShowResults ? (
            <aside
              className={styles.results}
              aria-label="Search results"
            >
              <div className={styles.resultsHeader}>Results</div>
              {matchedInstructions.length === 0 ? (
                <div className={styles.resultsEmpty}>No matches.</div>
              ) : (
                <ul className={styles.resultsList}>
                  {matchedInstructions.slice(0, 300).map((instruction) => (
                    <li key={instruction.opCode} className={styles.resultsItem}>
                      <button
                        type="button"
                        className={`${styles.resultButton} nes-btn is-success`}
                        onClick={() => openFromSearch(instruction)}
                        data-open-details="true"
                      >
                        <span className={styles.resultOpCode}>{`0x${instruction.opCode.toUpperCase()}`}</span>
                        <span className={styles.resultMnemonic}>{instruction.mnemonic}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          ) : null}

          <main aria-label="Opcode tables" role="main" className={styles.tables}>
            <h2 className={styles.sectionHeading}>8-bit opcodes</h2>
            <OpCodeTable
              opCodesGrid={grids[0]}
              caption="Game Boy CPU instructions, organized by opcode"
              setActiveInstruction={updateSidebarFromCell}
              matchedOpCodesSet={matchedOpCodesSet}
              hideNonMatches={hideNonMatches}
              searchQuery={searchQuery.trim()}
              isActiveTable={activeGridLocation?.gridIndex === 0}
              activeRowIndex={activeGridLocation?.gridIndex === 0 ? activeGridLocation?.row : null}
              activeColumnIndex={activeGridLocation?.gridIndex === 0 ? activeGridLocation?.column : null}
            />

            <h2 className={styles.sectionHeading}>16-bit opcodes (0xCB prefix)</h2>
            <OpCodeTable
              opCodesGrid={grids[1]}
              caption='Game Boy CPU instructions for opcodes prefixed by "CB"'
              setActiveInstruction={updateSidebarFromCell}
              matchedOpCodesSet={matchedOpCodesSet}
              hideNonMatches={hideNonMatches}
              searchQuery={searchQuery.trim()}
              isActiveTable={activeGridLocation?.gridIndex === 1}
              activeRowIndex={activeGridLocation?.gridIndex === 1 ? activeGridLocation?.row : null}
              activeColumnIndex={activeGridLocation?.gridIndex === 1 ? activeGridLocation?.column : null}
            />
          </main>
        </div>
      </div>

      {showSidebar ? (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close details"
          onClick={hideSidebar}
        />
      ) : null}

      <DetailsSidebar
        activeInstruction={activeInstruction}
        hideSidebar={hideSidebar}
        isHidden={!showSidebar}
        sidebarRef={sidebarRef}
        sidebarContainerRef={sidebarContainerRef}
      />

      <footer className={styles.footer} aria-label="Attributions">
        <div className={styles.footerInner}>
          <div className={styles.footerTitle}>Attributions</div>
          <ul className={styles.footerList}>
            <li>
              Game Boy SVG from <a href="https://www.svgrepo.com/" target="_blank" rel="noreferrer">svgrepo.com</a>
            </li>
            <li>
              Styling powered by <a href="https://nostalgic-css.github.io/NES.css/" target="_blank" rel="noreferrer">NES.css</a>
            </li>
            <li>
              Opcode data + core generator logic originally from{' '}
              <a href="https://meganesu.github.io/generate-gb-opcodes/" target="_blank" rel="noreferrer">
                meganesu.github.io/generate-gb-opcodes
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default App;

