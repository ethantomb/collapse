
const w = 1600, h = w;
var DIM = 16;

//Grid is a 2-dimmensional array of tiles.
var grid = [];
//ims is an array of each of the image objects. It is filled in the function loadImages() which is called when the Generate Grid button is pressed
var ims = [];
/**
 * The tile object stores the state, allowed options, and index of each tile.
 */
class tile {
    /**
     * Tile constructor. Creates a tile that is not collapsed
     * @param {boolean} collapsed - True if tile is collapsed, false if tile is not collapsed
     * @param {Array<int>} options - The possible states for the tile indexed [0-11] 
     *      corresponding to [Blank,Horiz,Vert,NtoE Turn,EtoS Turn,StoW Turn,WtoN Turn,Quad Junction,T-Junct North,T-Junct East,T-Junct South,T-Junct West]
     * @param {*} index - The index where the tile is located
     */
    constructor(collapsed, options, index) {

        this.collapsed = collapsed;
        this.options = options;
        this.index = index;
    }
}
/*                                                                                            0     1    2    3    4    5    6    7    8       9      10    11  
Rules defines What can go to the north, east, south, and west of any given tile. In order: [BLANK,HORIZ,VERT,NtoE,EtoS,StoW,WtoN,QUAD,TNORTH,TEAST,TSOUTH,TWEST]
This list was generated in python, I would go insane and be placed in a mental institution if i tried to work this set out by hand. 
See GenCon.py for an explanation of how this was done. 
Explanation:
    [[Blank(0) Rules],[Horiz(1) Rules],...,[West facing T-Junction(11) Rules]]
           \/
    [[Tile numbers allowed above blank],[Tile numbers allowed to the right of blank],[Tile numbers allowed below],[Tile Numbers allowed to the left]]
*/
const NUM_CHOICES = 12;
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * Initializes ims array using road files from ./img 
 */
function loadImages() {
    for (let i = 0; i < 12; i++) {
        ims.push(new Image());
    }
    let suffix;
    //Choose between OG(crappy) tiles or New(nice) road tiles.
    if (document.querySelector(".useOG").checked) {
        suffix = ".png";
    }else{
        suffix = "ROAD.png"
    }
    ims[0].src = "img/BLANK" + suffix;
    ims[1].src = "img/HORIZ" + suffix;
    ims[2].src = "img/VERT" + suffix;
    ims[3].src = "img/NtoE" + suffix;
    ims[4].src = "img/EtoS" + suffix;
    ims[5].src = "img/StoW" + suffix;
    ims[6].src = "img/WtoN" + suffix;
    ims[7].src = "img/QUAD" + suffix;
    ims[8].src = "img/TNorth" + suffix;
    ims[9].src = "img/TEast" + suffix;
    ims[10].src = "img/TSouth" + suffix;
    ims[11].src = "img/TWest" + suffix;
}
/**
 * Initializes the grid. Sets tiles from index [0,0] to [DIM,DIM] to uncollapsed with all available options
 * Draws a checkered pattern on the canvas so user can easily differentiate between adjacent tiles
 */
function makeGrid() {
    grid = [];
    for (let i = 0; i < DIM; i++) {
        grid.push([]);
    }
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            grid[i].push(new tile(false, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [i, j]));
            if ((i + j) % 2 == 0) {
                ctx.fillStyle = `rgb(14, 61, 138)`;
            } else {
                ctx.fillStyle = `rgb(54, 60, 71)`;
            }
            ctx.fillRect(i * w / DIM, j * w / DIM, w / DIM, w / DIM);
        }
    }
}
/**
 * Fills in a square on the board
 * Uses first index of square.options to determine the type of tile to draw.
 * @param {tile} square - The tile to draw
 */
function draw(square) {
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    //Load in the tile's image source from the ims array.
    let imsrc = ims[square.options[0]].src;
    let im = new Image();
    im.src = imsrc;


    im.onload = function () {
        ctx.drawImage(ims[square.options[0]], square.index[0] * w / DIM, square.index[1] * w / DIM, w / DIM, h / DIM);
    }
}
/**
 * Checks whether the grid is solved, meaning that all tiles are collapsed
 * @returns {boolean} True if solved, False if not solved
 */
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
/**
 * Loops through the grid, to find all tiles with minimum entrophy, or number of available options
 * @returns The index of a tile with the minimum entrophy, chosen at random from a list of all tiles with the lowest entrophy
 */
function leastEntropy() {
    /**
     * First pass, check all tiles to determine the minimum entrophy, or minimum length of options array
     */
    let minlen = NUM_CHOICES;
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            if (grid[i][j].options.length < minlen && !grid[i][j].collapsed && grid[i][j].options.length > 0) {
                minlen = grid[i][j].options.length
            }
        }
    }
    /**
     * Second pass, add indecies of all tiles with minimum entrophy to a list
     */
    options = []
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            if (grid[i][j].options.length == minlen && !grid[i][j].collapsed) {
                options.push(grid[i][j].index)
            }
        }
    }
    //Pick from min entrophy list at random, return it
    return options[Math.floor(Math.random() * options.length)];

}
/**
 * Returns the grid state as a matrix with entries in [-1](unsolved) U [0,11](solved)
 */
