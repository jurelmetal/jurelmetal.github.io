import { createContext, useCallback, useEffect, useState } from "react";
import { repeat } from "../utils/repeat";
import { makeRange } from "../utils/makeRange";

export type BaseCell = {
    type: string;
}

export type MineCell = BaseCell & {
    type: 'mine';
};

export type FreeCell = BaseCell & {
    type: 'free';
    neighbors: number;
}

export type CellContents = MineCell | FreeCell;

export type CellState = 'flagged' | 'open' | 'closed';
export type CellInfo = {
    contents: CellContents;    
    state: CellState;
}

export type WinState = 'firstMove' | 'playing' | 'win' | 'lose';

const canMove = (winState: WinState): boolean => winState == 'firstMove' || winState == 'playing';

const MAX_ROWS = 20;
const MAX_COLS = 30;
const MAX_MINES = 100;

export type MinesweeperViewModel = {
    onCellClick: (row: number, col: number) => void;
    onCellFlag: (row: number, col: number) => void;
    setParameters: (rows: number, cols: number, mines: number) => void;
    resetGame: () => void;
    rows: number;
    cols: number;
    mines: number;
    closedCells: number;
    flagsSet: number;
    winState: WinState;
    cellState: CellInfo[][];
};


type Pair = [number, number];

const neighborPairs = (rows: number, cols: number, targetRow: number, targetCol: number): Pair[] => {    
    let elems: Pair[] = [];
    const [rowStart, rowEnd] = [Math.max(0, targetRow - 1), Math.min(targetRow + 1, rows - 1)];    
    const [colStart, colEnd] = [Math.max(0, targetCol - 1), Math.min(targetCol + 1, cols - 1)];
    makeRange(rowStart, rowEnd, true).forEach((row) => {
        makeRange(colStart, colEnd, true).forEach((col) => {
            if (row != targetRow || col != targetCol) {
                elems.push([row, col]);
            }
        });
    });
    return elems;
}

const countNeighbors = (grid: CellInfo[][], row: number, col: number): number => {
    return neighborPairs(grid.length, grid[0].length, row, col)
        .filter(([auxRow, auxCol]) => grid[auxRow][auxCol].contents.type == 'mine')
        .length;
};


const getPlantedGrid = (grid: CellInfo[][], mines: number, initialMoveX: number, initialMoveY: number): CellInfo[][] => {
    let minesPlanted = 0;
    const gridRows = grid.length;
    const gridCols = grid[0].length;
    while ( minesPlanted < mines) {
        // Place a mine in a random cell
        const mineRow = Math.floor(Math.random() * gridRows);
        const mineCol = Math.floor(Math.random() * gridCols);
        if (mineRow == initialMoveX && mineCol == initialMoveY) continue;
        if (grid[mineRow][mineCol].contents.type == 'mine') continue;
        grid[mineRow][mineCol].contents = { type: 'mine' };
        minesPlanted++;
    }
    // After placing the mines, calculate neighbors for each cell
    makeRange(gridRows).forEach((row) => {
        makeRange(gridCols).forEach((col) => {
            if (grid[row][col].contents.type == 'free') {
                grid[row][col].contents.neighbors = countNeighbors(grid, row, col);
            }
        });
    });
    return grid;
};

const generateEmptyCellGrid = (rows: number, cols: number): CellInfo[][] => {
    return repeat(repeat({state: 'closed', contents: { type: 'free', neighbors: 0}}, cols), rows);
};

const defaultMinesweeperContext: MinesweeperViewModel = {
    onCellClick: (row, col) => console.log('click', row, col),
    onCellFlag: (row, col) => console.log('flag', row, col),
    resetGame: () => {},
    setParameters: (_r, _c, _m) => {},
    rows: 10,
    cols: 10,
    mines: 10,
    closedCells: 100,
    flagsSet: 0,
    cellState: [],
    winState: 'playing',    
};

export const MinesweeperContext = createContext(defaultMinesweeperContext);

