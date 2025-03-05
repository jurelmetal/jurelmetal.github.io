import React, { ChangeEventHandler, MouseEventHandler, ReactNode, useCallback, useContext } from "react";
import "./Minesweeper.css";
import { makeRange } from "../utils/makeRange";
import { CellContents, CellState, MinesweeperContext, WinState, createMinesweeperViewModel } from "./MinesweeperViewModel";
import { capitalize } from "../utils/capitalize";

type CellProps = {
    row: number;
    col: number;
}

const getCellContent = (state: CellState, contents: CellContents): ReactNode => {
    switch(state) {
        case 'closed': return <span>&nbsp;</span>;
        case 'flagged': return <span>🚩</span>;
        case 'open': {
            switch(contents.type) {
                case 'mine': return <span>💣</span>;
                case 'free': {
                    return (
                        <span
                            style={{ color: `var(--neighbors-${contents.neighbors})`}}
                        >
                            {contents.neighbors}
                        </span>
                    );
                }
            }
        }
    }
};

const Cell: React.FC<CellProps> = ({row, col}) => {   
    const { onCellClick, onCellFlag, cellState } = useContext(MinesweeperContext);
    const { contents, state } = cellState[row][col];

    const rightClickHandler: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
        e.preventDefault();
        onCellFlag(row, col);
    }, [row, col, onCellFlag]);

    const clickHandler: MouseEventHandler<HTMLButtonElement> = useCallback(() => {
        onCellClick(row, col);
    }, [row, col, onCellClick]);

    return (
        <button
            className="cell"
            data-row={row}
            data-col={col}
            disabled={state != 'closed'}
            onContextMenu={rightClickHandler}
            onClick={clickHandler}
        >
            {getCellContent(state, contents)}
        </button>
    );
};

type MiniInputProps = {
    value: number;
    onChange: (newValue: number) => void;
};

const MiniInput: React.FC<MiniInputProps> = ({ value, onChange }) => {
    const stableOnChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        onChange(parseInt(e.target.value));
    }, [onChange]);
    return (
        <input className='parameter-mini-input' type='number' value={value} onChange={stableOnChange} />
    );
};

type GameParameter = 'rows' | 'cols' | 'mines';

type GameConfiguration = {
    [T in GameParameter]: number;
};

const winStateEmoji: Record<WinState, string> = {
    firstMove: '😀',
    playing: '😀',
    win: '😎',
    lose: '😥',
};

const standardParameters: Record<string, GameConfiguration> = {
    beginner8: { rows: 8, cols: 8, mines: 10 },
    beginner9: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 },
};

const GameGrid: React.FC = () => {
    const { rows, cols, mines, resetGame, winState, setParameters } = useContext(MinesweeperContext);
    const resetButtonLabel = winStateEmoji[winState];

    const onChangeHandler = useCallback((param: GameParameter, newValue: number) => {
        const newRows = param == 'rows' ? newValue : rows;
        const newCols = param == 'cols' ? newValue : cols;
        const newMines = param == 'mines' ? newValue : mines;
        setParameters(newRows, newCols, newMines);
    }, [rows, cols, mines, setParameters]);

    return (
        <div className='minesweeper-container'>
            <p>Playing a 
                <MiniInput value={rows} onChange={(newvalue: number) => onChangeHandler('rows', newvalue)} />
                 by 
                <MiniInput value={cols} onChange={(newvalue: number) => onChangeHandler('cols', newvalue)} />
                board with
                <MiniInput value={mines} onChange={(newvalue: number) => onChangeHandler('mines', newvalue)} />
                mines</p>
            <div className='minesweeper-standard-buttons'>
                {Object.entries(standardParameters).map(([key, { rows, cols, mines }]) => (
                    <button onClick={() => setParameters(rows, cols, mines)}>
                        {capitalize(key)}
                    </button>
                ))}
            </div>
            <div className='game-menu'>
                <button className='game-reset-button' onClick={resetGame}>
                    {resetButtonLabel}
                </button>
            </div>
            <div className='game-grid'>
                <div className='game-grid-border'>
                {makeRange(rows).map((row) => (
                    <div className='game-grid-row' key={`row-${row}`}>
                        {makeRange(cols).map((col) => (
                            <Cell row={row} col={col} key={`cell-${row}-${col}`} />
                        ))}
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
};

export const Minesweeper = () => {
    const viewModel = createMinesweeperViewModel();
    return (
        <MinesweeperContext.Provider value={viewModel}>
            <GameGrid />
        </MinesweeperContext.Provider>
    );
};