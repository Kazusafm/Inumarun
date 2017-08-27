//Canvas
var canvas=document.getElementById("myCanvas");
var ctx=canvas.getContext("2d");

var winH = document.body.clientHeight;
var winW = document.body.clientWidth;

var devicePixelRatio = window.devicePixelRatio || 1;
var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                        ctx.mozBackingStorePixelRatio ||
                        ctx.msBackingStorePixelRatio ||
                        ctx.oBackingStorePixelRatio ||
                        ctx.backingStorePixelRatio || 1;
var ratio = devicePixelRatio / backingStoreRatio;
canvas.width = canvas.width * ratio;
canvas.height = canvas.height* ratio;

ctx.scale(ratio, ratio);
ctx.translate(0.5, 0.5);
ctx.lineWidth = 1;

var canH = canvas.height / ratio;
var canW = canvas.width / ratio;

var gndH = canH*0.9;
redrawGnd()

function redrawGnd(){
    ctx.moveTo(0,canH*0.9);
    ctx.lineTo(canW,canH*0.9);
    ctx.stroke();
    clearGnd();
}
function clearGnd(){
    ctx.clearRect(
        0, 
        gndH-1, 
        600, 
        1
    )
}
//Canvas End

//Parameters

//Control Para

var level = 1
var LEVEL_INTERVAL = 30000
//Player Para
var PLAYER_RATE = 10
var PLAYER_RUN_INTERVAL = 40
//Leo Para
var LEO_ORI_WIDTH = 285;
var LEO_RATE = 10;
var LEO_RUN_INTERVAL = 20
var LEO_RUN_DIS = 5
var GENERATE_INTERVAL = 500
var LEO_WIDTH = LEO_ORI_WIDTH*4/LEO_RATE;
var MIN_GENERATE_DIS = -GENERATE_INTERVAL*(LEO_RUN_DIS/ratio)/LEO_RUN_INTERVAL + LEO_WIDTH;
var MAX_GENERATE_DIS = 2*LEO_WIDTH;
var last_place = 700;


//Level2: Brown Fly
var BROWN_RUN_INTERVAL = 19
var BROWN_RUN_DIS = 5
var BROWN_GENERATE_INTERVAL = 1000
var MIN_BROWN_HEIGHT = 30
var MAX_BROWN_HEIGHT = 100
var FLY_TIME = 1000

//Level3:Leo 187
var LEO_187_RATE = 5;

//Level4: Kaze Leo
var LEO_DOWN_DIS = 0.5
var LEO_STA_HEIGHT = 500

//Parameters End

//Control
var isOver = false;
var isOnAir = false;
var isOpening = false;
var isMoji = false;
var isFly = false;
var isToFly = false;
var isKaze = false;
var isBlack = false;
var isBack = false;
//Control End

//Moji
var ocount = 0;
var oa = new Array(2);
oa[0] = "夏天，还没有结束。";
oa[1] = "面对レナード的挑战";
oa[2] = "这是你的冒险";
oa[3] = "也是我们的冒险。";
oa[4] = "你,能相信吗";
//openWords(oa);

function openWords(oa) {
    var mojiT = setInterval(function() {
        $("#wordsin").fadeOut(1000,function() {
            $("#wordsin").html(oa[ocount]);
            if(isOver == true){
                $("#wordsin").html("");
                window.clearInterval(mojiT);
                ocount = 0;
                if(isOpening == true) isOpening = false;
                isMoji = false;
            }
            if(ocount == oa.length){
                $("#wordsin").html("");
                window.clearInterval(mojiT);
                ocount = 0;
                if(isOpening == true) isOpening = false;
                isMoji = false;
            }
        })
        $("#wordsin").fadeIn(1000,function() {
            ocount++;
        })

    },2000);
}
//MojiEnd



//Score
var score = 0;
scoreWords(score);
function scoreWords(score) {
    $("#scorein").html(score);
}
var gameT = setInterval(
    function(){
        if(isOver == true){
            window.clearInterval(gameT);
            return;
        }
        score++;
        scoreWords(score);
    },50
)
//Score End



