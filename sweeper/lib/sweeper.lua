local kit = {}

---セルのイメージを返す
function kit.cellImage(_cell, _cells, _board_cells)
    if _cell.state == "flagged" then
        return _cells.cell_frag
    end
    if _cell.state == "hidden" then
        return _cells.cell_hidden
    end

    -- 以下は state == "open"
    if _cell.isBomb then
        return _cells.cell_bomb -- 赤ティントは _cell.color で適用済み
    end

    if _cell.count == 0 then
        kit.revealCell(_cell.id, _board_cells)
        return nil -- 何もないセルは描画しない
    elseif _cell.count == 1 then
        return _cells.cell_one
    elseif _cell.count == 2 then
        return _cells.cell_two
    elseif _cell.count == 3 then
        return _cells.cell_three
    elseif _cell.count == 4 then
        return _cells.cell_four
    elseif _cell.count == 5 then
        return _cells.cell_five
    elseif _cell.count == 6 then
        return _cells.cell_six
    elseif _cell.count == 7 then
        return _cells.cell_seven
    elseif _cell.count == 8 then
        return _cells.cell_eight
    end
end

function kit.revealCell(_cellid, _board_cells)
    local cell = _board_cells[_cellid]
    if not cell or cell.state ~= "hidden" then return false end
    cell.state = "open"
    cell.opened = true
    -- count == 0 なら隣接セルに再帰伝播（空白セル拡張）
    if cell.count == 0 then
        for _, c in ipairs(_board_cells) do
            if c.state ~= "open" and not c.isBomb
                and math.abs(c.gx - cell.gx) <= 1
                and math.abs(c.gy - cell.gy) <= 1
                and c.id ~= cell.id then
                kit.revealCell(c.id, _board_cells)
            end
        end
    end
    return cell.isBomb
end

function kit.revealAllBombs(_board_cells)
    for _, cell in ipairs(_board_cells) do
        if cell.isBomb then
            cell.state = "open"
            cell.opened = true
        end
    end
end

function kit.getBombByRange(_cell, _board_cells)
    local count = 0
    for _, cell in ipairs(_board_cells) do
        if cell.isBomb
            and math.abs(cell.gx - _cell.gx) <= 1
            and math.abs(cell.gy - _cell.gy) <= 1
            and cell ~= _cell then
            count = count + 1
        end
    end
    return count
end

function kit.setCellNumber(_cell, _board_cells)
    _cell.count = kit.getBombByRange(_cell, _board_cells)
end

---新しい board インスタンスを生成する
-- _eraseEmptyCells: count==0 の開いたセルを描画しない（省略時は true）
function kit.createBoard(_grid, _cellW, _cellH, _offsetX, _offsetY, _eraseEmptyCells)
    local board = {
        grid = _grid,
        cellW = _cellW,
        cellH = _cellH,
        x = _offsetX or 0,
        y = _offsetY or 0,
        cells = {},
        flatCells = {},
        firstclick = true,
        gameover = false,
        solved = false,
        eraseEmptyCells = _eraseEmptyCells ~= false,
    }

    for y = 1, _grid do
        board.cells[y] = {}
        for x = 1, _grid do
            local cell = {
                id = (y - 1) * _grid + x,
                gx = x,
                gy = y,
                x = (x - 1) * _cellW,
                y = (y - 1) * _cellH,
                w = _cellW,
                h = _cellH,
                color = { 1, 1, 1 },
                opened = false,
                isBomb = false,
                count = 0,
                state = "hidden",
            }
            board.cells[y][x] = cell
            table.insert(board.flatCells, cell)
        end
    end

    return board
end

---board が解決済みかどうか（爆弾以外がすべて開かれたか）
function kit.isSolved(_board)
    for _, cell in ipairs(_board.flatCells) do
        if not cell.isBomb and cell.state ~= "open" then
            return false
        end
    end
    return true
end

---board を描画する（_brightness: 0.0〜1.0、省略時は 1.0）
function kit.drawBoard(_board, _cells, _brightness)
    if _board.solved then return end
    _brightness = _brightness or 1.0
    love.graphics.setColor(_brightness, _brightness, _brightness, 1)
    for y = 1, _board.grid do
        for x = 1, _board.grid do
            local cell = _board.cells[y][x]
            local img = kit.cellImage(cell, _cells, _board.flatCells)
            if img then
                love.graphics.draw(img, _board.x + cell.x, _board.y + cell.y, 0)
            elseif not _board.eraseEmptyCells then
                love.graphics.draw(_cells.cell_open, _board.x + cell.x, _board.y + cell.y, 0)
            end
        end
    end
    love.graphics.setColor(1, 1, 1, 1)
end

---マウス座標から board 内のセルを取得する
function kit.screenToCellOnBoard(_px, _py, _board)
    local relX = _px - _board.x
    local relY = _py - _board.y
    local gx = math.floor(relX / _board.cellW) + 1
    local gy = math.floor(relY / _board.cellH) + 1
    if gx >= 1 and gx <= _board.grid and gy >= 1 and gy <= _board.grid then
        return _board.cells[gy][gx]
    end
    return nil
end

function kit.resetBoard(_board)
    _board.firstclick = true
    _board.gameover = false
    _board.solved = false
    for _, cell in ipairs(_board.flatCells) do
        cell.state = "hidden"
        cell.opened = false
        cell.isBomb = false
        cell.count = 0
    end
end

function kit.plantBomb(_board_cells, _amount, _ignore)
    local valid = {}
    for _, cell in ipairs(_board_cells) do
        if cell ~= _ignore and not cell.isBomb then
            table.insert(valid, cell)
        end
    end
    for i = 1, math.min(_amount, #valid) do
        local idx = math.random(#valid)
        valid[idx].isBomb = true
        table.remove(valid, idx)
    end
end

return kit
