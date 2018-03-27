"use strict";
const API_BASEURL = "/node/api";
const TIMER_G2H = 60*1000;
const TIMER_CURRENT = 60*1000;
const TIMER_GWEEK = 5*60*1000;
const IMG_PER_PAGE = 50;
const CITYID = 3117735;
const APIKEY = '1e5dd90ebb1974b27d7fbb47ea12fab3';
const TEMP_URL= "http://api.openweathermap.org/data/2.5/forecast?id="+CITYID+"&APPID="+APIKEY+"&units=metric";

var timerGraph2hours;
var timerCurrentVal;
var timerGraphWeek;
//var timerBsGraph;
var currentpage = 1;
var currentpagenb = 0;
var currenturl = "";
var currentquery = {};


var chartG6H = nv.models.lineChart();
var chartWeek = nv.models.lineWithFocusChart();

$(function() {
    // Handler for .ready() called.

    $('#photos').click(function(){ enablephotos(); return false; });

    $('#monitor').click(function(){ enablemonitor(); return false; });

    $( '#search-btn' ).on('click',function(){
        event.preventDefault();
        let query = $('#search-text').val();
        if (query.length > 0){
            search(query);
        } else {
            browseimages();
        }
    });

    
      

    $('#blueimp-gallery').on('slide', function (event, index, slide) {
        // Gallery slide event handler
        $(this).children('.description').text($('#inner-container-photos a').eq(index).data('description'));
    });

    $('#ExteriorIndicator').radialIndicator({
        displayNumber: false,
        barColor: '#87CEEB',
        radius: 70,
        barWidth: 3,
        roundCorner : false,
        percentage: false,
        minValue: -10,
        maxValue: 50,
        fontfamily: "font-family: 'Open Sans', sans-serif;",
        fontWeight: 'normal',
        frameTime: 1,
        frameNum: 600
    });

    //nv.addGraph(init6HoursChart);
    nv.addGraph(initWeekChart);
    enablemonitor();
});


/*
    Main week graph
*/
function initWeekChart(){
    
    // mapear x e y hacia las columnas
    chartWeek.x(function(d) {
        var b = new Date(d.x).getTime();
        return b;
    });
    //chart.y(function(d) { return d.value; });
    // formato ejes
    chartWeek.xAxis
        //.staggerLabels(true)
        .tickFormat(function (d) {
        return d3.time.format('%a %d - %H:%M')(new Date(d));
    });
    
    chartWeek.x2Axis
        //.staggerLabels(true)
        .tickFormat(function (d) {
        return d3.time.format('%a %d - %H:%M')(new Date(d));
    });
    chartWeek.margin({top: 50, right: 50, bottom: 50, left: 50})
    chartWeek.yTickFormat(d3.format(',.1f'));
    chartWeek.yAxis.axisLabel("ºC");
    chartWeek.interpolate("basis");
    chartWeek.useInteractiveGuideline(true);

    return chartWeek;
};

function updateWeekChart(){

    var now = new Date();
    var lastweek = new Date();
    lastweek.setHours(-24*7,0,0,0);

    d3.json(API_BASEURL+"/temperature?sampling=30&ini="+lastweek.toISOString(), function(error, data) {	
        if (error) return console.log(error);

        //var max = d3.max(data, function(c) { return d3.max(c.values, function(d) { return d.y; }); })+1; 
        //var min = d3.min(data, function(c) { return d3.min(c.values, function(d) { return d.y; }); })-1;
        //chartWeek.forceY([min, max]);
        
        var weekticks = [];
        var s = new Date(lastweek);// new Date($('#hfEventStartDate').val() - 0);
        while(s.valueOf() < now.valueOf()) {
            weekticks.push(s);
            s = new Date(s.setDate(
                s.getDate() + 1
            ));
        }

        chartWeek.xAxis.tickValues(weekticks);
        chartWeek.x2Axis.tickValues(weekticks);

        d3.select('#chart_week svg')
            .datum(data)
            .call(chartWeek);

        nv.utils.windowResize(chartWeek.update);
    });

    timerGraphWeek = setTimeout(updateWeekChart, TIMER_GWEEK);
    
};

