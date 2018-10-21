"use strict";
const IMG_PER_PAGE = 50;
var currentpage = 1;
var currentpagenb = 0;
var currenturl = "";
var currentquery = {};


function browseimages(){
    // set url to use browse API
    currenturl = API_BASEURL + "/gallery/browseimages?limit="+IMG_PER_PAGE
    // set body to empty
    currentquery = {};
    // launch api request
    gotopage(1);
};

function launchsearch(){

    let query = $('#search-text').val();
    enablephotos();
    if (query.length > 0 && query != 'search'){
        search(query);
    } else {
        browseimages();
    }
}

function search(query){
    
    // set url to use search API
    currenturl = API_BASEURL + "/gallery/searchimages?limit="+IMG_PER_PAGE;
    // add body with text request
    currentquery = { q: query };
    // launch api request
    gotopage(1);
};

function activateCarouselImage(id){
    //$('#inner-container-photos').addClass('d-none');
    //$('#carousel-container').removeClass('d-none');
    $('#carousel_'+id).addClass('active');
};

function disableCarousel(){
    $('[id^=carousel_]').removeClass('active');
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

   $('#inner-container-photos').empty();
   $('#inner-carousel').empty();

   var yearmonth = "";
   let line = 0;
   var itemnb = 0;
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
           $('<div id="line'+line+'" class="row m-1">').appendTo('#inner-container-photos');
           $('<div class="col-10"><p class="font-weight-light text-muted m-0">'+itemyearmonth+'</p></div>').appendTo('#line'+line);
       }
       let score = (item.score)? ' - score: '+item.score.toFixed(2) : '';
       
      /*$( '<div class="col-12 col-sm-6 col-md-4 col-lg-3"> \
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
       */
      $( '<div class="tarjeta"> \
            <div class=""> \
                <a class="icon-overlay position-absolute p-1" href="'+item.path+'" download><i class="fas fa-arrow-alt-circle-down fa-lg"></i></a> \
                <a class="icon-overlay position-absolute p-1" style="left:1.5rem;" href="javascript:event.preventDefault();" role="button" data-toggle="popover" data-trigger="focus" data-placement="right"  \
                title="' + item.filename + '" data-html="true" data-content="<ul><li>Dir: '+item.dir+'</li><li>Fecha: '+ created_at +'</li><li>Camara: ' + camara +'</li></ul>"> \
                <i class="fas fa-info-circle fa-lg"></i></a> \
                <a id="link_'+itemnb+'" class="card-link" href="#modal-photo" data-toggle="modal" data-slide-to="'+itemnb+'"> \
                    <img class="img-tarjeta" src="'+item.smallthumb+'" /> \
                    <div class="card-img-overlay fondo"></div> \
                </a> \
            </div> \
        </div>').appendTo('#line'+line);


       $('<div id="carousel_'+itemnb+'" class="carousel-item"> \
       <img class="img-modal" src="'+ item.largethumb+'"> \
       </div>').appendTo('#carousel-inner-container');

       itemnb++;

        /* <div class="carousel-item">
                        <img class="d-block" src="http://ultraimg.com/images/photo-2.jpg" alt="Second slide">
                        </div>
        */
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

    // initialize links
   $("a[id^='link_']").on('click',function(){
        activateCarouselImage(this.id.substring(5));
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
