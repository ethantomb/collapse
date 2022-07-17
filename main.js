//Make a NxN grid. With one piece already filled in.
//Determine possiblities for each piece based on the piece types around it
/*
*/
const w = 1600, h = w;
var DIM=20;
var grid = [];
var ims = [];
/*
    Tile object that stores possible options for the child.
    Could be done simpler with rotations but i dont have the paitence to figure that out :)
    options = [BLANK,HORIZ,VERT,NtoE,EtoS,StoW,WtoN,QUAD]
*/

class tile {
    constructor(collapse, options, index) {

        this.collapsed = collapse;
        this.options = options;
        this.index = index;
    }
}
/*                                                                              0     1    2    3    4    5    6    7    8       9      10    11  
What can go to the north, east, south, and west of any given tile. In order: [BLANK,HORIZ,VERT,NtoE,EtoS,StoW,WtoN,QUAD,TNORTH,TEAST,TSOUTH,TWEST]
T JUNCTIONS(8-13)NOT IMPLEMENTED BECAUSE I AM LAZY
*/
const RULES = [
    [[0, 1, 3, 6, 8], [0, 2, 3, 4, 9], [0, 1, 4, 5, 10], [0, 2, 5, 6, 11]], 
    [[0, 1, 3, 6, 8], [1, 5, 6, 7, 8, 10, 11], [0, 1, 4, 5, 10], [1, 3, 4, 7, 8, 9, 10]],
    [[2, 4, 5, 7, 9, 10, 11], [0, 2, 3, 4, 9], [2, 3, 6, 7, 8, 9, 11], [0, 2, 5, 6, 11]], 
    [[2, 4, 5, 7, 9, 10, 11], [1, 5, 6, 7, 8, 10, 11], [0, 1, 4, 5, 10], [0, 2, 5, 6, 11]],
    [[0, 1, 3, 6, 8], [1, 5, 6, 7, 8, 10, 11], [2, 3, 6, 7, 8, 9, 11], [0, 2, 5, 6, 11]], 
    [[0, 1, 3, 6, 8], [0, 2, 3, 4, 9], [2, 3, 6, 7, 8, 9, 11], [1, 3, 4, 7, 8, 9, 10]], 
    [[2, 4, 5, 7, 9, 10, 11], [0, 2, 3, 4, 9], [0, 1, 4, 5, 10], [1, 3, 4, 7, 8, 9, 10]],
    [[2, 4, 5, 7, 9, 10, 11], [1, 5, 6, 7, 8, 10, 11], [2, 3, 6, 7, 8, 9, 11], [1, 3, 4, 7, 8, 9, 10]], 
    [[2, 4, 5, 7, 9, 10, 11], [1, 5, 6, 7, 8, 10, 11], [0, 1, 4, 5, 10], [1, 3, 4, 7, 8, 9, 10]], 
    [[2, 4, 5, 7, 9, 10, 11], [1, 5, 6, 7, 8, 10, 11], [2, 3, 6, 7, 8, 9, 11], [0, 2, 5, 6, 11]],
    [[0, 1, 3, 6, 8], [1, 5, 6, 7, 8, 10, 11], [2, 3, 6, 7, 8, 9, 11], [1, 3, 4, 7, 8, 9, 10]],
    [[2, 4, 5, 7, 9, 10, 11], [0, 2, 3, 4, 9], [2, 3, 6, 7, 8, 9, 11], [1, 3, 4, 7, 8, 9, 10]]];
