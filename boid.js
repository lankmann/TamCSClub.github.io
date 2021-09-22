class Boid {
  constructor() {
    this.pos = createVector(random(0, width), random(0, height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.rotation = 0;
    this.maxSpeed = 4;
    this.maxForce = 1;
    this.range = new Rectangle(this.pos.x, this.pos.y, 100, 100);
    this.neighbors = [];
    this.color = color(255, random(200, 100), 0);
  }


  seperation(flock) {
    let steering = createVector();
    let total = 0;

    for (let other of flock) {
      let distSq = (other.pos.x-this.pos.x)*(other.pos.x-this.pos.x) + (other.pos.y-this.pos.y)*(other.pos.y-this.pos.y);
      // let d = dist(other.pos.x, other.pos.y, this.pos.x, this.pos.y);
      if (other != this && distSq < 50*50) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.div(distSq);
        steering.add(diff);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }

    return steering;
  }


  align(flock) {
    let steering = createVector();
    let total = 0;

    for (let other of flock) {
      // let d = dist(other.pos.x, other.pos.y, this.pos.x, this.pos.y);
      let distSq = (other.pos.x-this.pos.x)*(other.pos.x-this.pos.x) + (other.pos.y-this.pos.y)*(other.pos.y-this.pos.y);
      if (other != this && distSq < 100*100) {
        steering.add(other.velocity);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }

    return steering;
  }


  cohesion(flock) {
    let steering = createVector();
    let total = 0;
    for (let other of flock) {
      // let d = dist(other.pos.x, other.pos.y, this.pos.x, this.pos.y);
      let distSq = (other.pos.x-this.pos.x)*(other.pos.x-this.pos.x) + (other.pos.y-this.pos.y)*(other.pos.y-this.pos.y);
      if (other != this && distSq < 100*100) {
        steering.add(other.pos);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.sub(this.pos);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }

    return steering;
  }


  avoid() {
    let steering = createVector();
    let view = 50;
    let turnAngle = 60;

    let total = 0;
    for (let obs of obstacles) {
      if (abs(this.pos.y - obs.y) < obs.height && this.pos.x < obs.x + obs.width / 2 + view && this.pos.x > obs.x) {
        // right side
        if (this.velocity.y > 0) steering.add(createVector(cos(turnAngle), sin(turnAngle)));
        else steering.add(createVector(cos(turnAngle), -sin(turnAngle)));
        total++;
      }
      if (abs(this.pos.y - obs.y) < obs.height && this.pos.x > obs.x - obs.width / 2 - view && this.pos.x < obs.x) {
        // left side
        if (this.velocity.y > 0) steering.add(createVector(-cos(turnAngle), sin(turnAngle)));
        else steering.add(createVector(-cos(turnAngle), -sin(turnAngle)));
        total++;
      }
      if (abs(this.pos.x - obs.x) < obs.width && this.pos.y > obs.y - obs.height / 2 - view && this.pos.y < obs.y) {
        // top
        if (this.velocity.x > 0) steering.add(createVector(sin(turnAngle), -cos(turnAngle)));
        else steering.add(createVector(-sin(turnAngle), -cos(turnAngle)));
        total++;
      }
      if (abs(this.pos.x - obs.x) < obs.width && this.pos.y < obs.y + obs.height / 2 + view && this.pos.y > obs.y) {
        // bottom
        if (this.velocity.x > 0) steering.add(createVector(sin(turnAngle), cos(turnAngle)));
        else steering.add(createVector(-sin(turnAngle), cos(turnAngle)));
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }

    return steering;
  }


  follow(target) {
    let steering = createVector();
    let total = 0;

    let dir = p5.Vector.sub(target, this.pos);

    // if(dist(target.x, target.y, this.pos.x, this.pos.y) < 200) {
    // print(true);
    steering.add(target);
    total++;
    // }

    if (total > 0) {
      steering.div(total);
      steering.sub(this.pos);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }

    return steering;

  }


  update(flock) {
    let separation;
    let alignment;
    let cohesion;
    if (optimized) {
      this.range = new Rectangle(this.pos.x, this.pos.y, 100, 100);
      this.neighbors = qtree.query(this.range);
      separation = this.seperation(this.neighbors);
      alignment = this.align(this.neighbors);
      cohesion = this.cohesion(this.neighbors);
    } else {
      separation = this.seperation(flock);
      alignment = this.align(flock);
      cohesion = this.cohesion(flock);
    }
    let avoidance = this.avoid();
    let follow = this.follow(createVector(mouseX, mouseY));

    separation.mult(0.12);
    alignment.mult(0.05);
    cohesion.mult(0.05);
    follow.mult(0.05);
    avoidance.mult(0.3);

    this.velocity.add(separation);
    this.velocity.add(alignment);
    this.velocity.add(cohesion);
    this.velocity.add(avoidance);
    if(mouseIn) this.velocity.add(follow);

    this.pos.add(this.velocity);
    this.rotation = atan2(this.velocity.y, this.velocity.x) + 90;

    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;
    // this.pos.set(mouseX, mouseY);
  }

  draw() {
    this.x = this.pos.x;
    this.y = this.pos.y;
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);
    stroke(this.color)
    fill(this.color);
    triangle(0, -7, 5, 7, -5, 7);
    pop();
  }
}

class Obstacle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.pos = createVector(x, y);
  }
  
  collide() {
    let r = 8;
    for(let s of swarm) {
//       let dir = p5.Vector.sub(s.pos, this.pos);
      
//       line(this.x, this.y, this.x+dir.x*this.height, this.y+dir.y*this.width)

      if(abs(s.pos.x-this.x) < this.width/2+r && abs(s.pos.y-this.y) < this.height/2+r) {
        let dir = p5.Vector.sub(s.pos, this.pos);
        if(dir.y < 0 && abs(dir.y)*this.width > abs(dir.x)*this.height) {
          // print("top");
          s.pos.y = this.y - this.height/2 - r;
          s.velocity.y *= -0.1;
        }if(dir.y > 0 && abs(dir.y)*this.width > abs(dir.x)*this.height) {
          // print("bottom");
          s.pos.y = this.y + this.height/2 + r;
          s.velocity.y *= -0.1;
        }if(dir.x < 0 && abs(dir.y)*this.width < abs(dir.x)*this.height) {
          // print("left");
          s.pos.x = this.x - this.width/2 - r;
          s.velocity.x *= -0.1;
        }if(dir.x > 0 && abs(dir.y)*this.width < abs(dir.x)*this.height) {
          // print("right");
          s.pos.x = this.x + this.width/2 + r;
          s.velocity.x *= -0.1;
        }
      }
    }
  }
  
  draw() {
    this.collide();
    this.pos.set(this.x, this.y);
    fill(255);
    stroke(0);
    rect(this.x, this.y, this.width, this.height);
  }
}

class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contains(part) {
    return (
      part.pos.x > this.x - this.w &&
      part.pos.x < this.x + this.w &&
      part.pos.y > this.y - this.h &&
      part.pos.y < this.y + this.h
    );
  }
  
  intersects(range) {
    return !(
      range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h
    );
  }
  
  
  inside() {}
}

class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.rSquared = this.r * this.r;
  }

  contains(point) {
    // check if the point is in the circle by checking if the euclidean distance of
    // the point and the center of the circle if smaller or equal to the radius of
    // the circle
    let d = Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2);
    return d <= this.rSquared;
  }

  intersects(range) {
    var xDist = Math.abs(range.x - this.x);
    var yDist = Math.abs(range.y - this.y);

    // radius of the circle
    var r = this.r;

    var w = range.w;
    var h = range.h;

    var edges = Math.pow(xDist - w, 2) + Math.pow(yDist - h, 2);

    // no intersection
    if (xDist > r + w || yDist > r + h) return false;

    // intersection within the circle
    if (xDist <= w || yDist <= h) return true;

    // intersection on the edge of the circle
    return edges <= this.rSquared;
  }
}

