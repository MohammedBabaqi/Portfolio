const game = document.querySelector(".game-container")
const char = document.querySelector(".character")
let interval;
let keyDown = false;
let mouseDown = false;

// restart the game
function r (){
  location.reload()
}

// ball movement

const moveLeft = () => {
  let leftPos = parseInt(window.getComputedStyle(char).getPropertyValue("left"));
  if (leftPos > 0)
    char.style.left = leftPos - 1 + "px";
  var active1 = document.getElementById('leftArrow');
  active1.classList.add('active');
}

const moveRight = () => {
  let leftPos = parseInt(window.getComputedStyle(char).getPropertyValue("left"));
  if (leftPos < 370)
    char.style.left = leftPos + 1 + "px";
  var active2 = document.getElementById('RightArrow');
  active2.classList.add('active');
}

// moving the ball with key press

document.addEventListener("keydown", (event) => {
  if (!keyDown && !mouseDown) {
    if (event.key == "ArrowLeft") {
      interval = setInterval(moveLeft, 1);
    } else if (event.key == "ArrowRight") {
      interval = setInterval(moveRight, 1);
    }
  }
  keyDown = true;
});

document.addEventListener("keyup", (event) => {
  if (event.key == "ArrowLeft") {
    var active1 = document.getElementById('leftArrow');
    active1.classList.remove('active');
  } else if (event.key == "ArrowRight") {
    var active2 = document.getElementById('RightArrow');
    active2.classList.remove('active');
  }

  clearInterval(interval);
  keyDown = false;
});

// Moving the ball with mouse
var leftArrow = document.getElementById('leftArrow');
leftArrow.addEventListener('mousedown', () => {
  interval = setInterval(moveLeft, 1);
  mouseDown = true;
});
leftArrow.addEventListener('mouseup', () => {
  var active1 = document.getElementById('leftArrow');
  active1.classList.remove('active');
  clearInterval(interval);
  mouseDown = false;
});

var rightArrow = document.getElementById('RightArrow');
rightArrow.addEventListener('mousedown', () => {
  interval = setInterval(moveRight, 1);
});
rightArrow.addEventListener('mouseup', () => {
  var active2 = document.getElementById('RightArrow');
  active2.classList.remove('active');
  clearInterval(interval);
});
// Generating Obstacles
var GeneratingObstaclesInterval;
const generateObstacle = () => {
  let block = document.createElement("div")
  let hole = document.createElement("div")
  block.setAttribute("class", "block")
  hole.setAttribute("class", "hole")
  let randholepos = Math.floor(Math.random() * 320)
  hole.style.left = randholepos + "px";

  game.appendChild(block)
  game.appendChild(hole)

  // to remove elements

  $('.block').bind('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function (e) { $(this).remove(); });
  $('.hole').bind('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function (e) { $(this).remove(); });
}

GeneratingObstaclesInterval = setInterval(generateObstacle, 1500);


// check Collisions===>>

  const checkCollisions = () => {
  const allBlocks = document.querySelectorAll(".block")
  const allHoles = document.querySelectorAll(".hole")

  allBlocks.forEach(b => {
      let hitObstacle = false

      if (collision(b, char)) {
          hitObstacle = true

          allHoles.forEach(h => {
              if (holeCollision(h, char)) {
                  hitObstacle = false
                  
                  if (hitObstacle === false){
                  // score++;
                  // scoreElement.innerText = `Score: ${score}`;
                  // scoreCard.innerText = `Your Score is ${score}`;
                }
              }
          })
      }

      if (hitObstacle) {
          // alert(`Game over ! Your score is ${score}.`)
          // location.reload()

          var card = document.getElementById('card');
            card.style.display = 'flex';
            card.style.opacity = '0'; 
            
            setTimeout(function() {
              card.style.opacity = '1'; 
            }, 0);
          

          var s = document.getElementById('n');
          s.classList.add('n');

          scoreCard.innerText =` ${score}`;      
          stopGame();
        }
    
  })
}
setInterval(checkCollisions, 1)

// score increment 
var score = 0;
const scoreElement = document.getElementById("score");
const scoreCard = document.getElementById("score_C");
var scoreInterval; 

function incrementScore() {
  score++;
  scoreElement.innerText = `Score: ${score}`;
}

function startGame() {
  scoreInterval = setInterval(incrementScore, 1500);
}

function stopGame() {
  clearInterval(scoreInterval);
  clearInterval(GeneratingObstaclesInterval);
}

setTimeout(function() {
  startGame(); 
}, 4000);


// Check Obstacle Collisions
function collision(a, b) {
  let a_top = parseInt(window.getComputedStyle(a).getPropertyValue("top"));

  let b_top = parseInt(window.getComputedStyle(b).getPropertyValue("top"));

  return (
      a_top + 20 > b_top && a_top < b_top + 20
  );
}

// Check Hole Collisions
function holeCollision(h, b) {
  let h_left = parseInt(window.getComputedStyle(h).getPropertyValue("left"));
  let h_top = parseInt(window.getComputedStyle(h).getPropertyValue("top"));

  let b_left = parseInt(window.getComputedStyle(b).getPropertyValue("left"));
  let b_top = parseInt(window.getComputedStyle(b).getPropertyValue("top"));
  
  return (
    b_left > h_left && b_left < h_left + 50 &&
    h_top + 20 > b_top && h_top < b_top + 20
  );
  
}