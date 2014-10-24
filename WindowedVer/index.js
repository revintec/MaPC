"use strict";
var w1,w2,w3,w4,w0;
var $=UI.internal.transcend(document.querySelector,document);
function crash(){document.body.innerHTML="<div class='Crash' onclick='location.reload()'></div>";}
UI(function(mgr){
    $("#Overall").addEventListener("click",function(){
        var self=this;
        this.style.opacity=0;
        this.style.pointerEvents="none";
        setTimeout(function(){self.remove();},1000);
        setTimeout(function(){
            (function(state){
                $("#InputNickname").contentEditable=true;
                var button=$("#ButtonCustomize");
                button.innerText="vvv   定制   vvv";
                button.addEventListener("click",function(){
                    if(state)w0.rect({height:266});
                    else w0.rect({height:468});
                });
                UI(function(){
                    w0.on("layout",function(ev){
                        if(ev.rect.height>300){
                            state=true;
                            button.innerText="^^^   保存   ^^^";
                        }else{
                            state=false;
                            button.innerText="vvv   定制   vvv";
                        }
                    });
                });
            })();
            // should be 300 and false
            var int300=300,bfalse=false;
            w1=mgr.newWindow("BasicIntel").rect({left: 80,top: 80,width:300,height:266}).icon("av.user").title("基本信息");
            w1.content.content.appendChild($("#BasicIntel"));
            w2=mgr.newWindow("Collection").rect({left:130,top: 50,width:627,height:373+30}).icon("av.coll").title("收藏");
            w3=mgr.newWindow("Nearby").rect({left:100,top: 70,width:772,height:416+30}).icon("av.nrby").title("同步位置");
            w4=mgr.newWindow("Roadmap").rect({left:80,top:80,width:1120,height:592+30}).icon("av.rdmp").title("足迹");
            w0=w1;
            setTimeout(function(){
                w0.show(true,bfalse);
                setTimeout(function(){
                    setTimeout(function(){
                        w0.on("layout",function(ev){
                            var reason=JSON.stringify(ev.extra);
                            if(reason)reason="    "+reason+"\r\n";
                            else reason="";
                            console.trace("StackTrace: layout\r\n"+
                                "reason: "+ev.reason+"\r\n"+reason+
                                "left: "+ev.rect.left+"\r\n"+
                                "top: "+ev.rect.top+"\r\n"+
                                "width: "+ev.rect.width+"\r\n"+
                                "height: "+ev.rect.height+"\r\n"+
                                "right: "+ev.rect.right+"\r\n"+
                                "bottom: "+ev.rect.bottom);
                        });
                        $("#TEST2").addEventListener("click",function(){
                            if(w0.disable()){
                                w0.disable(false);
                                if(!w0.front())w0.front(true);
                            }else{
                                w0.disable(true);
                                if(w0.front())w0.front(false);
                                w0.selectNextCandinate();
                            }
                        });
                        $("#Tip3").style.opacity=1;
                    },int300);
                    $("#Tip2").style.opacity=1;
                },int300);
                $("#Tip1").style.opacity=1;
            },int300);
            $("#TEST3").addEventListener("click",function(){
                var w=mgr.newWindow("WinRand").rect({left:30+Math.random()*180,top:30+Math.random()*180,width:581,height:593+30}).icon("av.sett").title(Date.now());
                w.show(true);
            });
            $("#TEST4").addEventListener("click",function(){
                var w,ws=document.querySelectorAll(".Window#WinRand");
                UI.internal.filter(ws,function(i){i=i.uiobj;if(!w&&i.state=="open")w=i;});
                if(!w)UI.internal.filter(ws,function(i){i=i.uiobj;if(!w&&i.state=="closed")w=i;});
                if(!w)return;
                if(w.show()){
                    w.on("show",function(ev){if(ev.extra.stage=="end")this.destroy();});
                    w.show(false);
                }else w.destroy();
            });
        },300);
    });
});
