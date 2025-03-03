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

export type WinState = 'playing' | 'win' | 'lose';

export type MinesweeperContextType = {
    onCellClick: (row: number, col: number) => void;
    onCellFlag: (row: number, col: number) => void;
    resetGame: () => void;
    rows: number;
    cols: number;
    mines: number;
    closedCells: number;
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


const generateInitialCellGrid = (rows: number, cols: number, mines: number): CellInfo[][] => {
    let grid: CellInfo[][] = repeat(repeat({state: 'closed', contents: { type: 'free', neighbors: 0}}, cols), rows);
    let minesPlanted = 0;
    while ( minesPlanted < mines) {
        // Place a mine in a random cell
        const mineRow = Math.floor(Math.random() * rows);
        const mineCol = Math.floor(Math.random() * cols);
        if (grid[mineRow][mineCol].contents.type != 'mine') {
            grid[mineRow][mineCol].contents = { type: 'mine' };
            minesPlanted++;
        }
    }
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
    closedCells: 100,
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

export const createMinesweeperContext = (
    rows: number,
    cols: number,
    mines: number,
): MinesweeperContextType => {

    const [winState, setWinState] = useState<WinState>('playing');
    const [closedCells, setClosedCells] = useState(rows*cols);

    const [cellState, setCellState] = useState<CellInfo[][]>(
        generateInitialCellGrid(rows, cols, mines)
    );

    const onCellClick = useCallback((row: number, col: number) => {
        if (winState != 'playing') return;
        const newCellState = structuredClone(cellState);
        const openedCells = recursiveOpen(newCellState, row, col);
        if (cellState[row][col].contents.type == 'mine') {
            setWinState('lose');
        }
        setClosedCells(cc => cc - openedCells);
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
            } else {
                newCellState[row][col].state = 'flagged';
            }
        }
        setCellState(newCellState);
    }, [closedCells, cellState, winState]);

    const resetGame = useCallback(() => {
        setCellState(generateInitialCellGrid(rows, cols, mines));
        setClosedCells(rows*cols);
        setWinState('playing');
    }, [rows, cols, mines]);

    useEffect(() => {
        console.log('closed cells', closedCells);
        if (closedCells == mines) {
            setCellState(cs => flagRemainingCells(cs));
            setWinState('win');
        }
    }, [mines, closedCells])

    return {
        rows,
        cols,
        mines,
        onCellClick,
        cellState,
        winState,
        closedCells,
        onCellFlag,
        resetGame,
    };
};