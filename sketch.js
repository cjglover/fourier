

let canvasX=640;
let canvasY= 360;

let pointArray=[];
let distances= [];
let coefficients= [];
let dash_points=[];
let is_pressed= 0;
const pi= 3.14159;
let line_builder=0;
let draw_mode=1;
var time=0;
var num_freq=100;
var time_total=16000;

function Point(x, y)
{
  this.x=x;
  this.y=y;
}


function setup() {
  createCanvas(canvasX,canvasY);

}


function addPoint(x, y)
{

  if(pointArray.length===0 || pointArray[pointArray.length-1].x!=x || pointArray[pointArray.length-1].y!=y )
    pointArray.push(new Point(x,y));

}

function Coefficient(r, i)
{
  this.real=r;
  this.imag=i;
}

function addCoefficient(r, i)
{
  coefficients.push(new Coefficient(r, i))
}

function drawLines()
{
  if(draw_mode)
  {
    stroke(0);
  }
  else {
    stroke(250);
  }
  if(pointArray.length<2)
    return
  var i =0;
  for(i=0;i<pointArray.length-1;++i)
  {
    if(draw_mode==0&&i==pointArray.length-2)
      break;
    line(pointArray[i].x, pointArray[i].y, pointArray[i+1].x, pointArray[i+1].y );
  }


}

function drawObjects()
{
  drawLines();
}


function keyReleased() {

  if (key === 'l')
  {

    if( line_builder === 0)
    {
      line_builder = 1&&draw_mode;

    }
    else
    {
      line_builder  = 0;
    }
  }

  else if (key === 'f')
  {
    if(pointArray.length>=2)
    {
      draw_mode=0;
      line_builder=0;
      calculateFourier();
    }

  }

  else if(key === 'r')
  {
    draw_mode=1;
    line_builder=0;
    pointArray= [];
    distances= [];
    coefficients=[];
  }

  return false;
}


function lineBuilder(release) {
  if(pointArray.length>0)
    line(pointArray[pointArray.length-1].x, pointArray[pointArray.length-1].y, mouseX, mouseY);

  if(release)
    addPoint(mouseX, mouseY );

}

function sum(array)
{
  var i=0;
  var sum=0;
  for(;i<array.length;++i)
  {
    sum+=array[i];
  }
  return sum;

}

function getX(t, i)
{

  return (t-distances[i])/ (distances[i+1]-distances[i]) * (pointArray[i+1].x-pointArray[i].x)+pointArray[i].x-320;

}

function getY(t, i)
{
  return (t-distances[i])/ (distances[i+1]-distances[i]) * (pointArray[i+1].y-pointArray[i].y)+pointArray[i].y-180;
}

function calculateCircle(freq)
{

    let complexCoefficient= new Coefficient(0,0);
    let t=0;
    let i;
    for( i=0;i<pointArray.length-1;++i)
    {
      while(t<distances[i+1]){
        complexCoefficient.real+= .0001* (cos(2*pi*freq*t )*getX(t, i)+ getY(t, i)*sin(2*pi*freq*t));
        complexCoefficient.imag+= .0001* (cos(2*pi*freq*t )*getY(t, i)- getX(t, i)*sin(2*pi*freq*t));
        t+=.0001;
      }

    }
    return complexCoefficient;


}


function calculateFourier()
{
  if(pointArray.length<2)
    return;

  time =0;
  distances= [];
  coefficients=[];
  dash_points=[];
  distances.push(0);
  pointArray.push(new Point(pointArray[0].x, pointArray[0].y) );

  var i =1;
  for(i=1;i<pointArray.length;++i)
  {
      distances.push(
          pow( pow(pointArray[i].x-pointArray[i-1].x,2)+  pow(pointArray[i].y-pointArray[i-1].y,2), 0.5)
      );
  }

  let summ= sum(distances);

  for(i=1;i<distances.length;++i)
  {
      distances[i]/=summ;
      distances[i]+=distances[i-1];
      //console.log(distances[i]+' ');
  }

  distances[distances.length-1]=1;
  var i=-num_freq;
  for(i;i<=num_freq;++i){
    coefficients.push(calculateCircle(i));

  }
  //  console.log(coefficients );



}


function dash_points_draw()
{

  var i=0;
  for( i=0;i<dash_points.length-1;++i){
    if(i%20<20)
    {
      line(canvasX/2+dash_points[i].real, canvasY/2+dash_points[i].imag, canvasX/2+dash_points[i+1].real, canvasY/2+dash_points[i+1].imag );
    }
  }

}

function drawFourier()
{
  if(coefficients.length===0)
    return;

  time+= deltaTime;
  if(time>time_total){
    dash_points=[];
    time=0;
  }

  stroke(0);
  
  //console.log(coefficients[5].real+ " "+ coefficients[5].imag);
  line(canvasX/2, canvasY/2, coefficients[num_freq].real+canvasX/2,coefficients[num_freq].imag+canvasY/2   );
  var previous= new Coefficient(coefficients[num_freq].real, coefficients[num_freq].imag);
  var i=0;
  for(i=num_freq-1;i>=0;--i)
  {
    var mag1= sqrt(pow(coefficients[i].real,2)+ pow(coefficients[i].imag, 2));

    var phase1=atan2(coefficients[i].imag, coefficients[i].real);

    var mag2= sqrt(pow(coefficients[num_freq*2-i].real,2)+ pow(coefficients[num_freq*2-i].imag, 2));

    var phase2=atan2(coefficients[num_freq*2-i].imag, coefficients[num_freq*2-i].real);

    phase1+=time/time_total*2*PI*(i-num_freq);
    phase2+=time/time_total*2*PI*(num_freq-i);
    var pos1= new Coefficient(mag1*cos(phase1)+previous.real, mag1*sin(phase1)+previous.imag);
    var pos2= new Coefficient(mag2*cos(phase2)+pos1.real, mag2*sin(phase2)+pos1.imag);
    line(previous.real+canvasX/2, previous.imag+canvasY/2, pos1.real+canvasX/2, pos1.imag+canvasY/2);
    line(pos1.real+canvasX/2, pos1.imag+canvasY/2, pos2.real+canvasX/2, pos2.imag+canvasY/2);

    previous= pos2;





  }
  dash_points.push(previous);








  //var i=0;
  //for(i;i<=50;++i)

}


function draw() {
  background(250,250,250);

  var release=0;


  if (mouseIsPressed)
  {
    is_pressed=1;
  }
  else if(is_pressed===1)
  {
    if(mouseX>=0 && mouseX<canvasX && mouseY>=0 && mouseY<canvasY)
    {

      release=1;
    }
    is_pressed=0;
  }



  if(line_builder===1)
  {
    lineBuilder(release);
  }


  drawObjects();

  if(draw_mode===0){
    drawFourier();
    dash_points_draw();
  }

}
