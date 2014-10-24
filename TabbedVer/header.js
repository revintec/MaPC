"use strict";
(function libraryCode1(window,document,undefined){
    var HEADER=window.HEADER=function(evLsnr){
        if(loadingFinished)setTimeout(function(){evLsnr(HEADER);});
        else evLsnrsLF.push(evLsnr);
    };HEADER.internal={};
    var evLsnrsLF=[],loadingFinished;function pervert(){}
    var internal=function(fn,name){if(!(name=name||fn.name2||fn.name))throw "UnnamedFunction";return (HEADER.internal[name]=fn);},
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
        filter=internal(function filter(arr,fn){
            fn=fn||function(e){return e;};
            var newarr=[];
            for(var i=0;i<arr.length;++i){
                var val=fn(arr[i],i,arr);
                if(val!==undefined)newarr.push(val);
            }return newarr;
        }),
        keyIn=internal(function keyIn(obj,x){
            var retv=[];
            if(arguments.length<2){
                if(!obj)return;
                map(obj,function(e,k){retv.push(k);});
                return retv;
            }map(obj,function(e,k){if(e==x)retv.push(k);});
            return retv;
        }),
        anyIn=internal(function anyIn(obj,x){
            var retv=keyIn.apply(this,arguments);
            if(!retv||!retv.length)return;
            return retv[parseInt(Math.random()*retv.length)];
        }),
        andOf=internal(function andOf(obj,x){
            if(!obj)return;
            var retv=anyIn.apply(this,arguments);
            return obj[retv];
        }),
        // =============================================
        absoluteOffset=internal(function absoluteOffset(elem){
            var left=elem.offsetLeft,top=elem.offsetTop;
            while((elem=elem.offsetParent)){
                left+=elem.offsetLeft;top+=elem.offsetTop;
                if(elem.style.position=="fixed")break;
            }return{left:left,top:top};
        }),
        finishLoading=internal(function finishLoading(){if(loadingFinished)return false;for(var i=0;i<evLsnrsLF.length;++i)evLsnrsLF[i].apply(this,arguments);evLsnrsLF=null;return(loadingFinished=true);}),
        generateContainer=internal(function generateContainer(tag,clazz,id,html){return extend(document.createElement(tag),{className:clazz,id:id,innerHTML:arguments.length<4?"":html},true);});
    // =======================================================

    
    var $=internal(transcend(document.querySelector,document,"$"));
    var $$=internal(transcend(document.querySelectorAll,document,"$$"));
    // (DO NOT USE ready) for that we may use resource preloading
    window.addEventListener("load",function(){
        var currents,activeTab=HEADER.activeTab=function(id){
            var tabs=$$("#HEADER .Tab"),cons=$$("#CONTENT .Content");
            if(currents)map(currents,function(e){e.classList.remove("Active");});
            if(!(id=parseInt(id))||id<0)return false;
            if(tabs.length<id)return false;
            currents={title:tabs[id-1],content:cons[id-1]};
            map(currents,function(e){e.classList.add("Active");});
            extend(slider.style,{left:currents.title.offsetLeft+25+"px",width:currents.title.offsetWidth-50+"px"});
            return true;
        },tabhost=$("#HEADER #Tabs"),slider=$("#HEADER #Tabs #Slider"),contenthost=$("#CONTENT");
        tabhost.addEventListener("mouseover",function(ev){if(ev.target.classList.contains("Tab"))extend(slider.style,{left:ev.target.offsetLeft+25+"px",width:ev.target.offsetWidth-50+"px"});});
        tabhost.addEventListener("mouseout",function(){extend(slider.style,{left:currents.title.offsetLeft+25+"px",width:currents.title.offsetWidth-50+"px"});});
        tabhost.addEventListener("click",function(ev){
            if(!ev.target.classList.contains("Tab"))return;
            activeTab(parseInt(anyIn($$("#HEADER .Tab"),ev.target))+1);
        });
        function applyHTML(elem,html){
            if(html){
                elem.innerHTML="";
                if(html instanceof HTMLElement)
                    elem.appendChild(html);
                else elem.innerHTML=html;
            }return elem;
        }
        HEADER.newTab=function(obj){
            obj=extend({elem:{}},obj);
            if(obj.id)throw "NYI"; // TODO may allow insertBefore?
            obj.title=obj.title||"NewTab";
            obj.id=parseInt(obj.id)||$$("#HEADER .Tab").length;
            tabhost.appendChild(obj.elem.title=applyHTML(generateContainer("div","Tab",obj.title),obj.elem.title||obj.title));
            contenthost.appendChild(obj.elem.content=applyHTML(generateContainer("div","Content",obj.title),obj.elem.content||obj.title));
            obj.elem.title.attachedobj=obj.elem.content.attachedobj=obj;
            return obj;
        };
        var pushmsgs=$("#HEADER #Push"),controls=$("#HEADER #Controls");
        HEADER.setPushmsgs=function(html){return applyHTML(pushmsgs,html);};
        HEADER.setControls=function(html){return applyHTML(controls,html);};
        finishLoading(HEADER);
    });return HEADER;
})(window,document);