function loadImages() {
    for (let i = 0; i < 12; i++) {
        ims.push(new Image());
    }

    ims[0].src = "img/BLANK.png";
    ims[1].src = "img/HORIZROAD.png";
    ims[2].src = "img/VERTROAD.png";
    ims[3].src = "img/NtoE.png";
    ims[4].src = "img/EtoS.png";
    ims[5].src = "img/StoW.png";
    ims[6].src = "img/WtoN.png";
    ims[7].src = "img/QUADROAD.png";
    ims[8].src = "img/TNorth.png";
    ims[9].src = "img/TEast.png";
    ims[10].src = "img/TSouth.png";
    ims[11].src = "img/TWest.png";


}
function makeGrid() {
    for (let i = 0; i < DIM; i++) {
        grid.push([]);
    }
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            grid[i].push(new tile(false, [0, 1, 2, 3, 4, 5, 6, 7,8,9,10,11], [i, j]));
            ctx.fillRect(i * w / DIM, j * w / DIM, w / DIM, w / DIM);
        }
    }
    //console.table(grid);
}
function draw(square) {
    //console.log("Draw() input");
    //console.table(square);
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    //console.log(typeof(ims[square.options[0]]));
    let imsrc = ims[square.options[0]].src

    let im = new Image();
    im.src = imsrc;


    im.onload = function () {
        ctx.drawImage(ims[square.options[0]], square.index[0] * w / DIM, square.index[1] * w / DIM, w / DIM, h / DIM);
    }
    //ctx.drawImage(ims[square.options[0]],square.index[0]*w/DIM,square.index[1]*w/DIM,w/DIM,h/DIM);
}
function solved() {
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            if (!grid[i][j].collapsed) {
                return false;
            }
        }
    }
    return true;
}
/*
Returns a random tile with the least entrophy
*/
function leastEntropy() {

    let minlen = 7;
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            if (grid[i][j].options.length < minlen && !grid[i][j].collapsed && grid[i][j].options.length > 0) {
                minlen = grid[i][j].options.length
            }
        }
    }
    options = []
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            if (grid[i][j].options.length == minlen && !grid[i][j].collapsed) {
                options.push(grid[i][j].index)
            }
        }
    }
    //console.log("Can collapse: "+options);
    return options[Math.floor(Math.random() * options.length)];

}
//Finds new valid grid options according to the rules. 
function collapse() {
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            if (grid[i][j].options.length == 0) {
                grid[i][j].collapsed = false;
            }
            if (grid[i][j].collapsed) {

                //console.table(grid[i][j])
                //Check above rules
                if (j > 0) {
                    for (let k = 0; k < grid[i][j - 1].options.length; k++) {
                        if (!RULES[grid[i][j].options[0]][0].includes(grid[i][j - 1].options[k])) {
                            grid[i][j - 1].options.splice(k, 1);
                            k--;
                        }

                    }

                }
                //Check east rules
                if (i < DIM - 1) {
                    for (let k = 0; k < grid[i + 1][j].options.length; k++) {
                        if (!RULES[grid[i][j].options[0]][1].includes(grid[i + 1][j].options[k])) {
                            grid[i + 1][j].options.splice(k, 1);
                            k--;
                        }

                    }

                }
                //Check South rules
                if (j < DIM - 1) {
                    for (let k = 0; k < grid[i][j + 1].options.length; k++) {
                        if (!RULES[grid[i][j].options[0]][2].includes(grid[i][j + 1].options[k])) {
                            grid[i][j + 1].options.splice(k, 1);
                            k--;
                        }

                    }

                }
                //Check west Rules
                if (i > 0) {
                    for (let k = 0; k < grid[i - 1][j].options.length; k++) {
                        if (!RULES[grid[i][j].options[0]][3].includes(grid[i - 1][j].options[k])) {
                            grid[i - 1][j].options.splice(k, 1);
                            k--;
                        }

                    }

                }
            }
        }
    }
}
function main() {
    DIM = document.getElementById("dim").value;
    //Check if dim is defined
    if (DIM == "") {
        DIM = 16;
    }
    grid=[];
    makeGrid();
    loadImages();
    const q = new tile(true, [1], [3, 3]);
    grid[3][3] = q

    draw(q);

    while (!solved()) {
        collapse()
        let nextC = leastEntropy();
        //console.log("Next Collapse: "+nextC);
        //Collapse it

        grid[nextC[0]][nextC[1]].options = [grid[nextC[0]][nextC[1]].options[Math.floor(Math.random() * grid[nextC[0]][nextC[1]].options.length)]];

        grid[nextC[0]][nextC[1]].collapsed = true;
        //console.table(grid[nextC[0]][nextC[1]])
        draw(grid[nextC[0]][nextC[1]]);
    }

}
function mainloop() {
    while (!solved()) {

    }

}

