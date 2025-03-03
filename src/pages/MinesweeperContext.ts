import { createContext, useCallback, useMemo, useState } from "react";
import { copyValue } from "../utils/copyValue";
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

export type WinState = 'playing' | 'win' | 'lose';

export type MinesweeperContextType = {
    onCellClick: (row: number, col: number) => void;
    onCellFlag: (row: number, col: number) => void;
    resetGame: () => void;
    rows: number;
    cols: number;
    mines: number;
    flaggedCells: number;
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
    let count = 0;
    for (const [auxRow, auxCol] of neighborPairs(grid.length, grid[0].length, row, col)) {
        if (grid[auxRow][auxCol].contents.type == 'mine') {
            count++;
        }
    }
    return count;
};


const generateInitialCellGrid = (rows: number, cols: number, mines: number): CellInfo[][] => {
    let grid: CellInfo[][] = copyValue(copyValue({state: 'closed', contents: { type: 'free', neighbors: 0}}, cols), rows);
    makeRange(mines).forEach(() => {
        // Place a mine in a random cell
        const mineRow = Math.floor(Math.random() * rows);
        const mineCol = Math.floor(Math.random() * cols);
        grid[mineRow][mineCol].contents = { type: 'mine' };
    });
    // After placing the mines, calculate neighbors for each cell
    makeRange(rows).forEach((row) => {
        makeRange(cols).forEach((col) => {
            if (grid[row][col].contents.type == 'free') {
                grid[row][col].contents.neighbors = countNeighbors(grid, row, col);
            }
        });
    });
    return grid;
};

const defaultMinesweeperContext: MinesweeperContextType = {
    onCellClick: (row, col) => console.log('click', row, col),
    onCellFlag: (row, col) => console.log('flag', row, col),
    resetGame: () => {},
    rows: 10,
    cols: 10,
    mines: 10,
    flaggedCells: 0,
    cellState: [],
    winState: 'playing',    
};

export const MinesweeperContext = createContext(defaultMinesweeperContext);

function recursiveOpen(cellState: CellInfo[][], row: number, col: number) {
    const { contents, state } = cellState[row][col];
    if (state != 'closed') return;
    cellState[row][col].state = 'open';
    if (contents.type == 'free' && contents.neighbors == 0) {
        for (const [auxRow, auxCol] of neighborPairs(cellState.length, cellState[0].length, row, col)) {
            if (cellState[auxRow][auxCol].state == 'closed') {
                recursiveOpen(cellState, auxRow, auxCol);
            }
        }
    }
} 


const flagCell = (cellState: CellInfo[][], row: number, col: number): [CellInfo[][], number] => {
    // First, copy
    const newCellState = structuredClone(cellState);
    const { state } = newCellState[row][col];
    if (state != 'open') {
        newCellState[row][col].state = state == 'flagged' ? 'closed' : 'flagged';        
        return [newCellState, cellState[row][col].state == 'flagged' ? 1 : -1];
    }
    return [newCellState, 0];
   
}

export const createMinesweeperContext = (
    rows: number,
    cols: number,
    mines: number,
): MinesweeperContextType => {

    const [winState, setWinState] = useState<WinState>('playing');
    const [flaggedCells, setFlaggedCells] = useState(0);

    const [cellState, setCellState] = useState<CellInfo[][]>(
        generateInitialCellGrid(rows, cols, mines)
    );

    const onCellClick = useCallback((row: number, col: number) => {
        if (winState != 'playing') return;
        const newCellState = structuredClone(cellState);
        recursiveOpen(newCellState, row, col);
        if (newCellState[row][col].contents.type == 'mine') {
            setWinState('lose');
        }
        setCellState(newCellState);
    }, [cellState, winState]);

    const onCellFlag = useCallback((row: number, col: number) => {
        if (winState != 'playing') return;
        // First, copy
        const newCellState = structuredClone(cellState);
        const { state } = newCellState[row][col];
        if (state != 'open') {
            if (state == 'flagged') {
                newCellState[row][col].state = 'closed';
                setFlaggedCells(fc => fc - 1);
            } else {
                newCellState[row][col].state = 'flagged';
                setFlaggedCells(fc => fc + 1);
                if (flaggedCells + 1 == mines) {
                    setWinState('win');
                }
            }
        }
        setCellState(newCellState);
    }, [cellState, winState, flaggedCells]);

    const resetGame = useCallback(() => {
        setCellState(generateInitialCellGrid(rows, cols, mines));
        setWinState('playing');
        setFlaggedCells(0);
    }, [rows, cols, mines]);

    return {
        rows,
        cols,
        mines,
        onCellClick,
        cellState,
        winState,
        flaggedCells,
        onCellFlag,
        resetGame,
    };
};