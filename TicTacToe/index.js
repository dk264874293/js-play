let pattern = [
    [0,0,0],
    [0,0,0],
    [0,0,0]
]

let color = 1

// 渲染视图
function show(pattern) {
  let board = document.getElementById("board");
  board.innerHTML = ''
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let cell = document.createElement("div");
      const patternItem = pattern[i][j];
      cell.classList.add("cell");
      cell.innerText = patternItem === 2 ? "X" : patternItem === 1 ? "O" : "";
      cell.addEventListener("click", () => move(j,i));
      board.appendChild(cell);
    }
    board.appendChild(document.createElement("br"));
  }
}

function move(x,y){
    pattern[y][x] = color
    if (check(pattern, color)) {
      alert(color === 2 ? "X is winner!" : "O is winner");
    }
    color = 3 - color;
    show(pattern);
    if (wilWin(pattern, color)) {
      console.log(color === 2 ? "X is winner!" : "O is winner");
    }
   
}
// 检查胜负
function check(pattern, color) {
  for (let i = 0; i < 3; i++) {
    let win = true;
    for (let j = 0; j < 3; j++) {
      if (pattern[i][j] !== color) {
        win = false;
      }
    }
    if (win) return true;
  }
  for (let i = 0; i < 3; i++) {
    let win = true;
    for (let j = 0; j < 3; j++) {
      if (pattern[j][i] !== color) {
        win = false;
      }
    }
    if (win) return true;
  }
  {
    let win = true;
    for (let j = 0; j < 3; j++) {
      if (pattern[j][j] !== color) {
        win = false;
      }
    }
    if (win) return true;
  }
  {
    let win = true;
    for (let j = 0; j < 3; j++) {
      if (pattern[j][2 - j] !== color) {
        win = false;
      }
    }
    if (win) return true;
  }
  return false;
}

function clone(pattern){
  return JSON.parse(JSON.stringify(pattern));
}

function wilWin(pattern, color) {
  for(let i = 0 ;i<3;i++){
    for(let j = 0;j<3;j++){
      if(pattern[i][j] !== 0) continue
      const tmp = clone(pattern);
      tmp[i][j] = color;
      if (check(tmp, color)) return [i,j];
    }
  }
  return null
}

function bestChoice(pattern,color){
  let p;
  if ((p = wilWin(pattern, color))) {
    return {
      point: p,
      result: 1,
    };
  }
  let result = -2
  let point = null
  outer:for(let i = 0; i < 3 ;i++){
    for(let j = 0; j < 3;j++){
      if(pattern[i][j]){
        continue
      }
      let tmp = clone(pattern);
      tmp[i][j] = color;
      let r = bestChoice(tmp,3 - color).result
      if(-r > result){
        result = -r
        point = [j,i]
      }
      if(result === 1){
        break outer
      }
    }
  }
  return {
    point,
    result: point ? result : 0
  }
}


show(pattern);
console.log(bestChoice(pattern,color));