//Player
var piccount = 1;
var pWidth = new Array(0,222,266,286,274,252,199,150,165);
var pHeight = new Array(0,421,404,374,394,403,416,433,432);
var flyWidth = 417
var flyHeight = 202
playerOriPlace = (gndH - (625/10.0-99/10.0)/ratio);
function Player(x,y,num,rate,disFG){
    var player = new Object;
    player.x = x;
    player.y = y;
    player.width = pWidth[num];
    player.height = pHeight[num];
    player.disFG = disFG;
    player.image = new Image();
    player.faceline = player.x/ratio+(player.width/rate)/ratio;
    player.image.src = "res/small/"+piccount+".png";
    player.runT=setInterval(function(){player.playerRun();},PLAYER_RUN_INTERVAL);
    player.playerInit = function(){player.image.onload = player.drawPlayer;}
    player.drawPlayer = function(){
        // player.width = pWidth[piccount];
        // player.height = pHeight[piccount];
        ctx.drawImage(
            player.image, 
            0, 
            0, 
            player.width, 
            player.height, 
            player.x/ratio, 
            (gndH - (player.height/rate-player.disFG/rate)/ratio), 
            (player.width/rate)/ratio, 
            (player.height/rate)/ratio);
    }
    player.cleanPlayer = function(){
        if(isOnAir == true && player.disFG < disFG){
            ctx.clearRect(
            player.x/ratio, 
            (gndH - (player.height/rate-player.disFG/rate)/ratio), 
            (player.width/rate)/ratio, 
            ((player.height)/rate)/ratio
            )
        }
        else{
            ctx.clearRect(
            player.x/ratio, 
            (gndH - (player.height/rate-player.disFG/rate)/ratio), 
            (player.width/rate)/ratio, 
            ((player.height-player.disFG)/rate)/ratio
            )
        }
        
    }
    player.playerRun = function(){
        player.cleanPlayer();
        piccount = (piccount+1);
        if(piccount > 8) piccount = 1;
        player.image.src = "res/small/"+piccount+".png";
        player.width = pWidth[piccount];
        player.height = pHeight[piccount];
        player.faceline = player.x/ratio+(player.width/rate)/ratio;
        player.drawPlayer();
    }
    player.rise = function(){
        player.cleanPlayer();
        player.disFG -= 100;
        player.drawPlayer();
        if((gndH - (player.height/rate-player.disFG/rate)/ratio) <= 0.3*gndH){
            return false;
        } 
        return true;
    }
    player.godown = function(){
        player.cleanPlayer();
        if((gndH - (player.height/rate-player.disFG/rate)/ratio) <= playerOriPlace -10){
            player.disFG += 100;
        }
        else{
            player.disFG = disFG;
            return false;
        }
        player.drawPlayer();
        return true;   
    }
    player.playerJump = function(){
        if(isOnAir == true) return;
        isOnAir = true;
        var isRise = true;
        var trise=setInterval(
            function(){
                window.clearInterval(player.runT);
                if(isOver == true) return;
                if(isToFly == true){
                    isToFly = false;
                    window.clearInterval(player.runT);
                    window.clearInterval(trise);
                    playerFly();
                }
                if(isRise == true){
                    var res = player.rise();
                    if(res == false) isRise = false;
                }
                else{
                    var res = player.godown();
                    if(res == false) {
                        isOnAir = false;
                        player.runT=setInterval(function(){player.playerRun();},PLAYER_RUN_INTERVAL);
                        window.clearInterval(trise);
                    }
                }
            }
        ,20);
    }

    
    return player;
}
var player1 = Player(50,0,1,10.0,10);
player1.playerInit();

