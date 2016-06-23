 
	var MAP_WIDTH = $("#vizWeather").width(), //960,
    MAP_HEIGHT = 8,
    MAP_SCALE = 2400,
    NB_HEIGHT = 60,
    NUM_BOXES = 24;//1160
    var displayDay = 1;
    //////////////////////////////////
var config = {
    "avatar_size" : 48
}

var body = d3.select("body");

var svg = body.append("svg")
        .attr("width", 500)
        .attr("height", 500);


       
    //////////////////////////////////

    //"2:00 PM EDT on June 19, 2016"

    sliderAnim,
    UPDATE_DT=2000,
    runAnim = function() {
        publish('maps', [1, true]);
    };
    // DATA_DIR = "";//http://kyrandale.com/viz/static/expts/uk-weather-stations/data/";//typeof window.DATA_DIR !== 'undefined'? window.DATA_DIR: 'data/';
    // console.log(DATA_DIR);
    $('#sliderAnim').button();
    $("#sliderAnim").click( function(event){
        event.preventDefault();
        if ($(this).hasClass("active") ) {
            clearInterval(animTimer);
            // $("#nav").animate({marginTop:"0px"}, 200);          
            $(this).removeClass("active");
            $(this).html('Animate');
        } else {
            animTimer = setInterval(runAnim, UPDATE_DT);
            // $("#nav").animate({marginTop:"-100px"}, 200);   
            $(this).addClass("active");
            $(this).html('Stop');
        }
        return false;
    });

	var WeatherSlider = function(data, parent, title, channel, cb, width, height, scale){
		var slider = this;
		this.width = typeof width !== 'undefined'? width: MAP_WIDTH;
        this.height = typeof height !== 'undefined'? height: MAP_HEIGHT;
        this.scale = typeof scale !== 'undefined'? scale: MAP_SCALE;


 		this.data = data;
        this.parent = parent;
        this.title = title;

        this.channel = channel;
        this.cb = cb;	

        this.temps = [];
        this.details = [];
        this.time = [];
        this.count = [];
        this.weatherEvent = [];

        subscribe(channel, function(row, incFlag) {
            if(incFlag){row = (row + slider.currentRow)%NUM_BOXES;}
            slider.updateGrid(row);
        });
        this.currentRow = 0;


        this.svg = d3.select(parent).append("svg")
            .attr("width", this.width)
            .attr("height", this.height+NB_HEIGHT);

        this.parseDate = d3.time.format("%m:%d:%Y").parse;

        slider.initBar();

       
        	

	};

	WeatherSlider.prototype = {
		initBar: function() {
            var slider = this;           

            slider.scaleData();
            slider.makeNavBar();
            dataline = weatherData.getDay(displayDay).getTemps();
            slider.updateGrid(getCurrentHour());
            //if(slider.cb){slider.cb();}

            
        },
        scaleData: function() {
            // color-map to highest and lowest values
            var slider=this, vals, min, max;

            //this.getRowStats(); 
            min = 20;
            max = 100;
            this.gridColors = d3.scale.linear()
                .domain([min, min+max/2, max])
                .range(["#4575b4", "#ffffbf", "#a50026"])
                .interpolate(d3.interpolateHcl);
            var COLOR_BARS = 50, COLOR_BAR_WIDTH = 10, COLOR_BAR_HEIGHT = 2, 
            COLOR_BAR_X = this.width-70, COLOR_BAR_Y = this.height - 200, 
            CB_LABEL_INDICES=[0, 25, 49];
            this.cbscale = d3.scale.linear().domain([0, COLOR_BARS]).range([min, max]);
            this.colorbar = this.svg.selectAll('colorbar')
                .data(d3.range(COLOR_BARS))
                .enter().append('g')
                .attr("transform", "translate(" + COLOR_BAR_X + "," + COLOR_BAR_Y + ")");

            // this.colorbar.append('rect')
            //     .attr('width', COLOR_BAR_WIDTH)
            //     .attr('height', COLOR_BAR_HEIGHT) 
            //     .attr('x', 0)
            //     .attr('y', function(d, i) {
            //         return -i*COLOR_BAR_HEIGHT;
            //     })
            //     .attr('fill', function(d) {
            //         return map.gridColors(map.cbscale(d));
            //     })
            // ;

            // this.colorbar.append('text')
            //     .text(function(d, i) {
            //         if(_.contains(CB_LABEL_INDICES, i)){
            //             return parseInt(min + (max-min) * (i*1.0/COLOR_BARS), 10); 
            //         }})
            //      .attr("x", COLOR_BAR_WIDTH + 10)
            //     .attr("y", function(d, i) { return -i * COLOR_BAR_HEIGHT;})
            //     .attr("dy", '.3em')
            //     .attr('class', 'cb-text');
                      	//"2:00 PM EDT on June 19, 2016"
        },
        makeNavBar:function(){

        	var slider=this, nbscale, NAVBAR_WIDTH = this.width - 40, NAVBAR_HEIGHT = 20, NAVBAR_X = 20, NAVBAR_Y = this.height,
            NB_AXIS_X, NB_AXIS_Y, xScale;
            this.x = d3.time.scale().range([0, NAVBAR_WIDTH]);
            var i = 0, scale = [];
            for(;i<NUM_BOXES;i++){
            	scale[i] = i*NAVBAR_WIDTH/NUM_BOXES;
            } 
            var inputFormat = d3.time.format("%I:%M %p %B %e, %Y"); //10:00 PM

            var startTime = weatherData.getDay(displayDay).getHour(0).getTime();
            var endTime = weatherData.getDay(displayDay).getHour(23).getTime();
            
            //"2:00 PM EDT on June 19, 2016"
            // console.log(startTime + "," + startTime2);
            xScale = d3.time.scale().domain([formatTime(startTime), formatTime(endTime)]).range([0, NAVBAR_WIDTH]);

            this.xAxis = d3.svg.axis().scale(xScale).ticks(NUM_BOXES).orient("bottom");
            this.x.domain(d3.extent(weatherData.getDay(displayDay).getHours(), function(t){
            	// console.log(t);
            	return formatTime(t.getTime());}));

        	nbscale = d3.scale.linear().domain([0, NUM_BOXES]).range([0, NAVBAR_WIDTH]);

        	this.navbar = this.svg.selectAll('navbar')
                .data(weatherData.getDay(displayDay).getTemps(), function(d, i) {
                	// console.log(d+ ", " + i)
                    return d;
                })
                .enter().append('g')
                .attr("transform", "translate(" + NAVBAR_X + "," + NAVBAR_Y + ")");

            this.navbar.append('rect')
                .attr('width', NAVBAR_WIDTH/NUM_BOXES)
                .attr('height', NAVBAR_HEIGHT) 
                .attr('x', function(d, i) {return nbscale(i);})
                .attr('y', 0)
                .attr('fill', function(d) {
                	// console.log(d);
                	// return "url(#bg)";
                    return slider.gridColors(d);
                })
                // .attr("transform", "translate(" + x + "," + y + ")")
                // .call(drag)
                // .attr("fill", "url(#bg)")
                .attr('id', function(d, i) {
                    return 'nb_' + i;
                })
                .attr('cursor', 'pointer')
                .on('click', function(d, i) {
                   // map.updateGrid(i);
                    publish(slider.channel, [i]);
                })
                .append("svg:img")
                .attr("xlink:href", "http://icons.wxug.com/i/c/k/clear.gif")
                .attr("x", "60")
                .attr("y", "60")
                .attr("width", "20")
                .attr("height", "20");
            ;

            this.svg.append('g')
                .attr("class", "x axis")
                .attr("transform", "translate(" + NAVBAR_X + "," + (NAVBAR_Y+NAVBAR_HEIGHT)  + ")")
                .call(this.xAxis);
        },

        updateGrid: function(row) {
            var dataline = weatherData.getDay(displayDay).getTemps();
            slider = this;
            d3.select(this.parent + ' #nb_' + this.currentRow).style('stroke', null);
            d3.select(this.parent + ' #nb_' + row).style('stroke', 'red');
            this.currentRow = row;
            currentRow = row;
            // console.log(row);
            // console.log(slider.weatherEvent[row]);
            d3.select("#sliderDisplay").html(weatherData.getDay(displayDay).getHour(row).vizString());
            d3.select("#sliderDisplay").style("left", (MAP_WIDTH/NUM_BOXES-2)*row+"px");

            d3.select()
            console.log('Setting slider to time ' + weatherData.getDay(displayDay).getHour(row).getTime());

            
            
        },
	};
