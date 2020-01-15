$(document).ready(function(){
    var life = 3; // 주인공 목숨
    var level = 0;
    var speed = 200; // 주인공 탱크의 움직이는 시간 0.06 px/ms
    var dir = "t"; // 주인공 탱크의 방향
    var curpos = {
        x:225 , y:400
    }
    var score = 0; // 누적점수
    var kill = 0; // 이번 스테이지에서 해치울 적들의 수
    var bullet = "<img id='mybullet' src='images/bullet.png' alt='bullet' />";
    var ebullet = "<img class='ebullet' src='images/bullet.png' alt='bullet' />";
    var reload = 500; // 재장전 시간
    var bspeed = 400; // 포탄 날라가는 시간
    var emax = 5; // 최대 적군 수
    var fire = true; // 발사 가능 여부
    var hero = "<img id='hero' src='images/hero.png'>";
    var enemy = "<img class='enemy' src='images/enemy.png'>";
    var expl = "images/explode.gif";
    var bpos = {x:0,y:0};
    var ebpos = [];
    var maxbody = 6;
    var firstpos;
    
    function countlife(){
        $(".life:last-of-type").remove();
        if(life < 0){
            alert("Gave over\nTotal score : "+score);
            location.reload();
        }
    }
    
    function ini(){
        level++;
        $("#level").text("Stage : "+level);
        firstpos = {
            x: 225 , y: 400
        }
        
        $("#mybullet").stop();
        $("#stage").empty();
        $("#stage").append(hero);
        $("#hero").css({
            left: firstpos.x+"px", top: firstpos.y+"px"
        });
        kill = emax;
        fire = true;
        epos = [];
        en = -1;
        killorder = -1;
    }
    
    // 스테이지 탈출 추적기
    function bound(x,y){
        if(x < 0){
            return "xover-";
        }else if(x > 450){
            return "xover+";
        }else if(y < 0){
            return "yover-";
        }else if(y > 450){
            return "yover+";
        }else{
            return "ok";
        }
    }
    
    
    // 주인공 위치 추적기
    function where(){
        curpos.x = parseInt($("#hero").css("left"));
        curpos.y = parseInt($("#hero").css("top"));
        if(bound(curpos.x, curpos.y) == "xover-"){
            $("#hero").stop().animate({left:"50px"},100);
        }else if(bound(curpos.x, curpos.y) == "xover+"){
            $("#hero").stop().animate({left:"400px"},100);
        }else if(bound(curpos.x, curpos.y) == "yover-"){
            $("#hero").stop().animate({top:"50px"},100);
        }else if(bound(curpos.x, curpos.y) == "yover+"){
            $("#hero").stop().animate({top:"400px"},100);
        }
    }
    
    var killorder = -1;
    // 주인공 포탄 위치 추적기
    function bposfind(){
        bpos.x = parseInt($("#mybullet").css("left"));
        bpos.y = parseInt($("#mybullet").css("top"));
        // 주인공 포탄과 적군들의 피격 판정
        for(i=0; i<epos.length; i++){
            if(
                (bpos.x > epos[i][0] && bpos.x < epos[i][0]+30)
                &&
                (bpos.y > epos[i][1] && bpos.y < epos[i][1]+30)
            ){
                if(!$(".e"+i).hasClass("dead")){
                    kill--;
                    score += 10;
                    $("#score").text("Score : "+score);
                    if($(".dead").length >= maxbody){
                        // .dead중에서 data속성값이 가장 작은 녀석 선발하기
                        var arr = [];
                        for(j=0; j<$(".dead").length; j++){
                            arr[j] = parseInt($(".dead").eq(j).attr("data"));
                        }
                        var min = Math.min.apply(null, arr);
                                                
//                        var champ = 0;
//                        for(j=0 ; j<$(".dead").length-1 ; j++){
//                            if($(".dead").eq(champ).attr("data") > $(".dead").eq(j+1).attr("data")){
//                                champ = j+1;
//                            }
//                        }
                        $(".dead[data="+min+"]").fadeOut(function(){
                            var n = $(this).index(".enemy");
                            epos[n] = [600,600];
                            $(this).attr("data",1000);
                        });
                    }
                    killorder++;
                }
                $(".e"+i).stop().attr("src",expl).addClass("dead").attr("data",killorder); 
                clearTimeout(no[i]);
                $("#mybullet").remove();
                bpos.x = null;
                bpos.y = null;
                if(kill <= 0){
                    setTimeout(function(){
                        var conf = confirm("Stage Clear");
                        if(conf){
                            emax += 3;
                            ini();
                        }
                    }, 1000);
                }
            }
        }
    }
    
    // 주인공 피격 판정
    function herohit(){
        for(i=0 ; i<ebpos.length ; i++){
            if(
                (ebpos[i][0] > curpos.x && ebpos[i][0] < curpos.x+30)
                &&
                (ebpos[i][1] > curpos.y && ebpos[i][1] < curpos.y+30)
            ){
                if(!$("#hero").hasClass("respon")){
                    $("#hero").attr("src",expl).addClass("temp").removeAttr("id");
                    setTimeout(function(){
                        $(".temp").fadeOut(function(){
                            life--;
                            countlife();
                            $(this).remove();
                            curpos.x = 600;
                            curpos.y = 600;
                            $("#stage").append(hero);
                            $("#hero").css({
                                left: firstpos.x + "px",
                                top: firstpos.y + "px"
                            }).addClass("respon");
                            setTimeout(function(){
                                $("#hero").removeClass("respon");
                            },2000);
                        });
                    }, 1000);
                }
            }
        }
    }
    
    
    
    
    // 적군 위치 추적기
    var epos = [];
          // ewhere(".e0")
    var ereload = [];
    function ewhere(who,edir){
        var i = who.replace(".e","");
        epos[i] = [];
        epos[i][0] = parseInt($(who).css("left"));
        epos[i][1] = parseInt($(who).css("top"));
        if(bound(epos[i][0], epos[i][1]) == "xover-"){
            $(who).stop().animate({left:"50px"},100);
        }else if(bound(epos[i][0], epos[i][1]) == "xover+"){
            $(who).stop().animate({left:"400px"},100);
        }else if(bound(epos[i][0], epos[i][1]) == "yover-"){
            $(who).stop().animate({top:"50px"},100);
        }else if(bound(epos[i][0], epos[i][1]) == "yover+"){
            $(who).stop().animate({top:"400px"},100);
        }
        // 포탄 발사
        if(ereload[i]){
            ereload[i] = false;
            setTimeout(function(){
                ereload[i] = true;
            }, 1200);
            $("#stage").append(ebullet);
            $(".ebullet:last-of-type").addClass("eb"+i);
            $(".eb"+i).css({
                left: epos[i][0] +25-10 + "px",
                top:  epos[i][1] +25-10 + "px",
                transform: "rotate("+(edir*90-90)+"deg)"
            });
            if(edir % 2  == 0){
                var pm;
                if(edir == 0){pm = "-=";}else{pm = "+=";}
                $(".eb"+i).animate({left: pm+"500px"},{
                    duration: bspeed,
                    easing: "linear",
                    step: function(){
                        ebpos[i] = [];
                        ebpos[i][0] = parseInt($(".eb"+i).css("left"));
                        ebpos[i][1] = parseInt($(".eb"+i).css("top"));
                        herohit();
                    },
                    complete: function(){
                        $(".eb"+i).remove();
                    }
                });
            }else{
                var pm;
                if(edir == 1){pm = "-=";}else{pm = "+=";}
                $(".eb"+i).animate({top: pm+"500px"},{
                    duration: bspeed,
                    easing: "linear",
                    step: function(){
                        ebpos[i] = [];
                        ebpos[i][0] = parseInt($(".eb"+i).css("left"));
                        ebpos[i][1] = parseInt($(".eb"+i).css("top"));
                        herohit();
                    },
                    complete: function(){
                        $(".eb"+i).remove();
                    }
                });
            }
        }
    }
    
    // 랜덤한 정수 생성기
    //             2    6
    function rand(min, max){
        return Math.floor(Math.random()*(max-min+1) + min);
    }
    
    
    // ←(37)/↑(38)/→(39)/↓(40)/spacebar(32)
    var key = "";
    $(document).keydown(function(e){
        key = e.keyCode;
    });
    $(document).keyup(function(){
        key = "";
    });
    
    $(document).keydown(function(){
        switch(key){
            case 37:
                $("#hero").css("transform","rotate(-90deg)");
                dir = "l";
                $("#hero").stop().animate({
                    left: "-=30px"
                },{
                    duration:speed,
                    easing:"linear",
                    step: function(){
                        where();
                    }
                });
                break;
            case 38:
                $("#hero").css("transform","rotate(0deg)");
                dir = "t";
                $("#hero").stop().animate({
                    top: "-=30px"
                },{
                    duration:speed,
                    easing:"linear",
                    step: function(){
                        where();
                    }
                });
                break;
            case 39:
                $("#hero").css("transform","rotate(90deg)");
                dir = "r";
                $("#hero").stop().animate({
                    left: "+=30px"
                },{
                    duration:speed,
                    easing:"linear",
                    step: function(){
                        where();
                    }
                });
                break;
            case 40:
                $("#hero").css("transform","rotate(180deg)");
                dir = "b";
                $("#hero").stop().animate({
                    top: "+=30px"
                },{
                    duration:speed,
                    easing:"linear",
                    step: function(){
                        where();
                    }
                });
                break;
            case 32:
                if(fire){
                    var bulletdeg = 0;
                    switch (dir){
                        case "l": bulletdeg=-90; break;
                        case "t": bulletdeg=0; break;
                        case "r": bulletdeg=90; break;
                        case "b": bulletdeg=180; break;
                    }
                    $("#stage").append(bullet);
                    $("#mybullet").css({
                        left: curpos.x + 25-10 +"px",
                        top: curpos.y + 25-10 +"px",
                        transform: "rotate("+bulletdeg+"deg)"
                    });
                    switch (dir){
                        case "l": 
                            $("#mybullet").animate({
                                left: "-=500px"
                            },{
                                duration: bspeed,
                                easing: "linear",
                                step: function(){
                                    fire=false;
                                    bposfind();
                                },
                                complete: function(){
                                    $("#mybullet").remove();
                                }
                            });
                            setTimeout(function(){ fire=true; }, reload);
                            break;
                        case "t": 
                            $("#mybullet").animate({
                                top: "-=500px"
                            },{
                                duration: bspeed,
                                easing: "linear",
                                step: function(){
                                    fire=false;
                                    bposfind();
                                },
                                complete: function(){
                                    $("#mybullet").remove();
                                }
                            });
                            setTimeout(function(){ fire=true; }, reload);
                            break;
                        case "r": 
                            $("#mybullet").animate({
                                left: "+=500px"
                            },{
                                duration: bspeed,
                                easing: "linear",
                                step: function(){
                                    fire=false;
                                    bposfind();
                                },
                                complete: function(){
                                    $("#mybullet").remove();
                                }
                            });
                            setTimeout(function(){ fire=true; }, reload);
                            break;
                        case "b": 
                            $("#mybullet").animate({
                                top: "+=500px"
                            },{
                                duration: bspeed,
                                easing: "linear",
                                step: function(){
                                    fire=false;
                                    bposfind();
                                },
                                complete: function(){
                                    $("#mybullet").remove();
                                }
                            });
                            setTimeout(function(){ fire=true; }, reload);
                            break;
                    }
                }
                break;
        }
        
    });
        
    ini();
    
    
    // 적군 랜덤 움직임
    function enemymove(who){
        var edir = rand(0,3);    // 움직일 방향
        var emove = 180; // 움직일 거리
        switch (edir){
            case 0:
                $(who).css("transform","rotate(-90deg)").
                stop().animate({left:"-="+emove+"px"},{
                    duration: 3000,
                    easing: "linear",
                    step: function(){
                        ewhere(who,edir);
                    }
                }); break;
            case 1:
                $(who).css("transform","rotate(0deg)").
                stop().animate({top:"-="+emove+"px"},{
                    duration: 3000,
                    easing: "linear",
                    step: function(){
                        ewhere(who,edir);
                    }
                }); break;
            case 2:
                $(who).css("transform","rotate(90deg)").
                stop().animate({left:"+="+emove+"px"},{
                    duration: 3000,
                    easing: "linear",
                    step: function(){
                        ewhere(who,edir);
                    }
                }); break;
            case 3:
                $(who).css("transform","rotate(180deg)").
                stop().animate({top:"+="+emove+"px"},{
                    duration: 3000,
                    easing: "linear",
                    step: function(){
                        ewhere(who,edir);
                    }
                }); break;
        }
        var n = who.replace(".e","");
        no[n] = setTimeout(enemymove,rand(500,3000),who);
    }
    var no = [];
        
    // 적군 생성기
    var en = -1; // enemy number 적군 번호
    function addenemy(){
        if($(".enemy").length < emax){
            en++;
            var ex = rand(0,450);
            var ey = rand(0,450);
            $("#stage").append(enemy);
            $(".enemy:last-of-type").addClass("e"+en);
            $(".e"+en).css({
                left: ex+"px",
                top: ey+"px"
            });
            enemymove(".e"+en);
            ereload[en] = true;
        }
    }
    
    setInterval(addenemy,rand(500,3000));
    
    
    
});