//Level2: Brown Fly
var playerFallGnd = function(){
    if(isOnAir == false) return;
    var tfall=setInterval(
        function(){
            window.clearInterval(player1.runT);
            if(isOver == true) return;
            var res = player1.godown();
                if(res == false) {
                    isOnAir = false;
                    player1.runT=setInterval(function(){player1.playerRun();},PLAYER_RUN_INTERVAL);
                    window.clearInterval(tfall);
                    isToFly = false;
                }
        }
        ,10)
}
var playerFly = function(){
    if(isFly == true) return;
    isFly = true;
    window.clearInterval(player1.runT);
    player1.cleanPlayer();
    player1.image.src = "res/small/fly.png"
    player1.width = flyWidth;
    player1.height = flyHeight;
    player1.disFG -= 500;
    player1.drawPlayer();

    var int_save = LEO_RUN_INTERVAL;
    var brown_int_save = BROWN_RUN_INTERVAL;
    var brown_gen_save = BROWN_GENERATE_INTERVAL;
    LEO_RUN_INTERVAL = 1;
    MIN_GENERATE_DIS = -GENERATE_INTERVAL*(LEO_RUN_DIS/ratio)/LEO_RUN_INTERVAL + LEO_WIDTH;
    MAX_GENERATE_DIS = LEO_WIDTH;

    BROWN_RUN_INTERVAL = 1;
    BROWN_GENERATE_INTERVAL = 1;
    window.clearInterval(leoGeneT);
    for (var i = 0; i < arrLen; i++) {
        if(leoArray[i] != undefined){
            window.clearInterval(leoArray[i].leoRunT);
            leoArray[i].cleanLeo();
            var save_x = leoArray[i].x;
            leoArray[i] = undefined;
            leotmp = new Leo(save_x,0,LEO_ORI_WIDTH,246,LEO_RATE)
            leotmp.leoInit();
            leoArray[i] = leotmp;
        }
    };
    window.clearInterval(brownGenT);
    for(var i = 0; i < brownArrlen; i++){
        if(brownArray[i] != undefined){
            window.clearInterval(brownArray[i].brownRunT);
            brownArray[i].cleanbrown();
            var save_x = brownArray[i].x;
            var save_h = brownArray[i].height;
            brownArray[i] = undefined;
            browntmp = new Brown(save_x,save_h,621,575,30)
            browntmp.brownInit();
            brownArray[i] = browntmp;
        }
    }
    //var redraw = setInterval(function(){player1.drawPlayer();},1);
    var revive = setTimeout(
        function(){
            isFly = false;//飞行这块参数还是错的，先别飞
            LEO_RUN_INTERVAL = int_save;
            MIN_GENERATE_DIS = -GENERATE_INTERVAL*(LEO_RUN_DIS/ratio)/LEO_RUN_INTERVAL + LEO_WIDTH;
            MAX_GENERATE_DIS = LEO_WIDTH;
            last_place = 700;
            BROWN_RUN_INTERVAL = brown_int_save;
            BROWN_GENERATE_INTERVAL = brown_gen_save;
            leoGeneT = setInterval(function(){leoGene();},GENERATE_INTERVAL);  
            for (var i = 0; i < arrLen; i++) {
                if(leoArray[i] != undefined){
                    window.clearInterval(leoArray[i].leoRunT);
                    leoArray[i].cleanLeo();
                    var save_x = leoArray[i].x;
                    leoArray[i] = undefined;
                    leotmp = new Leo(save_x,0,LEO_ORI_WIDTH,246,LEO_RATE)
                    leotmp.leoInit();
                    leoArray[i] = leotmp;
                }
            };
            if(level == 2){
                brownGenT = setInterval(function(){brownGen();},BROWN_GENERATE_INTERVAL);
                for(var i = 0; i < brownArrlen; i++){
                    if(brownArray[i] != undefined){
                        window.clearInterval(brownArray[i].brownRunT);
                        brownArray[i].cleanbrown();
                        var save_x = brownArray[i].x;
                        var save_h = brownArray[i].height;
                        brownArray[i] = undefined;
                        browntmp = new Brown(save_x,save_h,621,575,30)
                        browntmp.brownInit();
                        brownArray[i] = browntmp;
                    }
                }
            }
            
            playerFallGnd();
            //window.clearInterval(redraw);
        }
        ,FLY_TIME)

}
  
$(function(){   
      // $("#backdoor").click(function(){
      //   isBack = true;
      //   })
      $(document).click(function (e) {
        if(e.which == 1){
            if(isOnAir == true) return;
            if(isFly == true) return;
            if(isToFly == true) return;
            player1.playerJump();
        }
      })
      $(document).on("tap",function(){
            if(isOnAir == true) return;
            if(isFly == true) return;
            if(isToFly == true) return;
            player1.playerJump();
      });
      $(document).keypress(function (e) {
        if(e.keyCode == 111){//o
            isBack = true;
        }
          
     })
 });