function formatTime(time)
{
	return  outputFormat.parse(time.substring(0, time.indexOf("EDT on")) + time.substring(time.indexOf("EDT on")+ 7));
}
function displayBar(day)
{
	displayDay = day;
	d3.select("svg").remove();
	sliders[0] = (new WeatherSlider(weatherData, '#vizWeather', 'Weather in FIX', 'maps'));
	// sliders[0].updateGrid(getCurrentHour());
	// console.log("numSLiders:" + sliders.length);
	d3.select('body').call(d3.keybinding()
    	.on('←', console.log("arrow"))//sliders[0].updateGrid(currentRow-1))
    	.on('→', sliders[0].updateGrid(currentRow+1)));
}
// var xmlhttp = new XMLHttpRequest();
// 	var url = "http://api.wunderground.com/api/4e82459ed4c5500f/hourly/q/MA/Boston.json";


var drag = d3.behavior.drag()
        .on("drag", function(d,i) {
            d.x += d3.event.dx
            d.y += d3.event.dy
            d3.select(this).attr("transform", function(d,i){
                return "translate(" + [ d.x,d.y ] + ")"
            })
        });

var num_slider_uninit = 1;
// window.onresize = doALoadOfStuff;

// function doALoadOfStuff() {
    
//     // var spinner = new Spinner({}).spin(document.body);
//     // sliders[0].updateGrid(1);
// }

