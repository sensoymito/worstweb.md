math.randomseed(os.time())

local cells = {}
local grid = 13
local layers = {}
local hoveredCell = nil
local hoveredBoard = nil
local kit = require "lib.sweeper"

function love.load()
    love.graphics.setDefaultFilter("nearest", "nearest")
    love.graphics.setBackgroundColor(1, 1, 1, 1)
    cells.cell_one = love.graphics.newImage("img/cells/one.png")
    cells.cell_two = love.graphics.newImage("img/cells/two.png")
    cells.cell_three = love.graphics.newImage("img/cells/three.png")
    cells.cell_four = love.graphics.newImage("img/cells/four.png")
    cells.cell_five = love.graphics.newImage("img/cells/five.png")
    cells.cell_six = love.graphics.newImage("img/cells/six.png")
    cells.cell_seven = love.graphics.newImage("img/cells/seven.png")
    cells.cell_eight = love.graphics.newImage("img/cells/eight.png")
    cells.cell_nine = love.graphics.newImage("img/cells/nine.png")
    cells.cell_open = love.graphics.newImage("img/cells/open.png")
    cells.cell_hidden = love.graphics.newImage("img/cells/hidden.png")
    cells.cell_frag = love.graphics.newImage("img/cells/frag.png")
    cells.cell_bomb = love.graphics.newImage("img/cells/bomb.png")

    local cellW = cells.cell_open:getWidth()
    local cellH = cells.cell_open:getHeight()

    -- 複数 board を層に重ねる（同じ位置に配置してセルをぴったり重ねる）
    table.insert(layers, kit.createBoard(grid, cellW, cellH, 0, 0, true)) -- 下層：空セルは消さない
    table.insert(layers, kit.createBoard(grid, cellW, cellH, 0, 0, true))  -- 中層：空セルは消す
    table.insert(layers, kit.createBoard(grid, cellW, cellH, 0, 0, true))  -- 中層：空セルは消す
    table.insert(layers, kit.createBoard(grid, cellW, cellH, 0, 0, true))  -- 上層：空セルは消す
end

function love.draw()
    -- 奥から手前へ描画。下の層ほど暗くする
    for i, board in ipairs(layers) do
        if board.visible ~= false then
            local brightness = i / #layers
            kit.drawBoard(board, cells, brightness)
        end
    end

    -- ホバー効果（最前面の board のセル）
    if hoveredCell and hoveredCell.state == "hidden" and hoveredBoard and not hoveredBoard.gameover then
        love.graphics.setColor(0.5, 0.5, 0.5, 0.3)
        love.graphics.rectangle("fill", hoveredBoard.x + hoveredCell.x, hoveredBoard.y + hoveredCell.y, hoveredCell.w, hoveredCell.h)
        love.graphics.setColor(1, 1, 1, 1)
    end
end

function love.update(dt)
    hoveredCell = nil
    hoveredBoard = nil
    -- 手前の visible な board から優先的に判定
    -- 解決済みレイヤー、または空の開いたセルはマウスを通して下のレイヤーへ
    for i = #layers, 1, -1 do
        local board = layers[i]
        if board.visible ~= false and not board.solved then
            local cell = kit.screenToCellOnBoard(love.mouse.getX(), love.mouse.getY(), board)
            if cell then
                if cell.state == "open" and cell.count == 0 then
                    -- 消えたセルなので下のレイヤーを確認
                else
                    hoveredCell = cell
                    hoveredBoard = board
                    break
                end
            end
        end
    end
end

function love.keypressed(key)
    if key == "r" then
        for _, board in ipairs(layers) do
            kit.resetBoard(board)
        end
    end
end

function love.mousepressed(x, y, button)
    if not hoveredBoard or hoveredBoard.gameover or hoveredBoard.solved then return end

    local board = hoveredBoard
    local cell = hoveredCell
    if not cell then return end

    if board.firstclick then
        board.firstclick = false
        kit.plantBomb(board.flatCells, 15, cell)

        for _, c in ipairs(board.flatCells) do
            kit.setCellNumber(c, board.flatCells)
        end
    end

    if button == 1 then
        -- 左クリック：セルを開く
        if cell.state == "hidden" then
            local hitBomb = kit.revealCell(cell.id, board.flatCells)
            if hitBomb then
                board.gameover = true
                kit.revealAllBombs(board.flatCells)
            elseif kit.isSolved(board) then
                board.solved = true
            end
        end
    elseif button == 2 then
        -- 右クリック：旗のON/OFF
        if cell.state == "hidden" then
            cell.state = "flagged"
        elseif cell.state == "flagged" then
            cell.state = "hidden"
        end
    end
end
