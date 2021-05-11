
$(document).ready(function () {

  const canvas = $('#myCanvas')[0];
  const context = canvas.getContext('2d');
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const componentsColor = "WHITE";
  const computerLevel = 0.1;
  const initialBallX = canvasWidth / 2;
  const initialBallY = Math.floor(Math.random() * (canvasHeight - 0 + 1));
  const noOfRounds = 5;
  let isRunning = false;
  let color = "#" + ((1 << 24) * Math.random() | 0).toString(16);

  const paddle = {
    width: 10,
    height: 100,
    color: componentsColor
  };

  //create user paddle
  const user = $.extend(paddle, {
    x: 0,
    y: canvasHeight / 2 - paddle.height / 2,
    score: 0
  });

  //create computer paddle
  const com = $.extend({}, paddle, {
    x: canvasWidth - paddle.width,
    y: canvasHeight / 2 - paddle.height / 2,
    score: 0
  });

  //create ball
  const ball = {
    x: initialBallX,
    y: initialBallY,
    color: componentsColor,
    radius: 10,
    speed: 7,
    velocityX: 7,
    velocityY: 7
  };

  //create net
  const net = {
    x: canvasWidth / 2,
    y: 0,
    width: 2,
    height: 10,
    color: componentsColor,
  };

  function drawNet() {
    for (let i = 0; i <= canvasHeight; i += 30) {
      drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
  }

  function drawRect(x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
  }

  function drawCircle(x, y, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
  };

  function drawText(x, y, text, color, font) {
    context.textAlign = 'center';
    context.fillStyle = color;
    context.font = font;
    context.fillText(text, x, y);
  }

  function render() {
    drawRect(0, 0, canvasWidth, canvasHeight, color);
    drawNet();
    drawText(canvasWidth / 4, canvasHeight / 5, user.score, "YELLOW", '40px sans-serif');
    drawText(3 * canvasWidth / 4, canvasHeight / 5, com.score, "YELLOW", '40px sans-serif');
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
    if (!isRunning) {
      drawText(canvasWidth / 2,
        canvasHeight / 2 + 15, "PRESS SPACEBAR TO START", "BLUE", '30px sans-serif');
    }
  }

  //collisonDetection
  function collison(ball, player) {
    ball.top = ball.y - ball.radius;
    ball.bottom = ball.y + ball.radius;
    ball.left = ball.x - ball.radius;
    ball.right = ball.x + ball.radius;

    player.top = player.y;
    player.bottom = player.y + player.height;
    player.left = player.x;
    player.right = player.x + player.width;

    return ball.right > player.left && ball.left < player.right && ball.top < player.bottom && ball.bottom > player.top
  }

  //update Score
  function updateScore() {
    if (ball.x - ball.radius < 0) {
      //com wins
      com.score++;
      resetBall(com);
    } else if (ball.x + ball.radius > canvas.width) {
      user.score++;
      resetBall(user);
    }
  }

  function resetBall(player) {
    let direction = Math.random() < 0.5 ? -1 : 1;
    ball.x = initialBallX;
    ball.y = initialBallY;
    ball.speed = 7;
    ball.velocityX = player === com ? -7 : 7;
    ball.velocityY = direction * 7;

    if (player.score === noOfRounds) {
      com.score = 0;
      user.score = 0;
      isRunning = false;
    }
  }

  //update : position,score,movement
  function update() {
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    //AI to control computer AI
    com.y += (ball.y - (com.y + com.height / 2)) * computerLevel;

    let isBallHittingTopOrBottom = (ball.y + ball.radius >= canvasHeight) || (ball.y - ball.radius <= 0);

    if (isBallHittingTopOrBottom) {
      ball.velocityY = - ball.velocityY;
    }

    let player = ball.x > canvasWidth / 2 ? com : user;

    if (collison(ball, player)) {
      // normalize the value of collidePoint, we need to get numbers between -1 and 1 & -player.height/2 < collide Point < player.height/2
      let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);

      // when the ball hits the top of a paddle we want the ball, to take a -45degees angle
      // when the ball hits the center of the paddle we want the ball to take a 0degrees angle
      // when the ball hits the bottom of the paddle we want the ball to take a 45degrees
      // Math.PI/4 = 45degrees
      let angleRad = (Math.PI / 4) * collidePoint;

      // change the X and Y velocity direction
      let direction = (ball.x + ball.radius < canvas.width / 2) ? 1 : -1;
      ball.velocityX = direction * ball.speed * Math.cos(angleRad);
      ball.velocityY = ball.speed * Math.sin(angleRad);
      ball.speed += 0.5;
      color = "#" + ((1 << 24) * Math.random() | 0).toString(16);
    }
    updateScore();
  }

  //add eventListeners for mouseover and spacebar
  canvas.addEventListener("mousemove", (event) => {
    let rect = canvas.getBoundingClientRect();
    user.y = event.clientY - rect.top - user.height / 2;
  });

  $(document).keyup(function (e) {
    if (e.keyCode == 32) {
      isRunning = isRunning ? false : true;
    }
  });

  (function startGame() {
    setInterval(() => {
      render();
      if (isRunning) {
        update();
      }
    }, 20);
  })();

});