//Player End

//Leo
function Leo(x,y,width,height,rate){
    var leo = new Object;
    leo.x = x;
    leo.y = y;
    leo.initx = x;
    leo.width = width;
    leo.height = height;
    leo.image = new Image();
    leo.rate = rate;
    leo.image.src = 'res/leonard.png';
    leo.leoRunT = setInterval(function(){leo.leoRun();},LEO_RUN_INTERVAL)
    leo.isOnLand = false;
    leo.onLandx = 600*Math.random();
    leo.leoInit = function(){leo.image.onload = leo.drawLeo;}
    leo.drawLeo = function(){
        ctx.drawImage(
            leo.image, 
            0, 
            0, 
            leo.width, 
            leo.height, 
            leo.x/ratio, 
            (gndH - (leo.height/rate)/ratio-leo.y/ratio), 
            (leo.width/rate)/ratio, 
            (leo.height/rate)/ratio);
    }
    leo.cleanLeo = function(){
        if(isKaze == true){
            ctx.clearRect(
                leo.x/ratio, 
                (gndH - (leo.height/rate)/ratio-leo.y/ratio), 
                (leo.width/rate)/ratio, 
                (leo.height/rate)/ratio);
            return;
        }
        ctx.clearRect(
            leo.x/ratio, 
            (gndH - (leo.height/rate)/ratio-leo.y/ratio), 
            (leo.width/rate)/ratio, 
            (leo.height/rate)/ratio);
    }
    leo.collidep = function(player){
        if(collide(player,leo)){
            isOver = true;
            window.clearInterval(player.runT);
            player.cleanPlayer();
            
            for (var i = 0; i < arrLen; i++) {
                if(leoArray[i] != undefined){
                    window.clearInterval(leoArray[i].leoRunT);
                    if(leoArray[i].x/ratio+(leoArray[i].width/rate)/ratio >= 0 && leoArray[i].x/ratio <0) {
                        leoArray[i].cleanLeo();
                    }
                    if(leoArray[i].x/ratio <= (player.x-50)/ratio+(fWidth[7]/2)/ratio){
                        leoArray[i].cleanLeo();
                    } 
                }
            }
            setTimeout(function(){
                var fire1 = Fire(player.x-50,player.y,1,2.0,-2);
                fire1.fireInit();
                var bombT=setInterval(
                    function(){
                        var res = fire1.fireBomb();
                        if(res == false){
                            window.clearInterval(bombT);
                        }
                    },70);
            },10)  
        }
    }
    leo.leoRun = function(){
        leo.cleanLeo();
        leo.x-=LEO_RUN_DIS;
        if(isKaze == true){
            var speed = LEO_STA_HEIGHT/((leo.initx-leo.onLandx)/LEO_RUN_DIS)
            if(leo.y > speed && leo.isOnLand == false){
                leo.y-=speed;
            }
            else{
                leo.isOnLand = true;
                leo.y+=speed;
            }
        }
        leo.drawLeo();
        leo.collidep(player1);
    }
    return leo;
}
function collide(cplayer,cleo){
    if(isBack == true) return false;
    if(cplayer.faceline+5 >= cleo.x/ratio && 
        cplayer.x/ratio <= cleo.x/ratio+(cleo.width/cleo.rate)/ratio &&
        (gndH - (cplayer.height/PLAYER_RATE-cplayer.disFG/PLAYER_RATE)/ratio) <= (gndH - (cleo.height/cleo.rate)/ratio-cleo.y/ratio)+(cleo.height/cleo.rate)/ratio &&
        (gndH - (-cplayer.disFG/PLAYER_RATE)/ratio) >= (gndH - (cleo.height/cleo.rate)/ratio-cleo.y/ratio)) return true;
    return false;
}
var leoArray=new Array()
var arrLen = 10;
var arrIndex = 0;

