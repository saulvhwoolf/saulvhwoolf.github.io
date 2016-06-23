var weatherData;

var sliders = []

var currentRow = 0;
var yesterdayReceived =0, historyReceived = 0, futureReceived = 0;

var todayValues = new Array(264);
var numHistoryHours = 0;

var inputFormat = d3.time.format("%I:%M %p %B %e, %Y"); //10:00 PM
var dateFormat = d3.time.format("%B %e, %Y"); //10:00 PM
var outputFormat = d3.time.format("%I:%M %p");

var date = getCurrentDate();
var hoursPast = getHourPast();

var yesterdayxmlhttp = new XMLHttpRequest();
var historyxmlhttp = new XMLHttpRequest();
var futurexmlhttp = new XMLHttpRequest();


function getData() {
	weatherData = new WeatherEvent(date);

	var url = "http://api.wunderground.com/api/4e82459ed4c5500f/yesterday/q/MA/BOSTON.json";
	yesterdayxmlhttp.onreadystatechange=function() 
	{
		if (yesterdayxmlhttp.readyState == 4 && yesterdayxmlhttp.status == 200) 
		{
			console.log("LOADED YESTERDAY");
	        historyDataYesterday(weatherData, yesterdayxmlhttp.responseText);
		    url = "http://api.wunderground.com/api/4e82459ed4c5500f/history_" + date + "/q/MA/BOSTON.json";
			historyxmlhttp.onreadystatechange=function() 
			{
				if (historyxmlhttp.readyState == 4 && historyxmlhttp.status == 200) 
				{
					console.log("LOADED TODAY PAST");
				    historyDataToday(weatherData, historyxmlhttp.responseText);
					url = "http://api.wunderground.com/api/4e82459ed4c5500f/hourly10day/q/MA/BOSTON.json";
					futurexmlhttp.onreadystatechange=function() 
					{
						console.log("LOADED FUTURE");

				  		if (futurexmlhttp.readyState == 4 && futurexmlhttp.status == 200) {
				        	futureData(weatherData, futurexmlhttp.responseText);	
				        	finishData(weatherData);
					       	updateScreen(1);
							addClickables(1);
							displayBar(1);
					    }    	
					}
					futurexmlhttp.open("GET", url, true);
					futurexmlhttp.send();
				}	
			}
			historyxmlhttp.open("GET", url, true);
			historyxmlhttp.send();
		}

	}
	yesterdayxmlhttp.open("GET", url, true);
	yesterdayxmlhttp.send();
	
}
function finishData(weatherData){
	// console.log("h" + historyReceived + ", f" + futureRecieved);
	if((futureReceived + historyReceived + yesterdayReceived < 3)) {//we want it to match
		console.log("failed" + "y" + yesterdayReceived + ", h" + historyReceived + ", f" + futureReceived);
        setTimeout(
        	function() {finishData(weatherData);},
   			50)
   		;//wait 50 millisecnds then recheck
        return;
    }
    console.log("PASSED DATACHECK TEST" + "y" + yesterdayReceived + ", h" + historyReceived + ", f" + futureReceived);
    readyToLoad = 1;
    var i;
    var sum = "";
    var num = 0;
    for(i = 0; i < 24; i++)
    {
    	sum += "" + weatherData.getDay(1).getHour(i);
    }
    // console.log("Values:" + sum);
    // console.log("number:" + num);


}