function toMatrix(){
    let matrix=[];
    
    if(grid.length!=0){
        for(let i=0;i<grid.length;i++){
            matrix.push([])
        }
        console.table(matrix)
        for(let i=0;i<grid.length;i++){
            for(let j=0;j<grid.length;j++){
                if(grid[i][j].collapsed){
                    matrix[i][j]= grid[i][j].options[0];
                }else{
                    matrix[i][j]=-1;
                }
            }
        }
    }
    return matrix;
}
function toggleSolveButton(){
    if(document.querySelector("#step").checked){
        document.getElementById("solveBtn").innerHTML="Step";
    }else{
        document.getElementById("solveBtn").innerHTML="Solve";
    }
}
async function copy(){
    let copyData = toMatrix();
    let encodedData = ""
    for(let i=0;i<copyData.length;i++){
        encodedData+=" ";
        for(let j=0;j<copyData.length;j++){
            encodedData+=copyData[i][j]+" ";
        }
        encodedData+="x";
    }
    encodedData+="f";
    navigator.clipboard.writeText(encodedData).then(function() {
        //On success, make the button say "Copied", make it inactive and wait for 2 seconds, then make it say "Copy" and make it active again
        document.getElementById("copyBtn").innerHTML="Copied";
        document.getElementById("copyBtn").disabled=true;
        setTimeout(function(){
            document.getElementById("copyBtn").innerHTML="Copy";
            document.getElementById("copyBtn").disabled=false;
        },2000);
      }, function(err) {
        console.error('Async: Could not copy text: ', err);
      });
}

/**
 * Generates a grid from a matrix
 * @param {string} m - the encoded data
 */
function fromEncoded(m){
    let matrix=[];
    let row = [];
    let r=0,c=0;
    
    m=m.split(" ");
    for(let k=1;k<m.length;k++){
        if(m[k]=="x"){
            r=0;
            
            matrix.push(row);
            row=[];
        }else if(m[k]!="xf"){
            
            row.push(parseInt(m[k]));
        }else if(m[k]=="xf"){
            matrix.push(row);
            break;
        }
    }
    console.table(matrix);
    newGrid=[]
    if(matrix.length>0){
            if(matrix[0].length==matrix.length){
                console.log("Matrix is square"+matrix[0].length==matrix.length);
                for(let i=0;i<matrix.length;i++){
                    newGrid.push([]);
                    for(let j=0;j<matrix.length;j++){
                        if(matrix[i][j]==-1){
                            newGrid[i][j]=new tile(false,[0,1,2,3,4,5,6,7,8,9,10,11],[i,j]);
                        }else if(matrix[i][j]==parseInt(matrix[i][j]) && matrix[i][j]>=0 &&matrix[i][j]<12 ){
                            newGrid[i][j]=new tile(true,[matrix[i][j]],[i,j])
                        }else{
                            
                        }
                    }
                }
                return newGrid;
            }
        }
    
    
}

/**
 * Evaluates availible options for each square in the grid by checking the rules of its neighboring squares. 
 */
function collapse() {

    for (let i = 0; i < DIM; i++) {
        
        for (let j = 0; j < DIM; j++) {
            if (grid[i][j].options.length == 0) {
                grid[i][j].collapsed = false;
            }
            /**
             * If the square is collapsed, change the options of the neighboring squares to match those allowed by the rules
             */
            if (grid[i][j].collapsed) {
                
                let tileType = grid[i][j].options[0];
                //Check North Rules against North neighbor
                if (j > 0) {
                    /**
                     * Pass through north neighbors options list
                     */
                    for (let k = 0; k < grid[i][j - 1].options.length; k++) {
                        /**
                         * Check the northern neighbors options list against the ruleset, remove invalid options(eg a blank with a quad above it)
                         */
                        if (!RULES[tileType][0].includes(grid[i][j - 1].options[k])) {
                            grid[i][j - 1].options.splice(k, 1);
                            k--;
                        }

                    }

                }
                //Check East rules against East neighbor
                if (i < DIM - 1) {
                    for (let k = 0; k < grid[i + 1][j].options.length; k++) {
                        if (!RULES[tileType][1].includes(grid[i + 1][j].options[k])) {
                            grid[i + 1][j].options.splice(k, 1);
                            k--;
                        }

                    }

                }
                //Check South rules against South neighbor
                if (j < DIM - 1) {
                    for (let k = 0; k < grid[i][j + 1].options.length; k++) {
                        if (!RULES[tileType][2].includes(grid[i][j + 1].options[k])) {
                            grid[i][j + 1].options.splice(k, 1);
                            k--;
                        }

                    }

                }
                //Check West rules against West neighbor
                if (i > 0) {
                    for (let k = 0; k < grid[i - 1][j].options.length; k++) {
                        if (!RULES[tileType][3].includes(grid[i - 1][j].options[k])) {
                            grid[i - 1][j].options.splice(k, 1);
                            k--;
                        }

                    }

                }
            }
        }
    }
}