var leoGene = function(){
            if(isOver == true) return;
            if(leoArray[arrIndex] != undefined && leoArray[arrIndex].x < -50){
                leoArray[arrIndex].cleanLeo();
                window.clearInterval(leoArray[arrIndex].leoRunT);
                delete leoArray[arrIndex];
            } 
            if(leoArray[arrIndex] == undefined){
                var dis = MIN_GENERATE_DIS+(MAX_GENERATE_DIS-MIN_GENERATE_DIS)*Math.random()
                if(last_place+dis<600){
                    dis = 0;
                    last_place = 700;
                }
                var leoInity = 0;
                if(isKaze == true){
                    leoInity = LEO_STA_HEIGHT;
                }
                leotmp = new Leo(last_place+dis,leoInity,LEO_ORI_WIDTH,246,LEO_RATE)
                console.log(MIN_GENERATE_DIS,MAX_GENERATE_DIS,dis,last_place+dis,leotmp.x)
                last_place = last_place+dis;
                leotmp.leoInit();
                leoArray[arrIndex] = leotmp;
                arrIndex = (arrIndex + 1) % arrLen;
            }
        }
var leoGeneT;
window.onload = function(){
    leoGeneT = setInterval(function(){leoGene();},GENERATE_INTERVAL);
}


//Leo End

//Brown
function Brown(x,y,width,height,rate){
    var brown = new Object;
    brown.x = x;
    brown.y = y;
    brown.width = width;
    brown.height = height;
    brown.image = new Image();
    brown.image.src = 'res/Brown.png';
    brown.actwidth = (brown.width/rate)/ratio;
    brown.actheight = (brown.height/rate)/ratio;
    brown.upline = (gndH - (brown.height/rate)/ratio-brown.y/ratio);
    brown.downline = brown.upline+brown.actheight;
    brown.leftline = brown.x/ratio;
    brown.rightline = brown.x/ratio+brown.actwidth;
    brown.brownRunT = setInterval(function(){brown.brownRun();},BROWN_RUN_INTERVAL)
    brown.isStop = false;
    brown.brownInit = function(){brown.image.onload = brown.drawbrown;}
    brown.drawbrown = function(){ctx.drawImage(brown.image, 0, 0, brown.width, brown.height, brown.leftline, brown.upline, brown.actwidth, brown.actheight);}
    brown.cleanbrown = function(){ctx.clearRect(brown.leftline, brown.upline, brown.actwidth, brown.actheight);}
    brown.brownRun = function(){
        brown.cleanbrown();
        brown.x-=BROWN_RUN_DIS;
        brown.leftline = brown.x/ratio;
        brown.rightline = brown.x/ratio+brown.actwidth;
        brown.drawbrown();
        if(brownCollide(player1,brown)){
            if(isFly == true) return;
            if(isToFly == true) return;
            if(isOnAir == false) return;
            isToFly = true;
            brown.cleanbrown();
            brown.isStop = true;
            window.clearInterval(brown.brownRunT);
        }
    }
    return brown;
}
function brownCollide(cplayer,cbrown){
    if(cbrown.leftline<=cplayer.faceline+5 
        && cbrown.rightline>=cplayer.x/ratio
        && (gndH - (cplayer.height/PLAYER_RATE-cplayer.disFG/PLAYER_RATE)/ratio) <= cbrown.downline-20
        && (gndH - (-cplayer.disFG/PLAYER_RATE)/ratio) >= cbrown.upline) return true;
    return false;
}

var brownArray=new Array()
var brownArrlen = 10;
var brownArrIndex = 0;

var brownGen = function(){
        if(isOver == true) return;
        if(brownArray[brownArrIndex] != undefined && brownArray[brownArrIndex].isStop == true){
            brownArray[brownArrIndex].cleanbrown();
            window.clearInterval(brownArray[brownArrIndex].brownRunT);
            delete brownArray[brownArrIndex];
            brownArray[brownArrIndex] = undefined;
        }
        else if(brownArray[brownArrIndex] != undefined && brownArray[brownArrIndex].x < -50){
            brownArray[brownArrIndex].cleanbrown();
            window.clearInterval(brownArray[brownArrIndex].brownRunT);
            delete brownArray[brownArrIndex];
            brownArray[brownArrIndex] = undefined;
        } 
        else if(brownArray[brownArrIndex] == undefined){
            var tmpHeight = MIN_BROWN_HEIGHT+(MAX_GENERATE_DIS-MIN_BROWN_HEIGHT)*Math.random();
            browntmp = new Brown(700,tmpHeight,621,575,30)
            browntmp.brownInit();
            brownArray[brownArrIndex] = browntmp;
            brownArrIndex = (brownArrIndex + 1) % brownArrlen;
        }
    }