class Quadtree {
  constructor(boundary) {
    this.boundary = boundary;
    this.parts = [];
    this.capacity = cap;
    this.divided = false;
  }

  subdivide() {
    this.divided = true;
    
    let x = this.boundary.x;
    let y = this.boundary.y;
    let w = this.boundary.w;
    let h = this.boundary.h;

    let nw = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2);
    let ne = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2);
    let sw = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2);
    let se = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);

    this.northwest = new Quadtree(nw);
    this.northeast = new Quadtree(ne);
    this.southwest = new Quadtree(sw);
    this.southeast = new Quadtree(se);
  }

  insert(part) {
    if (!this.boundary.contains(part)) {
      return false;
    }

    if (this.parts.length < this.capacity) {
      this.parts.push(part);
      return true;
    } else {
      if (!this.divided) {
        this.subdivide();
      }

      if (this.northwest.insert(part)) {
        return true;
      }
      if (this.northeast.insert(part)) {
        return true;
      }
      if (this.southwest.insert(part)) {
        return true;
      }
      if (this.southeast.insert(part)) {
        return true;
      }
    }
  }
  
  query(range, found, searched) {
    if (!found) {found = [];}
    if (!searched) {searched = [];}
    
    if (!this.boundary.intersects(range)) {
      return;
    } else {
      for (let p of this.parts) {
        // searched.push(p);
        if (range.contains(p)) {
          found.push(p);
        }
      }
      if (this.divided) {
        this.northwest.query(range, found);//, searched);
        this.northeast.query(range, found);//, searched);
        this.southwest.query(range, found);//, searched);
        this.southeast.query(range, found);//, searched);
      }
    }
    return found;
    // return {found:found, searched:searched};
  }

  draw() {
    noFill();
    stroke(0);
    rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);
    if (this.divided) {
      // print(true);
      this.northwest.draw();
      this.northeast.draw();
      this.southwest.draw();
      this.southeast.draw();
    }
    // for(let p of this.parts) {
    //   p.color = this.color;
    // }
  }
}

