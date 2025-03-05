import React, { ChangeEventHandler, MouseEventHandler, ReactNode, useCallback, useContext } from "react";
import "./Minesweeper.css";
import { makeRange } from "../utils/makeRange";
import { CellContents, CellState, MinesweeperContext, createMinesweeperViewModel } from "./MinesweeperViewModel";

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

type ChangeProp = 'rows' | 'cols' | 'mines';

const GameGrid: React.FC = () => {
    const { rows, cols, mines, resetGame, winState, setParameters } = useContext(MinesweeperContext);
    const resetButtonLabel = winState == 'playing' ? '😃' : winState == 'win' ? '😎' : '😥';

    const onChangeHandler = useCallback((prop: ChangeProp, newValue: number) => {
        const newRows = prop == 'rows' ? newValue : rows;
        const newCols = prop == 'cols' ? newValue : cols;
        const newMines = prop == 'mines' ? newValue : mines;
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