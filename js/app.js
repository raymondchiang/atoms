var width = 6
var height = 6
var MAX_RECURSIVE = 1000
var current_recursive = 0

class Cell {
  constructor(x, y, amount, owner) {
    this.x = x
    this.y = y
    this.amount = amount

    this.changeOwner(owner)

    var capacity = 4
    if (x <= 0 || x >= width - 1)
      capacity--;
    if (y <= 0 || y >= height - 1)
      capacity--;
    this.capacity = capacity
  }

  changeOwner(owner) {
    if (owner) {
      this.owner = owner
      this.color = owner.color
    }
  }


  nearbyCells() {
    var cells = []

    // UP
    if (this.y > 0)
      cells.push(app.getCell(this.x, this.y - 1))
    // RIGHT
    if (this.x < width - 1)
      cells.push(app.getCell(this.x + 1, this.y))
    // DOWN
    if (this.y < height - 1)
      cells.push(app.getCell(this.x, this.y + 1))
    // LEFT
    if (this.x > 0)
      cells.push(app.getCell(this.x - 1, this.y))

    return cells
  }

  add() {
    current_recursive++;
    this.amount++;
  }

  check() {
    return new Promise((resolve, rejcet) => {
      if (this.amount >= this.capacity) {
        setTimeout(() => {
          this.amount -= this.capacity
          if (current_recursive >= MAX_RECURSIVE) {
            alert('MAX_RECURSIVE reached!')
            resolve()
          }
          var cells = this.nearbyCells()
          for (var c of cells) {
            c.changeOwner(this.owner)
            c.add()
          }

          var check = (i) => {
            cells[i].check().then(() => {
              if (i + 1 < cells.length)
                check(i + 1)
              else resolve()
            })
          }
          check(0)
        }, 300)
      } else
        resolve()
    })
  }


}

class Player {
  constructor(id, name, color) {
    this.name = name
    this.id = id
    this.color = color
  }
}


var players = [
  new Player(0, 'Raymond', '#349bcf'),
  new Player(1, 'Anthony', '#d97730')
]

var app = new Vue({
  el: '#app',
  data: {
    placable: true,
    width: width,
    height: height,
    players: players,
    currentPlayerIndex: 0,
    currentPlayer: players[0],
    table: createTable(width, height)
  },
  methods: {
    nextPlayer: function () {
      this.currentPlayerIndex++;
      this.currentPlayerIndex %= this.players.length
      this.currentPlayer = this.players[this.currentPlayerIndex]
    },
    place: function (cell) {
      if (this.placable &&
        (cell.amount == 0 || cell.owner == this.currentPlayer)) {
        current_recursive = 0
        this.placable = false
        cell.changeOwner(this.currentPlayer)
        cell.add()
        cell.check().then(() => {
          this.placable = true
          this.nextPlayer()
        })
      }
    },
    placeAt: function (x, y) {
      this.place(this.getCell(x, y))
    },
    getCell: function (x, y) {
      return this.table[y][x]
    }
  }
})

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function createTable(w, h) {
  var table = []
  for (var y = 0; y < h; y++) {
    var row = []
    for (var x = 0; x < w; x++) {
      row.push(new Cell(x, y, 0))
    }
    table.push(row)
  }
  return table
}