function updateCurrentVal(){
    /*
    $.getJSON( API_BASEURL+"/temperature/Exterior/current", function( data ) {
        let temp= parseFloat(data[0].value);
        var radialObj = $('#ExteriorIndicator').data('radialIndicator');
        //radialObj.option('displayNumber',false);
        radialObj.animate(temp);
        //radialObj.option('displayNumber',true);
    });
    */


    
    $.getJSON( API_BASEURL+"/temperature/current", function( data ) {
        $.each( data, function(key,val) {
            let id = val._id;
            let temp= parseFloat(val.value);
            let m = moment(val.timestamp);
            let ts = "";
            if(m.isBefore(new Date(),'day')){
                ts = m.format('ddd DD/MM HH:mm:ss');
            } else {
                ts = m.format('HH:mm:ss');
            };

            // update radial indicator
            if (id=="Exterior"){
                var radialObj = $('#ExteriorIndicator').data('radialIndicator');
                radialObj.animate(temp);
            }

            $("#temp-"+id).text(temp.toFixed(1));
            $("#temp-ts-"+id).text(ts);
            
        });
    });


    //$.getJSON("http://api.openweathermap.org/data/2.5/forecast?id=524901&APPID={APIKEY}")

    timerCurrentVal = setTimeout(updateCurrentVal, TIMER_CURRENT);
};



function enablephotos(){
    // stop refreshing
    clearTimeout(timerCurrentVal);
    clearTimeout(timerGraph2hours);
    clearTimeout(timerGraphWeek);

    $('#container-monitor').addClass('d-none');
    $('.nvtooltip').remove();

    $('#container-photos').removeClass('d-none');
    $('#div-search-bar').removeClass('d-none');
    $('#div-text-results').removeClass('d-none');
    $('#div-nav-pg-btn').removeClass('d-none');
    $('#scan-btn').removeClass('d-none');

    $('#monitor').parent().removeClass('active');
    $('#photos').parent().addClass('active');

    browseimages();
};

function browseimages(){
    // set url to use browse API
    currenturl = API_BASEURL + "/gallery/browseimages?limit="+IMG_PER_PAGE
    // set body to empty
    currentquery = {};
    // launch api request
    gotopage(1);
};


function search(query){
    // set url to use search API
    currenturl = API_BASEURL + "/gallery/searchimages?limit="+IMG_PER_PAGE;
    // add body with text request
    currentquery = { q: query };
    // launch api request
    gotopage(1);
};


function enablemonitor(){
    $('#container-photos').addClass('d-none');
    $('#div-search-bar').addClass('hidden');
    $('#div-text-results').addClass('hidden');
    $('#div-nav-pg-btn').addClass('hidden');
    $('#scan-btn').addClass('hidden');
    
    $('#container-monitor').removeClass('d-none');
    $('#monitor').parent().addClass('active');
    $('#photos').parent().removeClass('active');

    updateCurrentVal();
    //updateChart6Hours();
    updateWeekChart();
};


function gotopage(pagetgt){

    let target = parseInt(pagetgt,10);
    let url = currenturl + "&skip="+(IMG_PER_PAGE*(target-1));

    $.getJSON( url, currentquery)
    .done(function( data ) {
        showresults(data,target);
    });
};

function showresults(data,page){

    $('#text-results-nb').text(data.imgcount + " Results");

    if (data.imgcount == 0){
        $('#inner-container-photos').empty();
        $('#photo-pagination').addClass('hidden');

    } else {
        currentpagenb = Math.ceil(data.imgcount/IMG_PER_PAGE);
        currentpage = page;
        updatenav(currentpagenb,currentpage);
        populateimages(data.images,data.imgcount);
    }
};


