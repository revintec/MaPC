"use strict";
(function libraryCode1(window,document,undefined){
    var UI=window.UI=function(evLsnr){
        if(loadingFinished)setTimeout(function(){evLsnr(UI.defaultManager);});
        else evLsnrsLF.push(evLsnr);
    };UI.internal={};
    var evLsnrsLF=[],loadingFinished;




    /**
     *  DO NOT USE helper methods defined here,
     *  use the ones in svn/.../personal/header.js,
     *  which are the latest
     */





    var internal=function(fn,name){if(!(name=name||fn.name2||fn.name))throw "UnnamedFunction";return (UI.internal[name]=fn);},
        assert=(function assert(bool,message){if(bool)return bool;throw message||"AssertionFailure";}),
        extend=internal(function extend(target,source,redefine){
            target=target||{};
            for(var key in source){
                if(redefine){
                    Object.defineProperty(target,key,{
                        configurable:true,
                        enumerable:true,
                        value:source[key],
                        writable:true
                    });
                }else target[key]=source[key];
            }return target;
        }),
        transcend=internal(function transcend(fn,thiz,name){return extend(thiz?fn.bind(thiz):Function.prototype.call.bind(fn),{name2:name||fn.name2||fn.name},true);}),
        transcall=internal(function transcall(thiz,fn,args){return fn&&fn.apply(thiz,args);}),
        inherite=internal(function inherite(target,source,ext){
            target=target||function(){};
            source=source||Object;
            extend(target.prototype=Object.create(source.prototype),ext,true);
            target.super=target.prototype.super=source.prototype;
            target.constructor=target.prototype.constructor=target;
            return target;
        }),
        setTimeout=internal(function setTimeout(){
            if(arguments.length==1){
                arguments[1]=10;
                arguments.length=2;
            }window.setTimeout.apply(this,arguments);
        }),
        // ===================================================
        group=internal(transcend(console.group,console)),
        groupCollapsed=internal(transcend(console.groupCollapsed,console)),
        groupEnd=internal(transcend(console.groupEnd,console)),
        debug=internal(transcend(console.debug/*trace*/,console)),
        slice=internal(transcend(Array.prototype.slice)),
        map=internal(function map(obj,fn){
            var newobj=Array.isArray(obj)?[]:{};
            for(var key in obj){
                var val=fn(obj[key],key,obj);
                if(val!==undefined)newobj[key]=val;
            }return newobj;
        }),
        anyof=internal(function anyof(obj,ele){var retv;map(obj,function(e){if(e==ele)retv=true;});return retv;}),
        filter=internal(function filter(arr,fn){
            fn=fn||function(e){return e;};
            var newarr=[];
            for(var i=0;i<arr.length;++i){
                var val=fn(arr[i],i,arr);
                if(val!==undefined)newarr.push(val);
            }return newarr;
        }),
        // =============================================
        absoluteOffset=internal(function absoluteOffset(elem){
            var left=elem.offsetLeft,top=elem.offsetTop;
            while((elem=elem.offsetParent)){
                left+=elem.offsetLeft;top+=elem.offsetTop;
                if(elem.style.position=="fixed")break;
            }return{left:left,top:top};
        }),
        // relativeOffset=internal(function relativeOffset(elem,parent){
        //     parent=parent||elem.offsetParent;
        //     var pp=absoluteOffset(parent);
        //     var tp=absoluteOffset(elem);
        //     return{left:tp.left-pp.left,top:tp.top-pp.top};
        // }),
        finishLoading=internal(function finishLoading(){if(loadingFinished)return false;for(var i=0;i<evLsnrsLF.length;++i)evLsnrsLF[i](UI.defaultManager);evLsnrsLF=null;return(loadingFinished=true);}),
        generateContainer=internal(function generateContainer(tag,clazz,id){return extend(document.createElement(tag),{className:clazz,id:id},true);});
    // =======================================================
    // var EventListener=internal(...)
    // var EventListenerGroup=internal(...)
    var Window=internal(function Window(mgr,tag){
        assert(arguments.length==Window.length);
        assert(Object==Window.super.constructor);
        transcall(this,Window.super.constructor,arguments);
        extend(this,{
            mgr:mgr,
            tag:tag,
            container:generateContainer("div","Window Minimized",tag),
            avatar:generateContainer("div","Avatar",tag),
            content:{
                content:generateContainer("div","Content",tag),
                title:generateContainer("div","Title",tag),
                bubble:generateContainer("div","Bubble",tag),
            },
            res:{},
            listeners:{}
        },true);
        var self=this;
        this.mgr.taskarea.appendChild(this.avatar);
        extend(this.avatar.style,{width:0,height:0});
        setTimeout(function(){extend(self.avatar.style,{width:"",height:"",opacity:""});});
        this.avatar.addEventListener("click",function(){
            if(self.state=="closed")self.show(true);
            if(!self.front())self.front(true);
            else if(self.state=="open")self.show(false);
        });
        this.mgr.winarea.appendChild(this.container);
        this.container.uiobj=this;
        this.state="closed";
        map(this.content,function(elem){self.container.appendChild(elem);});
        this.content.title.innerText=tag||"Window";
        this.content.title.appendChild(this.content.controls=generateContainer("div","Controls",""));
        var bClose=generateContainer("div","Control","Close");
        var bMaxim=generateContainer("div","Control","Maximize");
        this.content.controls.appendChild(bClose);
        this.content.controls.appendChild(bMaxim);
        bClose.addEventListener("click",function(){self.show(false);});
        // TODO double clicking on titlebar to toggle max/normal as well
        var tmpSave;// FIXME should be self.savedrect, and has a viewState as minimized/normal/maximized, and all rect controls are subject to self.savedrect, but triggers additional layout and dom css changes when window is not minized
        bMaxim.addEventListener("click",function(){
            if(tmpSave){
                self.rect(tmpSave);
                tmpSave=null;
            }else{
                tmpSave=self.rect(true);
                self.rect({left:30,top:30,right:8,bottom:8});
            }
        });
        var mouseHere,cancelToggle;
        this.container.addEventListener("mousedown",function(ev){
            cancelToggle=!self.front();
            if(!self.front())self.front(true);
            if(ev.target!=self.content.bubble&&ev.target!=self.content.title){
                mouseHere=false;
                return;
            }ev.preventDefault();
            mouseHere=true;
            if(tmpSave){
                self.rect(map(tmpSave,function(v,k){if(/left|top/.exec(k))return;return v;}),true);
                tmpSave=null;
            }try{self.drag(true);}catch(e){debug(e);}
        });
        this.on("rect",function(){cancelToggle=true;});
        document.addEventListener("mouseup",function(ev){
            if(!mouseHere)return;
            mouseHere=false;
            try{self.drag(false);}catch(e){debug(e);}
            if(ev.target!=self.content.bubble&&ev.target!=self.content.title)return;
            if(!cancelToggle&&ev.target.classList.contains("Bubble")){
                if(self.state=="open")self.show(false);
                if(self.state=="closed")self.show(true);
            }
        });
        return this;
    });
    inherite(Window,Object,{
        on:function(event,listener){
            group("EventHandlingPhrase: "+(event.type||event)+" for "+this.tag);
            switch(arguments.length){
                case 1:
                    if(!event.type){
                        debug("ConvertPlainEvent: "+event);
                        event={type:event};
                    }if(this.listeners[event.type]){
                        var i=0;
                        while(i<this.listeners[event.type].length)
                            if(this.listeners[event.type][i++].call(this,event))break;
                        debug(i+" of "+this.listeners[event.type].length+" handlers processed");
                    }else debug("MissingEventHandler: "+event.type);
                    break;
                case 2:
                    (this.listeners[event]=this.listeners[event]||[]).unshift(listener);
                    break;
                default:throw "IllegalArgument";
            }groupEnd();
            return this;
        },
        off:function(event,listener){
            this.listeners[event]=listener?filter(this.listeners[event],function(l){if(l==listener)return;return l;}):[];
            return this;
        },
        front:function(ft){
            if(!arguments.length)return this.mgr.frontMost==this;
            ft=!!ft;
            if(this.front()==ft)throw "IllegalState";
            if(ft){
                var p=this.container.parentElement;
                this.container.remove();
                p.appendChild(this.container);
                this.container.classList.add("Active");
                this.avatar.classList.add("Active");
                if(this.mgr.frontMost)this.mgr.frontMost.front(false);
                this.mgr.frontMost=this;
            }else{
                this.container.classList.remove("Active");
                this.avatar.classList.remove("Active");
                this.mgr.frontMost=null;
            }this.on({type:"front",front:ft});
            this.on({type:"layout",reason:"front",extra:ft,rect:this.layoutRect()});
            return this;
        },
        disable:function(b){
            if(!arguments.length)return this.container.style.pointerEvents=="none";
            b=!!b;
            if(this.disable()==b)throw "IllegalState";
            this.on({type:"disable",disable:b});
            this.container.style.pointerEvents=this.avatar.style.pointerEvents=b?"none":"auto";
            return this;
        },
        styleRect:function(style){
            if(!arguments.length)
                return{
                    left:this.container.style.left,
                    top:this.container.style.top,
                    width:this.container.style.width,
                    height:this.container.style.height,
                    right:this.container.style.right,
                    bottom:this.container.style.bottom
                };
            return extend(this.container.style,style);
        },
        show:function(sw,immediate){
            if(!arguments.length)return this.state=="open"||this.state=="opening";
            sw=!!sw;
            var pp,ap,self=this;
            if(sw){
                if(this.state!="closed"||!this.savedrect)throw "IllegalState";
                this.state="opening";
                if(!this.front())this.front(sw);
                setTimeout(function(){self.avatar.style.opacity=1;});
                this.on({type:"layout",reason:"show",extra:{stage:"start",show:sw},rect:self.layoutRect()});
                this.on({type:"show",show:sw,extra:{stage:"start"}});
                this.container.classList.remove("Minimized");
                if(immediate){
                    extend(this.container.style,this.savedrect);
                    this.container.style.opacity=1;
                    this.savedrect=null;
                    this.on({type:"show",show:sw,extra:{stage:"end"}});
                    this.state="open";
                    this.on({type:"layout",reason:"show",extra:{stage:"start",show:sw},rect:this.layoutRect()});
                }else{
                    this.disable(true);
                    // FIXME
                    var tmp=this.styleRect();
                    extend(this.container.style,this.savedrect);
                    var obj={left:this.savedrect.left,top:this.savedrect.top,width:this.container.offsetWidth+"px",height:this.container.offsetHeight+"px"};
                    this.styleRect(tmp);
                    pp=absoluteOffset(self.container.offsetParent);
                    ap=absoluteOffset(self.avatar);
                    extend(self.container.style,{
                        left:ap.left-pp.left-self.content.bubble.offsetLeft+"px",
                        top:ap.top-pp.top-self.content.bubble.offsetTop-self.mgr.taskarea.scrollTop+"px",
                        width:"0px",height:"0px",opacity:0
                    });
                    setTimeout(function(){
                        self.container.style.transition="all 0.3s";
                        extend(self.container.style,obj);
                        self.container.style.opacity=1;
                        setTimeout(function(){
                            self.container.style.transition="";
                            extend(self.container.style,self.savedrect);
                            self.savedrect=null;
                            self.disable(false);
                            self.on({type:"show",show:sw,extra:{end:"end"}});
                            self.state="open";
                            self.on({type:"layout",reason:"show",extra:{stage:"end",show:sw},rect:self.layoutRect()});
                        },300);
                    });
                }
            }else{
                if(this.state!="open"||this.savedrect)throw "IllegalState";
                this.state="closing";
                var shouldCandinate=this.front();
                if(shouldCandinate)this.front(sw);
                setTimeout(function(){self.avatar.style.opacity="";});
                this.on({type:"layout",reason:"show",extra:{stage:"start",show:sw},rect:self.layoutRect()});
                this.on({type:"show",show:sw,extra:{stage:"start"}});
                this.container.classList.add("Minimized");
                if(shouldCandinate){
                    var e=this.mgr.winarea.lastElementChild;
                    while(e){
                        if(e.classList.contains("Window")&&!e.uiobj.disable()&&e.uiobj.show()){
                            e.uiobj.front(true);
                            break;
                        }e=e.previousElementSibling;
                    }
                }this.savedrect=this.styleRect();
                if(immediate){
                    pp=absoluteOffset(self.container.offsetParent);
                    ap=absoluteOffset(self.avatar);
                    extend(self.container.style,{
                        left:ap.left-pp.left-self.content.bubble.offsetLeft+"px",
                        top:ap.top-pp.top-self.content.bubble.offsetTop-self.mgr.taskarea.scrollTop+"px",
                        width:"0px",height:"0px",opacity:0
                    });
                    this.on({type:"show",show:sw,extra:{stage:"end"}});
                    this.state="closed";
                }else{
                    this.disable(true);
                    extend(this.container.style,{right:"auto",bottom:"auto",width:this.container.offsetWidth+"px",height:this.container.offsetHeight+"px"});
                    setTimeout(function(){
                        self.container.style.transition="all 0.3s";
                        var pp=absoluteOffset(self.container.offsetParent);
                        var ap=absoluteOffset(self.avatar);
                        extend(self.container.style,{
                            left:ap.left-pp.left-self.content.bubble.offsetLeft+"px",
                            top:ap.top-pp.top-self.content.bubble.offsetTop-self.mgr.taskarea.scrollTop+"px",
                            width:"0px",height:"0px",opacity:0
                        });
                        setTimeout(function(){
                            self.container.style.transition="";
                            self.disable(false);
                            self.on({type:"show",show:sw,extra:{stage:"end"}});
                            self.state="closed";
                        },300);
                    });
                }
            }return this;
        },
        drag:function(enter){
            var isDragging=!!(this.internal=this.internal||{}).draggingFunc;
            if(!arguments.length)return isDragging;
            enter=!!enter;
            if(isDragging==enter)throw "IllegalState";
            this.on({type:"drag",drag:enter});
            if(enter){
                var abso=absoluteOffset(this.container);
                var relX=UI.defaultManager.mouseX-abso.left;
                var relY=UI.defaultManager.mouseY-abso.top;
                var self=this;
                document.addEventListener("mousemove",this.internal.draggingFunc=function dragging(ev){
                    ev.preventDefault();
                    ev.stopPropagation();
                    var pp=absoluteOffset(self.container.offsetParent);
                    self.rect({left:ev.clientX-relX-pp.left,top:ev.clientY-relY-pp.top},true);
                });
            }else{
                document.removeEventListener("mousemove",this.internal.draggingFunc);
                delete this.internal.draggingFunc;
            }return this;
        },
        layoutRect:function(){
            if(arguments.length)throw "IllegalArgument";
            var retv={
                left:0,
                top:0,
                width:this.content.content.offsetWidth,
                height:this.content.content.offsetHeight,
            };retv.right=retv.left+retv.width;retv.bottom=retv.top+retv.height;
            return retv;
        },
        rect:function(obj,immediate){
            var self=this;
            function canUseStyle(){
                var s=self.container.style;
                function b(pp){return pp&&pp!="auto";}
                if(b(s.left)||b(s.top)||b(s.width)||b(s.height)||b(s.right)||b(s.bottom))
                    return s;
            }
            if(!arguments.length||arguments.length==1&&obj===true){
                var retv;
                if(obj){
                    retv=map(this.savedrect||canUseStyle()||getComputedStyle(this.container),function(v,k){
                        if(!/^(left|top|width|height|right|bottom)$/.exec(k))return;
                        if(v=="auto"||v==="")return;
                        return parseFloat(v);
                    });
                    if("width" in retv)delete retv.right;
                    if("height"in retv)delete retv.bottom;
                    return retv;
                }
                if(this.savedrect){
                    retv=extend({},this.savedrect);
                    if(!("left"  in retv))retv.left  =retv.right-retv.width;
                    if(!("top"   in retv))retv.top   =retv.bottom-retv.height;
                    if(!("width" in retv))retv.width =retv.right-retv.left;
                    if(!("height"in retv))retv.height=retv.bottom-retv.top;
                    if(!("right" in retv))retv.right =retv.left+retv.width;
                    if(!("bottom"in retv))retv.bottom=retv.top+retv.height;
                    return retv;
                }// else
                retv={
                    left:this.container.offsetLeft,
                    top:this.container.offsetTop,
                    width:this.container.offsetWidth,
                    height:this.container.offsetHeight,
                };retv.right=retv.left+retv.width;retv.bottom=retv.top+retv.height;
                return retv;
            }
            if("width" in obj&&"right" in obj||"height" in obj&&"bottom" in obj)throw "IllegalArgument";
            if(this.state=="recting"||this.state=="opening")throw "IllegalArgument";
            this.on({type:"rect",rect:obj});
            var target;
            function apply(){
                if("left"  in obj)extend(target,{left:obj.left+"px"});
                if("top"   in obj)extend(target,{top:obj.top+"px"});
                if("width" in obj)extend(target,{width:obj.width+"px",right:"auto"});
                if("height"in obj)extend(target,{height:obj.height+"px",bottom:"auto"});
                if("right" in obj)extend(target,{right:obj.right+"px",width:"auto"});
                if("bottom"in obj)extend(target,{bottom:obj.bottom+"px",height:"auto"});
            }
            if(this.state=="open"){
                target=this.container.style;
                if(immediate){
                    apply();
                    this.on({type:"layout",reason:"rect",extra:{stage:"start",rect:obj},rect:this.layoutRect()});
                }else{
                    this.disable(true);
                    this.state="recting";
                    // FIXME set styles according to show() for css animations
                    if("width" in obj)extend(target,{width:this.container.offsetWidth+"px",right:"auto"});
                    if("height"in obj)extend(target,{height:this.container.offsetHeight+"px",bottom:"auto"});
                    if("right" in obj)extend(target,{right:this.container.offsetParent.offsetWidth-this.container.offsetLeft-this.container.offsetWidth+"px",width:"auto"});
                    if("bottom"in obj)extend(target,{bottom:this.container.offsetParent.offsetHeight-this.container.offsetTop-this.container.offsetHeight+"px",height:"auto"});
                    setTimeout(function(){
                        self.container.style.transition="all 0.3s";
                        apply();
                        setTimeout(function(){
                            self.container.style.transition="";
                            self.disable(false);
                            self.state="open";
                            self.on({type:"layout",reason:"rect",extra:{stage:"end",rect:obj},rect:self.layoutRect()});
                        },300);
                    });
                }
            }else{
                target=this.savedrect={};
                apply();
            }return this;
        },
        title:function(title){
            if(!arguments.length)return this.res.title;
            this.on({type:"title",title:title});
            // FIXME will corrupt buttons in TitleBar
            var node;
            filter(this.content.title.childNodes,function(n){
                if(!node&&n.nodeType==Node.TEXT_NODE)
                    node=n;
            });
            node.nodeValue=this.res.title=title;
            return this;
        },
        icon:function(res){
            if(!arguments.length)return this.res.avatar;
            this.res.avatar=res;
            this.avatar.style.backgroundImage="url(res/"+res+".png)";
            this.content.bubble.style.backgroundImage="url(res/"+res+".png)";
            return this;
        },
        destroy:function(){
            group("DestroyingSequence");
            debug("DestroyingWindow: "+this.tag);
            this.on("destroy");
            var self=this;
            var retv=transcall(this,Window.super.destroy,arguments);
            this.mgr.windows[this.tag]=filter(this.mgr.windows[this.tag],function(w){if(w==self)return;return w;});
            this.container.remove();
            extend(this.avatar.style,{width:0,height:0,opacity:0});
            setTimeout(function(){self.avatar.remove();},300);
            debug("DestroyedWindow: "+this.tag);
            groupEnd();
            return retv;
        }
    });
    var WindowGroup=internal(function WindowGroup(winarea,taskarea,tag){
        assert(arguments.length==WindowGroup.length);
        assert(Window==WindowGroup.super.constructor);
        winarea.classList.add("WindowGroup");
        extend(this,{
            tag:tag,
            winarea:winarea,
            taskarea:taskarea,
            windows:{},
            listeners:{},
            mouseX:-1,
            mouseY:-1
        },true);
        var self=this;
        document.addEventListener("mousemove",function(ev){
            self.mouseX=ev.clientX;
            self.mouseY=ev.clientY;
        });
        return this;
    });
    inherite(WindowGroup,Window,{
        front:undefined,
        disable:function(b){
            if(!arguments.length)return this.winarea.style.pointerEvents=="none";
            b=!!b;
            if(this.disable()==b)throw "IllegalState";
            this.on({type:"disable",disable:b});
            this.winarea.style.pointerEvents=this.taskarea.style.pointerEvents=b?"none":"auto";
            return this;
        },
        styleRect:undefined,
        show:undefined,
        drag:undefined,
        layoutRect:undefined,
        rect:undefined,
        title:undefined,
        icon:undefined,
        newWindow:function(tag){
            var w=new Window(this,tag);
            (this.windows[tag]=this.windows[tag]||[]).push(w);
            setTimeout(function(){w.on("create");});
            this.on({type:"createChild",window:w});
            return w;
        },
        destroy:function(){
            group("DestroyingSequence");
            debug("DestroyingWindowGroup: "+this.tag);
            alert("Trying to shutdown the WindowSystem");
            var retv=transcall(this,WindowGroup.super.destroy,arguments);
            debug("DestroyedWindowGroup: "+this.tag);
            groupEnd();
            return retv;
        }
    });
    // DO NOT USE ready for that we may use resource preloading
    window.addEventListener("load",function(){
        UI.defaultManager=new WindowGroup(document.querySelector(".WindowArea"),document.querySelector(".TaskMgmt"),"ui.win.mgr.main");
        window.addEventListener("resize",function(){
            for(var tag in UI.defaultManager.windows){
                var group=UI.defaultManager.windows[tag];
                for(var i=0;i<group.length;++i)
                    group[i].on({type:"layout",reason:"windowResize",rect:group[i].layoutRect()});
            }
        });
        finishLoading();
    });return UI;
})(window,document);