function historyDataYesterday(weatherData, response) {
	var yesterday = new WeatherEventDay(0);
 	var json = JSON.parse(response);
 	var day = json.history.observations;
 	numHistoryHours = day.length;
 	console.log("NUMHISTORY =" + numHistoryHours);

 	var lookingFor = 0;
	var i;
 	for(i = 0; i < numHistoryHours; i++){
 		var hour = day[i];
 		var out = "";
 		if(lookingFor > 23)
 		{
 			i = numHistoryHours;
 		}
 		else if(hour.date.hour == lookingFor)
 		{
 			out = "Added";
 			yesterday.addHour(lookingFor, new WeatherEventHour(i, hour.date.pretty, hour.tempi, hour.conds));
 			lookingFor++;
 		}
 		out += hour.date.hour;
 		// console.log(out);
 		// todayValues[i] = day[i].tempi + ", " + day[i].conds;
 	}
 	weatherData.addDay(0, yesterday, "YESTERDAY");
 	yesterdayReceived = 1;
}
var today;
function historyDataToday(weatherData, response) {
	today = new WeatherEventDay(1);
 	var json = JSON.parse(response);
 	var day = json.history.observations;
 	// console.log("TODAYDAY" + day);
 	numHistoryHours = day.length;
 	var lookingFor = 0;
	var i;
 	for(i = 0; i < numHistoryHours; i++){
 		var hour = day[i];
 		if(lookingFor > hoursPast)
 		{
 			i = numHistoryHours;
 		}
 		else if(hour.date.hour == lookingFor)
 		{
 			today.addHour( i, new WeatherEventHour(i, hour.date.pretty, hour.tempi, hour.conds));
 			lookingFor++;
 		}
 		// todayValues[i] = hour.tempi + ", " + hour.conds;
 	}
 	weatherData.addDay(1, today, "TODAY");
 	historyReceived = 1;
}
function futureData(weatherData, response){

	// var today = weatherData.getDay(1);
	// console.log(today);
	var json = JSON.parse(response);
 	var data = json.hourly_forecast;
	var i = numHistoryHours;
	var index = 0;
	// console.log("HISTORY" + numHistoryHours);
	for(; i < 24; i++){
		// console.log("Placing in " +i);
		var hour = data[index];
		today.addHour(i, new WeatherEventHour(i, hour.FCTTIME.pretty, hour.temp.english, hour.condition));
		index++;
	}
	weatherData.addDay(1, today, "FUTURE");
	var j = 0;
	var day;

	for(i = 0;i < 8; i++){
		day = new WeatherEventDay(i+2);
		for(j = 0; j < 24; j++){
			var hour = data[index];
			day.addHour(j, new WeatherEventHour(j, hour.FCTTIME.pretty, hour.temp.english, hour.condition));
			index++;
		}
		weatherData.addDay((i+2), day, "FUTURE");
	}

	// console.log("future:" + (24 - numHistoryHours));
	// console.log(data.length);
 	for(; i < data.length; i++){
 		todayValues[i] = "(" + data[i].FCTTIME.hour + ", " + data[i].temp.english + "," + data[i].condition + ")";
 	}
 	futureReceived = 1;
}

function getCurrentDate(){
	var date = new Date();
	var todayDate = new Date();
	var dd = todayDate.getDate();
	var mm = todayDate.getMonth()+1; //January is 0!
	if(mm < 10)
		mm = "0"+mm;
	var yyyy = todayDate.getFullYear();
	return "" + yyyy + mm + dd;

}


function getCurrentHour(){
	var todayDate = new Date();
	var mm = todayDate.getHours(); //January is 0
	return mm;

}
function getHourPast(){
	var date = new Date();
	console.log("CURRNET TIME"+ date.getHours());
	return date.getHours();
}

function formatTime(time)
{
	return  inputFormat.parse(time.substring(0, time.indexOf("EDT on")) + time.substring(time.indexOf("EDT on")+ 7));
}

