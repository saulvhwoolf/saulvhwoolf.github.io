
// console.log(weatherData);

var center = 1;
  
function addClickables(center){
  leftBoxElement = document.getElementById('box1');
  if (leftBoxElement) 
  {
    leftBoxElement.addEventListener('click', function() {
      if(center > 0)
        center --;
      updateScreen(center);
    });
  }
  rightBoxElement = document.getElementById('box3');
  if (rightBoxElement) 
  {
    rightBoxElement.addEventListener('click', function() {
      if(center< 10)
        center ++;
      updateScreen(center);
    });
  }
}



function updateScreen(center) {
  var time = 12;
  if(center == 1)
  {
    time = getCurrentHour();
  }
  // console.log("UPDATE SCREEN" + weatherData.getDay(0));
  if(center > 0)
  {
    // console.log("center"+(center-1));
    document.getElementById("boxContainer1").innerHTML = weatherData.getDay(center-1).getDate()+ 
    "<div class = 'box' id = 'box1'> </div>" ;
    // console.log(weatherData.getDay(center-1));

    document.getElementById("box1").innerHTML = "" + weatherData.getDay(center-1).miniString();
  }
  else
  {
    document.getElementById("boxContainer1").innerHTML ="";//<br><div class = 'box' id = 'box1'> </div>";
    // document.getElementById("box1").innerHTML = "";
  }

  
  if(center< 9)
  {
    document.getElementById("boxContainer3").innerHTML = weatherData.getDay(center+1).getDate()+ 
    "<div class = 'box' id = 'box3'> </div>" ;
    document.getElementById("box3").innerHTML = "" + weatherData.getDay(center+1).miniString();
  }
  else
  {
    document.getElementById("boxContainer3").innerHTML ="";//<br><div class = 'box' id = 'box3'> </div>";
    // document.getElementById("box3").innerHTML = "";
  }

  document.getElementById("boxContainer2").innerHTML = weatherData.getDay(center).getDate()+ 
  "<div class = 'box' id = 'mainBox'> </div>" ;
  document.getElementById("mainBox").innerHTML = "<div id = 'displayText'></div><div id = 'displayImage'></div>";
  document.getElementById("displayText").innerHTML = "<br><br>"+weatherData.getDay(center).toString(time);
  document.getElementById("displayImage").innerHTML = weatherData.getDay(center).miniString();
  addClickables(center);
  displayBar(center);
}