/**
 * Loads a new grid from a matrix
 * @param {nxn matrix} m
 */
function load(m){
    loadImages();
    newGrid = fromEncoded(m)
    grid=newGrid;
    DIM = grid.length;
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            if(grid[i][j].collapsed){
                draw(grid[i][j]);
            }else{
            if ((i + j) % 2 == 0) {
                ctx.fillStyle = `rgb(14, 61, 138)`;
            } else {
                ctx.fillStyle = `rgb(54, 60, 71)`;
            }
            ctx.fillRect(i * w / DIM, j * w / DIM, w / DIM, w / DIM);
        }
        }
    }
    document.querySelector("#solveBtn").disabled = false;
    for (let i = 0; i < 12; i++) {
        document.querySelector("#im" + i).src = ims[i].src;
    }
}

/**
 * Resets and generates the starting board
 */
function gen() {
    if(document.getElementById("loadData").value!=""){
        
        load(document.getElementById("loadData").value);
        
    }else{

    DIM = document.getElementById("dim").value;
    //Check if dim is defined or is equal to 0. Sets DIM to default value of 16.

    if (DIM == "" || DIM == 0) {
        
        DIM = 16;
    }
    //Set grid to initial unsolved state. 

    makeGrid();

    loadImages();
}
    /*
    const q = new tile(true, [1], [0, 0]);
    grid[0][0] = q

draw(q);
collapse();
*/

    document.querySelector("#solveBtn").disabled = false;
    for (let i = 0; i < 12; i++) {
        document.querySelector("#im" + i).src = ims[i].src;
    }
    

}


var choiceI, choiceJ;
/**
 * Processes click events on the canvas, identifies which tile user clicked. If tile isn't already collapsed, brings up modal with all valid tile choices. 
 * @param {*} canvas-The Canvas(Shocker)
 */
function addSquare(canvas, event) {
    
    if (!document.querySelector("#solveBtn").disabled) {
        let n = DIM;
        let l = 1600;
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        //Cap x and y below 1600 so math works. 
        if (x >= 1600) {
            x = 1590;
        }
        if (y >= 1600) {
            y = 1590;
        }

        choiceI = Math.floor(x * (n / l));
        choiceJ = Math.floor(y * (n / l));

        
        //Check if clicked tile is collapsed. 
        if (!grid[choiceI][choiceJ].collapsed) {
            //If road choice button is valid according to ruleset, enable button. 
            for (let s = 0; s < NUM_CHOICES; s++) {
                if (grid[choiceI][choiceJ].options.includes(s)) {
                    document.getElementById("t" + s).disabled = false;
                } else {
                    document.getElementById("t" + s).disabled = true;
                }
            }
            document.getElementById("addSquareModal").style.display = "block";

        }

    }
}
/**
 * Splitting the add square into 2 functions, because frankly, I am terrified of async functions.
 */

/**
 * 
 * @param {int} n - Selection choice. -1 if close button is selected, or 0-11 corresponding to the tile type
 * Called after addSquare. Collapses a tile to user's choice, then draws it on the canvas. 
 */
function processModal(n) {
    if (n != -1) {
        const selectedTile = new tile(true, [n], [choiceI, choiceJ]);
        
        grid[choiceI][choiceJ] = selectedTile;
        
        draw(selectedTile);
        collapse();
    }
    document.getElementById("addSquareModal").style.display = "none";
}
/**
 * Solves the starting board. Requires Generate Grid to have been clicked.
 */
async function solve() {
    
    /**
     * Keep looping until the canvas is solved
     */
   

    
    document.getElementById("solveBtn").innerHTML="Solving...";
    document.querySelector("#solveBtn").disabled = true;
    while (!solved()) {
        collapse()
        let nextC = leastEntropy();
        //console.log("Next Collapse: "+nextC);
        //Collapse it

        grid[nextC[0]][nextC[1]].options = [grid[nextC[0]][nextC[1]].options[Math.floor(Math.random() * grid[nextC[0]][nextC[1]].options.length)]];

        grid[nextC[0]][nextC[1]].collapsed = true;
        //console.table(grid[nextC[0]][nextC[1]])
        draw(grid[nextC[0]][nextC[1]]);
        //Wait for 0.01 seconds
        if(document.querySelector("#delay").checked){
        await sleep(10);
        }
    }
    document.getElementById("solveBtn").innerHTML="Solve";    
}
/**
 * Initialization function for the canvas. adds event listener to the canvas. 
 */
function initCanvas() {


    let canvasElem = document.querySelector("#canvas");

    canvasElem.addEventListener("mousedown", function (e) {
        addSquare(canvasElem, e);
    });
}


$(document).ready(function () {
    initCanvas();
});