//Brown End

//Fire
var firecount = 1;
var fWidth = new Array(0,232,232,260,286,313,308,319);
var fHeight = new Array(0,347,315,327,318,306,302,313);
function Fire(x,y,num,rate,disFG){
    var fire = new Object;
    fire.x = x;
    fire.y = y;
    fire.width = fWidth[num];
    fire.height = fHeight[num];
    fire.disFG = disFG;
    fire.image = new Image();
    fire.image.src = 'res/bomb/part-png/'+firecount+'.png';
    fire.fireInit = function(){fire.image.onload = fire.drawFire;}
    fire.drawFire = function(){
        fire.width = fWidth[firecount];
        fire.height = fHeight[firecount];
        ctx.drawImage(
            fire.image, 
            0, 
            0, 
            fire.width, 
            fire.height, 
            fire.x/ratio, 
            (gndH - (fire.height/rate-fire.disFG/rate)/ratio), 
            (fire.width/rate)/ratio, 
            (fire.height/rate)/ratio
            );
    }
    fire.cleanfire = function(){
        ctx.clearRect(
            fire.x/ratio, 
            (gndH - (fire.height/rate-fire.disFG/rate)/ratio), 
            (fire.width/rate)/ratio, 
            ((fire.height-fire.disFG)/rate-1)/ratio
            )
    }
    fire.fireBomb = function(){
        fire.cleanfire();
        firecount = (firecount+1);
        if(firecount > 7){
            return false;
        } 
        fire.image.src = "res/bomb/part-png/"+firecount+".png";
        fire.width = fWidth[firecount];
        fire.height = fHeight[firecount];
        fire.drawFire();
        return true;
    }
    return fire;
}
//Fire End

//Perferleo

var PERFECT_LEO_RUN_INTERVAL = LEO_RUN_INTERVAL;

function perfectleo(sx,sy,tx,ty,width,height,rate,pace){
    var perfectleo = new Object;
    perfectleo.x = sx;
    perfectleo.y = sy;
    perfectleo.sx = sx;
    perfectleo.sy = sy;
    perfectleo.tx = tx;
    perfectleo.ty = ty;
    perfectleo.width = width;
    perfectleo.height = height;
    perfectleo.image = new Image();
    perfectleo.rate = rate;
    perfectleo.image.src = 'res/leonard.png';
    perfectleo.pace = pace;
    perfectleo.perfectleoRunT = setInterval(function(){perfectleo.perfectleoRun();},perfectleo.pace)
    perfectleo.isOnLand = false;
    perfectleo.onLandx = (perfectleo.tx+perfectleo.sx)/2;

    perfectleo.stepnum = Math.abs(perfectleo.tx-perfectleo.sx);
    perfectleo.step = 0;
    perfectleo.stepremain = 0;
    perfectleo.perfectleoInit = function(){perfectleo.image.onload = perfectleo.drawperfectleo;}
    perfectleo.drawperfectleo = function(){
        ctx.drawImage(
            perfectleo.image, 
            0, 
            0, 
            perfectleo.width, 
            perfectleo.height, 
            perfectleo.x, 
            perfectleo.y, 
            (perfectleo.width/rate)/ratio, 
            (perfectleo.height/rate)/ratio);
    }
    perfectleo.cleanperfectleo = function(){
        ctx.clearRect(
            perfectleo.x, 
            perfectleo.y, 
            (perfectleo.width/rate)/ratio, 
            (perfectleo.height/rate)/ratio);
    }
    perfectleo.perfectleoRun = function(){
        if(perfectleo.step == perfectleo.stepnum){
            console.log(perfectleo.x,perfectleo.y)
            perfectleo.cleanperfectleo();
            perfectleo.drawperfectleo();
            return;
        } 
        perfectleo.cleanperfectleo();
        perfectleo.x-=(perfectleo.sx-perfectleo.tx)/Math.abs((perfectleo.sx-perfectleo.tx));
        if(gndH-perfectleo.y > 15 && perfectleo.isOnLand == false){
            perfectleo.y+=5
            perfectleo.step++;
        }
        else if(gndH-perfectleo.y > (perfectleo.height/rate)/ratio+0.7 && perfectleo.isOnLand == false){
            perfectleo.y+=1
            perfectleo.step++;
        }
        else{
            if(perfectleo.isOnLand == false)perfectleo.stepremain = perfectleo.stepnum - perfectleo.step;
            perfectleo.isOnLand = true;
            perfectleo.y-=(gndH-((perfectleo.height/rate)/ratio+0.7)-perfectleo.ty)/(perfectleo.stepremain);
            perfectleo.step++;
        }
        perfectleo.drawperfectleo();
    }
    return perfectleo;
}