function nextpage(){

    if(currentpage < currentpagenb){
        gotopage(currentpage+1);
    } else {
        gotopage(currentpage);
    }
};

function prevpage(){

    if(currentpage > 1){
        gotopage(currentpage-1);
    } else {
        gotopage(currentpage);
    }
};

function scan(){
    $('#scan-btn').addClass('disabled');
    let url = API_BASEURL + "/gallery/scan";
    $.getJSON( url, currentquery)
    .done(function( data ) {
        $('#scan-btn').removeClass('disabled');
    });
}

function populateimages(imgarray,totalcount){
    /*
    $('#inner-container-photos').empty();

    var yearmonth = "";
    let line = 0;
    $.each( imgarray, function( i, item ) {
    
        let m = moment(item.created_at);
        m.locale('es');
        let itemyearmonth = m.format('MMMM YYYY');
        let created_at = m.format('DD MMM YYYY HH:mm:ss');
        if (itemyearmonth != yearmonth) {
            if (line!=0){
                $('</div>').appendTo('#line'+line);
            }
            line++;
            yearmonth = itemyearmonth;
            $('<div id="line'+line+'" class="row no-gutters">').appendTo('#inner-container-photos');
            $('<div class="col-12"><h2>'+itemyearmonth+'</h2></div>').appendTo('#line'+line);
        }
        let score = (item.score)? ' - score: '+item.score.toFixed(2) : '';
        $(' <div class="col-12 col-md-6 col-lg-3 col-xl-2"> \
                    <a href="'+item.largethumb+'" title="'+ 
                        item.filename+'" data-description="'+created_at+'" data-gallery> \
                        <img src="'+item.smallthumb+'" class="img-fluid"/></a> \
                    <div class="card-img-overlay"> \
                        <div class="icon_overlay"> \
                        <i class="fas fa-download fa-lg" data-fa-transform="shrink-3.5" data-fa-mask="fas fa-circle"> \
                    <a href="#" /></i> \
                    </div> \
            </div>').appendTo('#line'+line);

    });
    $('</div>').appendTo('#line'+line);
    */

   //$('#inner-container-photos').empty();

   var yearmonth = "";
   let line = 0;
   $.each( imgarray, function( i, item ) {
   
       let m = moment(item.created_at);
       m.locale('es');
       let itemyearmonth = m.format('MMMM YYYY');
       let created_at = m.format('DD MMM YYYY HH:mm:ss');
       let camara='';
        try {
            camara=item.info.Make + ' '+ item.info.Model;
        } catch (error) {
            console.log("error en datos info en fichero "+item.filename);
        }

       if (itemyearmonth != yearmonth) {
           if (line!=0){
               $('</div>').appendTo('#line'+line);
           }
           line++;
           yearmonth = itemyearmonth;
           $('<div id="line'+line+'" class="row">').appendTo('#inner-container-photos');
           $('<div class="col-12 m-1"><h6>'+itemyearmonth+'</h6></div>').appendTo('#line'+line);
       }
       let score = (item.score)? ' - score: '+item.score.toFixed(2) : '';
       /*
       <div class="col-6 col-lg-4">
            <div class="card bg-light text-white">
                <a class="icon-overlay position-absolute p-1" href="javascript:alert('downdload');"><i class="fas fa-arrow-alt-circle-down fa-lg"></i></a>
                <a class="icon-overlay position-absolute p-1" style="left:1.5rem; "href="javascript:alert('info');" role="button" data-toggle="popover" data-trigger="focus" data-placement="right" title="Dismissible popover" data-content="And here's some amazing content. It's very engaging. Right?"><i class="fas fa-info-circle fa-lg"></i></a>
                
                <a class="card-link" href="javascript:alert('image');">
                    <img class="card-img" src="http://ultraimg.com/images/photo-1.jpg" />
                    <div class="card-img-overlay fondo"></div>
                </a>
        
            </div>
        </div>
       */
      $( '<div class="col-12 col-sm-6 col-lg-4"> \
            <div class="card bg-light text-white mx-auto"> \
                <a class="icon-overlay position-absolute p-1" href="'+item.path+'"><i class="fas fa-arrow-alt-circle-down fa-lg"></i></a> \
                <a class="icon-overlay position-absolute p-1" style="left:1.5rem;" href="javascript:event.preventDefault();" role="button" data-toggle="popover" data-trigger="focus" data-placement="right"  \
                title="' + item.filename + '" data-html="true" data-content="<ul><li>Dir: '+item.dir+'</li><li>Fecha: '+ created_at +'</li><li>Camara: ' + camara +'</li></ul>"> \
                <i class="fas fa-info-circle fa-lg"></i></a> \
                <a class="card-link" href="#"> \
                    <img class="card-img" src="'+item.smallthumb+'" /> \
                    <div class="card-img-overlay fondo"></div> \
                </a> \
            </div> \
        </div>').appendTo('#line'+line);

       /*
       $(   '<div class="col-6 col-xl-4"><a href="'+item.largethumb+'" title="'+ 
                       item.filename+'" data-description="'+created_at+'" data-gallery> \
                       <img src="'+item.smallthumb+'" class="img-fluid"/> \
                       </a> \
                <div class="icon_overlay"> \
                    <i class="fas fa-download fa-lg" data-fa-transform="shrink-3.5" data-fa-mask="fas fa-circle"> \
                    <a href="#" /></i> \
                </div> \
            </div>').appendTo('#line'+line);
        */
   });
   $('</div>').appendTo('#line'+line);

   // initialize photos' popovers
   $('[data-toggle="popover"]').popover({
    container: 'body'
  });
};