let boidNum = 100;
let swarm = [];
let obstacles = [];
let qtree, cnv;
let boundary;
let optimized = true;
let cap = 2;
let show = false;


// let alignSlider, cohesionSlider, separationSlider, avoidSlider;

function setup() {
  print(windowWidth, windowHeight)
  angleMode(DEGREES);
  cnv = createCanvas(700, 600);
  cnv.parent("boid-sketch");
  cnv.mouseOver(() => {
    mouseIn = true;
    disableScroll();
  });
  cnv.mouseOut(() => {
    mouseIn = false
    enableScroll();
  });

  if(optimized) {
    boundary = new Rectangle(width / 2, height / 2, width / 2, height / 2);
    qtree = new Quadtree(boundary);
  }

  for (let i = 0; i < boidNum; i++) {
    swarm.push(new Boid());
  }
  // for (let i = 0; i < swarm.length; i++) {
  //   qtree.insert(swarm[i]);
  // }


  obstacles.push(
    new Obstacle(0, height / 2, 2, height),
    new Obstacle(width, height / 2, 2, height),
    new Obstacle(width / 2, 0, width, 2),
    new Obstacle(width / 2, height, width, 2),
    new Obstacle(width * 0.65, height * 0.65, 40, 40),
    new Obstacle(width * 0.35, height * 0.35, 40, 40)
  );

}

let avgFrameRate = 0;


function draw() {
  rectMode(CENTER);
  background(255);

  if(optimized) {
    qtree = new Quadtree(boundary);

    for (let i = 0; i < swarm.length; i++) {
      qtree.insert(swarm[i]);
    }
  }

  for (let i = 0; i < swarm.length; i++) {
    var s = swarm[i];
    s.update(swarm);
    s.draw();

  }

  if(show && optimized) qtree.draw();

  // let range = swarm[0].range;//new Rectangle(mouseX, mouseY, 100, 100);
  // let points = swarm[0].neighbors;
  // let near = swarm[0].nearby;
  // noFill();
  // stroke(0, 255, 0);
  // strokeWeight(4);
  // rect(range.x, range.y, range.w * 2, range.h * 2);
  // // ellipse(range.x, range.y, range.r * 2, range.r * 2);
  // // for (let p of near) {
  // //   noFill();
  // //   stroke(0);
  // //   strokeWeight(4);
  // //   ellipse(p.pos.x, p.pos.y + 1, 20, 20);
  // // }
  // for (let p of points) {
  //   noFill();
  //   stroke(0, 255, 0);
  //   strokeWeight(4);
  //   ellipse(p.pos.x, p.pos.y + 1, 20, 20);
  // }
  // strokeWeight(1);

  for (let obs of obstacles) {
    obs.draw();
  }
  
  // if(frameCount % 300 == 0 && frameCount <= 300*6) {
  //   avgFrameRate += frameRate();
  //   print(frameRate());
  // }
  // if(frameCount == 300*6+10) {
  //   print("FPS: "+avgFrameRate/6)
  // }
}


mouseClicked = function() {
  if(mouseIn) show = !show;
}


function preventDefault(e) {
  e.preventDefault();
}

// var supportsPassive = false;
// try {
//   window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
//     get: function () { supportsPassive = true; } 
//   }));
// } catch(e) {}

var wheelOpt = {passive: false};//supportsPassive ? { passive: false } : false;

function disableScroll() {
  window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
}

// call this to Enable
function enableScroll() {
  window.removeEventListener('touchmove', preventDefault, wheelOpt);
}


let mouseIn = false;

keyPressed = function() {
  if(keyCode == 38) {
    cap --;
    print(cap);
  } if(keyCode == 40) {
    cap ++;
    print(cap);
  }
  if(keyCode == 32 && optimized) {
    show = !show;
  }
}
