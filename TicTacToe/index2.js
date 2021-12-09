let pattern = [
    0,0,0,
    0,0,0,
    0,0,0
];

let color = 1;

// 渲染视图
function show(pattern) {
  let board = document.getElementById("board");
  board.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let cell = document.createElement("div");
      const patternItem = pattern[i * 3 + j];
      cell.classList.add("cell");
      cell.innerText = patternItem === 2 ? "X" : patternItem === 1 ? "O" : "";
      cell.addEventListener("click", () => useMove(j, i));
      board.appendChild(cell);
    }
    board.appendChild(document.createElement("br"));
  }
}

function useMove(x, y) {
  pattern[y * 3 + x] = color;
  if (check(pattern, color)) {
    alert(color === 2 ? "X is winner!" : "O is winner");
  }
  color = 3 - color;
  show(pattern);
  computerMove()
//   if (wilWin(pattern, color)) {
//     console.log(color === 2 ? "X is winner!" : "O is winner");
//   }
}

function computerMove(){
    let choice = bestChoice(pattern,color);
    console.log(choice);
    if(choice.point){
        pattern[choice.point[1] * 3 + choice.point[0]] = color;
    }
    if (check(pattern, color)) {
        alert(color === 2 ? "X is winner!" : "O is winner");
    }
    color = 3 - color;
    show(pattern);
}

// 检查胜负
function check(pattern, color) {
  for (let i = 0; i < 3; i++) {
    let win = true;
    for (let j = 0; j < 3; j++) {
      if (pattern[i * 3 + j] !== color) {
        win = false;
      }
    }
    if (win) return true;
  }
  for (let i = 0; i < 3; i++) {
    let win = true;
    for (let j = 0; j < 3; j++) {
      if (pattern[j * 3 +i] !== color) {
        win = false;
      }
    }
    if (win) return true;
  }
  {
    let win = true;
    for (let j = 0; j < 3; j++) {
      if (pattern[j * 3 + j] !== color) {
        win = false;
      }
    }
    if (win) return true;
  }
  {
    let win = true;
    for (let j = 0; j < 3; j++) {
      if (pattern[j * 3 + 2 - j] !== color) {
        win = false;
      }
    }
    if (win) return true;
  }
  return false;
}

function clone(pattern) {
  return Object.create(pattern);
}

function wilWin(pattern, color) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (pattern[i * 3 + j] !== 0) continue;
      const tmp = clone(pattern);
      tmp[i * 3 + j] = color;
      if (check(tmp, color)) return [i, j];
    }
  }
  return null;
}

function bestChoice(pattern, color) {
  let p;
  if ((p = wilWin(pattern, color))) {
    return {
      point: p,
      result: 1,
    };
  }
  let result = -2;
  let point = null;
  outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (pattern[i * 3 + j]) {
        continue;
      }
      let tmp = clone(pattern);
      tmp[i * 3 + j] = color;
      let r = bestChoice(tmp, 3 - color).result;
      if (-r > result) {
        result = -r;
        point = [j, i];
      }
      if (result === 1) {
        break outer;
      }
    }
  }
  return {
    point,
    result: point ? result : 0,
  };
}

show(pattern);