function updatenav(pgnumber, currentpg){
  $('.pagebtn').remove();  
// pagination
    if (pgnumber <= 15){
        for(let i=1; i <= pgnumber; i++){
            $('<li id="pg-nb-btn-'+i+'" class="pagebtn" ><a href="#">'+i+'</a></li>').insertBefore('#pg-next-btn');
            $('#pg-nb-btn-'+i).click(function(){ gotopage(i); return false; });
        }         
    } else { // more than 10 pages
        // distance pagenb - current page

        if (currentpg <= 7){
            // show 1 2 3 4 5 6 7 8 9 10 11 12 13 ... 5000
            for(let i=1; i <= 13; i++){
                $('<li id="pg-nb-btn-'+i+'" class="pagebtn" ><a href="#">'+i+'</a></li>').insertBefore('#pg-next-btn');
                $('#pg-nb-btn-'+i).click(function(){ gotopage(i); return false; });
            }
            $('#pg-nb-btn-'+currentpg).addClass("active");
            $('<li id="pg-nb-btn-dot" class="disabled pagebtn" ><a href="#">...</a></li>').insertBefore('#pg-next-btn');
            $('<li id="pg-nb-btn-'+pgnumber+'" class="pagebtn"><a href="#">'+pgnumber+'</a></li>').insertBefore('#pg-next-btn');
            $('#pg-nb-btn-'+pgnumber).click(function(){ gotopage(pgnumber); return false; });

            // until: 1 ... 3 4 5 6 7 8 9 10 11 12 13 ... 5000

        } else if (currentpg >= (pgnumber-7)){
            // show 1 ... 13 14 15 16 17 18 19 20 21 22 23
            $('<li id="pg-nb-btn-1" class="pagebtn"><a href="#">1</a></li>').insertBefore('#pg-next-btn');
            $('<li id="pg-nb-btn-dot" class="disabled pagebtn" ><a href="#">...</a></li>').insertBefore('#pg-next-btn');
            for(let i=(pgnumber-12); i <= pgnumber; i++){
                $('<li id="pg-nb-btn-'+i+'" class="pagebtn" ><a href="#">'+i+'</a></li>').insertBefore('#pg-next-btn');
                $('#pg-nb-btn-'+i).click(function(){ gotopage(i); return false; });
            }
            $('#pg-nb-btn-'+currentpg).addClass("active");
            
        } else {
            // show 1 ... 25 26 27 28 29 30 31 32 33 34 35 ... 5000
            $('<li id="pg-nb-btn-1" class="pagebtn" ><a href="#">1</a></li>').insertBefore('#pg-next-btn');
            $('<li id="pg-nb-btn-dot" class="disabled pagebtn" ><a href="#">...</a></li>').insertBefore('#pg-next-btn');
            for(let i=(currentpg-5); i <= (currentpg+5); i++){
                $('<li id="pg-nb-btn-'+i+'" class="pagebtn" ><a href="#">'+i+'</a></li>').insertBefore('#pg-next-btn');
                $('#pg-nb-btn-'+i).click(function(){ gotopage(i); return false; });
            }
            $('#pg-nb-btn-'+currentpg).addClass("active");
            $('<li id="pg-nb-btn-dot" class="disabled pagebtn" ><a href="#">...</a></li>').insertBefore('#pg-next-btn');
            $('<li id="pg-nb-btn-'+pgnumber+'" class="pagebtn" ><a href="#">'+pgnumber+'</a></li>').insertBefore('#pg-next-btn');
            $('#pg-nb-btn-'+pgnumber).click(function(){ gotopage(pgnumber); return false; });

        }
    }
    $('#photo-pagination').removeClass('hidden');
    $('#pg-nb-btn-'+currentpg).addClass('active');
    
};