var i = 0;
var badi =0;
var pleox = new Array(142,150,158,166,174,182,190,198,206,214,222,230,150,158,166,150,158,166,150,150,166,166,
    186,192,194,196,198,200,202,204,206,208,210,212,214,216,218,220,224,231,239,
    222,214,206,192,184,176,224,216,209,196,190,182,174,222,214,198,190,182,174,
    142,150,158,166,222,214);
var pleoy = new Array(30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 50, 50, 50, 68, 68, 68, 56, 62, 56, 62,
    24, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96, 102,108,114,120,126,120,114,
    56-12, 60-12, 65-12,  75-12, 77-12, 79-12, 68-12, 72-12, 76-12, 83-12, 88-12, 90-12, 92-12, 80-12, 84-12, 95-12, 100-12, 102-12, 104-12,
    92, 87, 81, 76, 20, 20);
function generatePLeos(){
    var gen = setInterval(function(){
        var pleo = new perfectleo(
            0,
            -10,
            Math.ceil(pleox[i]),Math.ceil(pleoy[i]),
            LEO_ORI_WIDTH,246,
            20,
            Math.ceil(1+1*Math.random()));
        pleo.perfectleoInit();
        i++;
        if(i == pleoy.length) window.clearInterval(gen);
    },200)
}
function generateBadPLeos(){
    var genb = setInterval(function(){
        var pleo = new perfectleo(
            0,
            0,
            142+150*Math.random(),
            -0.1,
            LEO_ORI_WIDTH,246,
            20,
            Math.ceil(1+1*Math.random()));
        pleo.perfectleoInit();
        badi++;
        if(badi == 500) window.clearInterval(genb);
    },20)
}





//Perfectleo End


//Level
function modifyLevelParas(){
    level+=1;
    //GENERATE_INTERVAL = 500;
    if(level == 2) GENERATE_INTERVAL = 500;
    else GENERATE_INTERVAL = 500;
    if(level == 2) LEO_WIDTH = LEO_ORI_WIDTH*3/LEO_RATE;
    else if(level == 3) LEO_WIDTH = LEO_ORI_WIDTH*3/LEO_187_RATE;
    else LEO_WIDTH = LEO_ORI_WIDTH*3/LEO_RATE;
    LEO_RUN_INTERVAL -= 3
    MIN_GENERATE_DIS = -GENERATE_INTERVAL*(LEO_RUN_DIS/ratio)/LEO_RUN_INTERVAL + LEO_WIDTH;
    MAX_GENERATE_DIS = 2*LEO_WIDTH;
    PLAYER_RUN_INTERVAL = LEO_RUN_INTERVAL*2
    last_place = 700
    window.clearInterval(player1.runT);
    window.clearInterval(leoGeneT);
    if(isOver == true) return;
    player1.runT=setInterval(function(){player1.playerRun();},PLAYER_RUN_INTERVAL);
    leoGeneT = setInterval(function(){leoGene();},GENERATE_INTERVAL);
}

