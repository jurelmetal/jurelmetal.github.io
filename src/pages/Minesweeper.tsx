import React, { MouseEventHandler, useCallback, useContext } from "react";
import "./Minesweeper.css";
import { makeRange } from "../utils/makeRange";
import { CellContents, CellState, MinesweeperContext, createMinesweeperContext } from "./MinesweeperContext";

type CellProps = {
    row: number;
    col: number;
}

const getCellContent = (state: CellState, contents: CellContents): string => {
    const buttonContent = contents.type == 'mine' 
    ? '💣' 
    : (contents.neighbors == 0 ? ' ' : `${contents.neighbors}`);
    switch(state) {
        case 'closed': return ' ';
        case 'flagged': return '🚩';
        case 'open': return buttonContent;
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

    const cellContent = getCellContent(state, contents);
    return (
        <button
            className="cell"
            data-row={row}
            data-col={col}
            disabled={state != 'closed'}
            onContextMenu={rightClickHandler}
            onClick={clickHandler}
        >
            {cellContent}
        </button>
    );
};

const GameGrid: React.FC = () => {
    const { rows, cols, mines, resetGame, winState } = useContext(MinesweeperContext);
    const resetButtonLabel = winState == 'playing' ? '😃' : winState == 'win' ? '😎' : '😥';    
    return (
        <div className='minesweeper-container'>
            <p>Playing a {rows} by {cols} board with {mines} mines</p>
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
    const gameContext = createMinesweeperContext(10, 10, 10);
    return (
        <MinesweeperContext.Provider value={gameContext}>
            <GameGrid />
        </MinesweeperContext.Provider>
    );
};