function thumbnailclick(img){

    $('#container-photos').addClass('hidden');
    $('#nav-menu').addClass('hidden');
    
    $('#container-slider').removeClass('hidden');
    
};


    /*
        Baseline graph
    */
    
    /*
    var bsgraph = nv.models.lineChart();

    // mapear x e y hacia las columnas
    bsgraph.x(function(d) {
        var b = new Date(d.x).getTime();
        return b;
    });
    //chart.y(function(d) { return d.value; });
    // formato ejes
    bsgraph.xAxis
        //.staggerLabels(true)
        .tickFormat(function (d) {
        return d3.time.format('%H:%M')(new Date(d));
    });
    
    
    bsgraph.yTickFormat(d3.format(',.1f'));
    bsgraph.yAxis.axisLabel("ºC");
    
    bsgraph.interpolate("basis");

    function loadBsGraph(){

        d3.json(API_BASEURL+"/temperature/Exterior/pattern", function(error, data) {	
            if (error) return console.log(error);

            var max = d3.max(data, function(c) { return d3.max(c.values, function(d) { return d.y; }); })+1; 
            var min = d3.min(data, function(c) { return d3.min(c.values, function(d) { return d.y; }); })-1;
            bsgraph.forceY([min, max]);
            
            d3.select('#chart_baseline svg')
                .datum(data)
                .call(bsgraph);

            nv.utils.windowResize(bsgraph.update);
        });
        
        timerBsGraph = setTimeout(loadBsGraph, TIMER_G2H);
        return bsgraph;
        
    }
    
    nv.addGraph(loadBsGraph);
    
    var x = bsgraph.xScale();
    var y = bsgraph.yScale();
    var area = d3.svg.area()
    .x(function (d) { 
        var b = new Date(d.x).getTime();
        return b;
    })
    .y0(function (d) { 
        return y(d.y0); 
    })
    .y1(function (d) { 
        return y(d.y1); 
    });

    var drawArea = function () {
        d3.select(".area").remove();
        d3.select('.nv-linesWrap')
            .append("path")
            .datum(data)
            .attr("class", "forecastArea")
            .attr("d", area)
            .style("fill", "#AEC7E8")
            .style("opacity", .2);
    }
    drawArea();

    */