function showLevelMoji(){
    var level_oa = new Array(1);
    level_oa[0] = "现在升级";
    level_oa[1] = "难度："+level;
    level_oa[2] = "你,能相信吗";
    isMoji = true;
    ocount = 0;
    openWords(level_oa);
}

var levelT = setInterval(
    function(){
        if(isOver == true) return;
        if(isOpening == true) return;
        if(isMoji == true) return;
        if(isFly == true) return;
        if(isToFly == true) return;
        if(level >= 6) return;
        //showLevelMoji();
        setTimeout(function(){
            modifyLevelParas()
            clearBackLeos();
            if(level == 2){
                controlLevel2(true);
            }
            if(level == 3){
                controlLevel2(false);
                controlLevel3(true);
            }
            if(level == 4){
                controlLevel3(false);
                controlLevel4(true);
            }
            if(level == 5){
                controlLevel4(false);
                controlLevel5(true);
            }
            if(level == 6){
                controlLevel5(false);
                controlLevel6(true);
            }
        },10000)
        
    },LEVEL_INTERVAL)

function clearBackLeos(){
    window.clearInterval(leoGeneT);
    for(var i = 0; i < arrLen; i++){
        if(leoArray[i] == undefined) continue;
        if(leoArray[i].x >= 600){
            window.clearInterval(leoArray[i].leoRunT);
            leoArray[i].cleanLeo();
            leoArray[i] = undefined;
        }
    }
}

var brownGenT;

function controlLevel2(isLevelStart){
    if(isLevelStart == true){
        brownGenT = setInterval(function(){brownGen();},BROWN_GENERATE_INTERVAL); 
        leoGeneT = setInterval(function(){leoGene();},GENERATE_INTERVAL);
    } 
    else{
        window.clearInterval(brownGenT);
        for(var i = 0; i < brownArrlen; i++){
            if(brownArray[i] == undefined) continue;
            if(brownArray[i].x >= 600){
                window.clearInterval(brownArray[i].brownRunT);
                brownArray[i].cleanbrown();
                brownArray[i] = undefined;
            }
        }
    }  
}

function controlLevel3(isLevelStart){
    if(isLevelStart == true){
        LEO_RATE = LEO_187_RATE;
        leoGeneT = setInterval(function(){leoGene();},GENERATE_INTERVAL);
    } 
    else LEO_RATE = 10;
}

function controlLevel4(isLevelStart){
    if(isLevelStart == true){
        clearBackLeos();
        isKaze = true;
        leoGeneT = setInterval(function(){leoGene();},GENERATE_INTERVAL);
    }
    else{
        clearBackLeos();
        isKaze = false;   
    }
    
}

function controlLevel5(isLevelStart){
    if(isLevelStart == true){
        
        isBlack = true;
        document.getElementById("myCanvas").style.backgroundColor = "#000000";
        document.getElementsByTagName("html")[0].style.backgroundColor = "#000000";
        document.getElementsByTagName("body")[0].style.backgroundColor = "#000000";
        leoGeneT = setInterval(function(){leoGene();},GENERATE_INTERVAL);
    }
    else{
        document.getElementById("myCanvas").style.backgroundColor = "#ffffff";
        document.getElementsByTagName("html")[0].style.backgroundColor = "#ffffff";
        document.getElementsByTagName("body")[0].style.backgroundColor = "#ffffff";
        isBlack = false;
    }
}

function controlLevel6(isLevelStart){
    if(isLevelStart == true){
        generatePLeos();
        //generateBadPLeos();
    }
}

//Background
// function ToBlack(){
//     if(isOver == true) return;
//     if(isBlack == false) return;
//     $("body").animate({backgroundColor: "rgb(0,0,0)" },1000);
//     $("#myCanvas").animate({backgroundColor: "rgb(0,0,0)" },1000,
//         function(){
//             setTimeout(function(){ToWhite();},10000)
//         });
// }

// function ToWhite(){
//     $("body").animate({backgroundColor: "rgb(255,255,255)" },1000);
//     $("#myCanvas").animate({backgroundColor: "rgb(255,255,255)" },1000,
//         function(){
//             setTimeout(function(){ToBlack();},2000)
//         });
// }
//Background End

//Level End


