function WeatherEvent(date){
	this.days = new Array(10);
	this.date = date;
	this.toString = function(){
		return date;
	}
	this.addDay = function(num, day, source){
		// console.log("ADDED DATA FOR DAY " + num+";")
		// console.log(source);
		this.days[num] = day;
	}
	this.getDay = function(day){
		return this.days[day];

	}
	this.eraseDay = function(day){
		this.days[day] = null;
	}
	
	this.numDays = function(day){return this.days.length;}
}
function WeatherEventDay(num){
	this.dayNum = num;
	this.hours = new Array(24);
	var i;
	this.imgURL = "http://i.imgur.com/KnQQIzV.png";
	// for(i = 0; i < 24;i++){

	// }

	this.getDate = function(){
		// console.log(num);
		var hour = getCurrentHour();
		var time = formatTime(this.hours[12].getTime());
		// console.log("hour"+ hour);
		var date = "";
	    if(this.dayNum == 0)
	      date = "Yesterday, " + dateFormat(time);//.substring(15);
	    else if(this.dayNum  == 1)
	   	{
		  var time = formatTime(this.hours[hour].getTime());
	      date = "Today, " + outputFormat(time);//.substring(15);
	    }
	    else if(this.dayNum  == 2)
	      date = "Tomorrow, " + dateFormat(time);//.substring(15);
	    else
	      date = dateFormat(time);
	    return date;
		// return days[num]
	}
	// this.toString = function(){
 //    	var date = "ho" + this.date.substring(15);
	//     return "Showing weather for:<BR>" + date + "<br><a href='#'><img src=" + this.imgURL + 
	//     " height='100' width='100' border=0/></a><br>  <br>" + this.conditions + 
	//     "<br> With a high of " + this.high + "<br> And a low of " + this.low;
 //  	}
  	this.addHour = function(num, hour){
  		// console.log("HOUR " + num+";")

		this.hours[num] = hour;
	}
	this.getHour= function(hour){
		// console.log(this.hours[hour]);
		return this.hours[hour];
	}
	this.getHours= function(){
		return this.hours;
	}
	this.toString = function(){
		// console.log("toString of day" + this.dayNum)
		return this.hours[12].toString();// + this.miniString();
	}
	this.toString = function(hour){
		// console.log("toString of day" + this.dayNum)
		return this.hours[hour].toString();// + this.miniString();
	}
	this.miniString = function(){
    	return "<br><a href='#'><img src=" + this.imgURL + " height='190' width='200' border=10/></a><br>";
	}
	this.getTemps = function(){
		var temps = new Array(24),
		i =0;
		for(i = 0; i < 24; i++)
		{
			temps[i] = this.hours[i].getTemp();
		}
		return temps;
	}
}
function WeatherEventHour(num, time, temp, condition) {
	this.hourNum = num;
	this.time = time;
	this.temp = temp;
	this.condition = condition;
	this.iconURL = "http://icons.wxug.com/i/c/k/clear.gif"
	this.toString = function(){
		// return "("+ this.hourNum + ")";
		// return "(" + this.time + ": " + this.temp + " degrees, "+ this.condition + ")";
		return temp + " deg<br>and<br>" + condition;
	}
	this.vizString = function(){
		// return "("+ this.hourNum + ")";
		// return "(" + this.time + ": " + this.temp + " degrees, "+ this.condition + ")";
		return this.toString() + "<br><a href='#'><img src=" + this.iconURL + " height='40' width='40' border=10/></a>";
	}
	this.getTime = function(){
		return time;
	}
	this.getTemp = function(){
		return temp;
	}
}

// function WeatherEvent() {
//   this.date = "";
//   this.high = 0, this.low = 0;
//   this.conditions = "";
//   this.imgURL = "http://i.imgur.com/KnQQIzV.png";

//   
//   this.getDate = function(current){
//     var date = "";
//     if(current == -1)
//       date = "Yesterday, " + this.date.substring(15);
//     else if(current == 0)
//       date = "Today, " + this.date.substring(15);
//     else if(current == 1)
//       date = "Tomorrow, " + this.date.substring(15);
//     else
//       date = this.date.substring(15);
//     return date;
//   }
//   this.toString = function(center){
//     return "Right Now, The weather outside it:" + "<br><a href='#'><img src=" + this.imgURL + 
//      " height='200' width='250' border=5/></a><br>" + this.conditions + " with a high of " + 
//      this.high + "˚ and a low of " + this.low + "˚";
//     // return "Showing weather for:<BR>" + date + "<br><a href='#'><img src=" + this.imgURL + 
//     // " height='100' width='100' border=0/></a><br>  <br>It is " + this.conditions + 
//     // "<br> With a high of " + this.high + "<br> And a low of " + this.low;
//   }
//   this.miniString = function(){
//     return "<br><a href='#'><img src=" + this.imgURL + " height='190' width='200' border=10/></a><br>";
//   }
//   this.finish = function(){
//     if(this.conditions == "Partly Cloudy")
//       this.imgURL = "http://i.imgur.com/sV0HXi4.png";
//     else if(this.conditions == "Clear")
//       this.imgURL = "http://i.imgur.com/KnQQIzV.png";
//     else if(this.conditions == "Chance of Rain")
//       this.imgURL = "http://i.imgur.com/zczKvID.png";
//     else if(this.conditions == "Chance of a Thunderstorm")
//       this.imgURL = "http://i.imgur.com/Qfho6sq.png";
//     else
//       this.imgURL = "http://cdn1-www.dogtime.com/assets/uploads/gallery/30-impossibly-cute-puppies/impossibly-cute-puppy-2.jpg"
//   }
//   //WINDY     http://i.imgur.com/NmqpsTm.png 
//   //SUNNY     http://i.imgur.com/KnQQIzV.png
//   //STORMY    http://i.imgur.com/Qfho6sq.png
//   //SNOWY     http://i.imgur.com/OuroXOo.png
//   //.5CLOUD   http://i.imgur.com/sV0HXi4.png
//   //RAIN      http://i.imgur.com/zczKvID.png
//   //NIGHT     http://i.imgur.com/IH74qFJ.png
//   //HOT       http://i.imgur.com/o9qvoax.png
//   //CLOUDY    http://i.imgur.com/FoQ8kkE.png

// }

getData();