function recursiveOpen(cellState: CellInfo[][], row: number, col: number): number {
    const { contents, state } = cellState[row][col];
    if (state != 'closed') return 0;
    cellState[row][col].state = 'open';
    let openedCells = 1;
    if (contents.type == 'free' && contents.neighbors == 0) {
        for (const [auxRow, auxCol] of neighborPairs(cellState.length, cellState[0].length, row, col)) {
            if (cellState[auxRow][auxCol].state == 'closed') {
                openedCells += recursiveOpen(cellState, auxRow, auxCol);
            }
        }
    }
    return openedCells;
} 

const flagRemainingCells = (cellState: CellInfo[][]): CellInfo[][] => {
    const newCellState = structuredClone(cellState);
    for (const row of newCellState) {
        for (const cell of row) {
            if (cell.state === 'closed') {
                cell.state = 'flagged';
            }
        }
    }
    return newCellState;
}

export const createMinesweeperViewModel = (): MinesweeperViewModel => {

    const [rows, setRows] = useState(10);
    const [cols, setCols] = useState(10);
    const [mines, setMines] = useState(10);

    const [flagsSet, setFlagsSet] = useState(0);

    const [winState, setWinState] = useState<WinState>('firstMove');
    const [closedCells, setClosedCells] = useState(rows*cols);

    const [cellState, setCellState] = useState<CellInfo[][]>(
        generateEmptyCellGrid(rows, cols)
    );

    const onCellClick = useCallback((row: number, col: number) => {
        if (!canMove(winState)) return;
        let newCellState;
        if (winState == 'firstMove') {
            newCellState = getPlantedGrid(structuredClone(cellState), mines, row, col);        
            setWinState('playing');
        } else {
            newCellState = structuredClone(cellState);
        }
        const openedCells = recursiveOpen(newCellState, row, col);
        if (cellState[row][col].contents.type == 'mine') {
            setWinState('lose');
        }
        setClosedCells(cc => cc - openedCells);
        setCellState(newCellState);
    }, [mines, cellState, winState]);

    const onCellFlag = useCallback((row: number, col: number) => {
        if (!canMove(winState)) return;
        // First, copy
        const newCellState = structuredClone(cellState);
        const { state } = newCellState[row][col];
        if (state != 'open') {
            if (state == 'flagged') {
                newCellState[row][col].state = 'closed';
                setFlagsSet(fs => fs - 1);
            } else {
                if (flagsSet >= mines) return;
                newCellState[row][col].state = 'flagged';
                setFlagsSet(fs => fs + 1);
            }
        }
        setCellState(newCellState);
    }, [flagsSet, mines, closedCells, cellState, winState]);

    const resetGameInternal = useCallback((newRows: number, newCols: number) => {
        setCellState(generateEmptyCellGrid(newRows, newCols));
        setClosedCells(newRows*newCols);
        setWinState('firstMove');
        setFlagsSet(0);
    }, []);

    const resetGame = useCallback(() => {
        resetGameInternal(rows, cols);
    }, [rows, cols]);

    useEffect(() => {
        if (canMove(winState) && closedCells == mines) {
            setCellState(cs => flagRemainingCells(cs));
            setWinState('win');
        }
    }, [winState, mines, closedCells]);

    const setParameters = useCallback((newRows: number, newCols: number, newMines: number) => {
        if (newRows > 0 && newRows <= MAX_ROWS 
            && newCols > 0 && newCols <= MAX_COLS 
            && newMines > 0 && newMines <= MAX_MINES
            && newMines < newRows*newCols) {
            setRows(newRows);
            setCols(newCols);
            setMines(newMines);
            resetGameInternal(newRows, newCols);
        } 
    }, [resetGame]);

    return {
        rows,
        cols,
        mines,
        onCellClick,
        cellState,
        winState,
        closedCells,
        flagsSet,
        onCellFlag,
        resetGame,
        setParameters
    };
};