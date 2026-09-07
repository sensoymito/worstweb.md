import kaplay, { type Game, type GameObj } from "kaplay"

export function startgame() {
	const canvas = document.getElementById("game") as HTMLCanvasElement | null

	const k = kaplay({
		canvas: canvas ?? undefined,
		width: 640,
		height: 640
	})

	k.setBackground(k.WHITE)

	window.addEventListener("contextmenu", (e) => e.preventDefault())

	const cells = import.meta.glob("./assets/cells/*.png", {
		eager: true,
		import: "default",
	}) as Record<string, string>

	for (const [path, url] of Object.entries(cells)) {
		const name = path.match(/\/(\w+)\.png$/)![1]
		k.loadSprite(name, url)
	}


	const number_sprites: Record<number, string> = {
		0: "open",
		1: "one",
		2: "two",
		3: "three",
		4: "four",
		5: "five",
		6: "six",
		7: "seven",
		8: "eight",
	}

	const colorList = {
		white: [255, 255, 255],
		black: [155, 155, 155]
	}

	type Cell = GameObj & {
		isBomb: boolean
		neighborBombs: number
		isRevealed: boolean
		isFlagged: boolean
	}

	const cellGrid: number = 9

	const cellState = (isBomb: boolean) => {
		return {
			isBomb,
			neighborBombs: 0,
			isRevealed: false,
			isFlagged: false,
		}
	}

	const plantBomb = (board: GameObj[]) => {
		for (let n = 0; n < 10; n++) {
			board[Math.floor(Math.random() * board.length)].isBomb = true
		}
	}

	const neighborCell = (cell: GameObj) => {

	}
	const generateCell = (sprite: string, grid: number, depth: number = 1, color: number[] = [1, 1, 1], clickEvent: Function) => {
		const board = []
		for (let x = 0; x < grid; x++) {
			for (let y = 0; y < grid; y++) {

				let id = y * grid + x
				const cell = k.add([
					k.sprite(sprite),
					k.area(),
					k.pos(x * 64, y * 64),
					k.color(k.rgb(color[0], color[1], color[2])),
					k.z(depth),
					`cell${id}`,
					cellState(false)
				]) as Cell

				board[id] = cell

				cell.onClick(() => {
					clickEvent(cell)
				})
			}
		}
		plantBomb(board)
	}



	generateCell("hidden", cellGrid, 1, colorList.black, (cell: GameObj) => {
		if(cell.isBomb == true) cell.use(k.color(k.RED))
			else cell.use(k.sprite("open"))
	})
}//http://localhost:5173/