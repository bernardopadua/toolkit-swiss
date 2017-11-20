/*
    Class Ajax
*/

var AjaxApi = function(){
    //Ajax props
    this._httpReq=null;
    this._response=null;
    this._callbackFunc=null;

    this.init_=function(){
        console.log("Ajax::init_");
        
        this._httpReq = new XMLHttpRequest();
        this._httpReq.onreadystatechange = function(){
            this.readyState_();
        }.bind(this);
    };

    this.readyState_=function(){
        var ctx = this._httpReq;
        if(ctx.status==200 && ctx.readyState==4)
            this._callbackFunc(ctx.responseText);
        else if (ctx.status==404 && ctx.readyState==4)
            this._callbackFunc("404");
    };

    this.setParamHeader_=function(_inObjParam){
        for(var param of Object.keys(_inObjParam)){
            this._httpReq.setRequestHeader(param, _inObjParam[param]);
        }
    };

    this.setCallback_=function(_inFunc){
        this._callbackFunc = _inFunc;
    };

    this.request_=function(_inType, _inUrl){
        this._httpReq.open(_inType, _inUrl);
    };

    this.sendReq_=function(){
        delete window.document.referrer;
        window.document.referrer = "https://github.com";
        window.document.__defineGetter__('referrer', function () {
            return "https://github.com";
        });
        Object.defineProperty(document, "referrer", {get : function(){ return "no-referrer-when-downgrade"; }});
        this._httpReq.send();
    };

    this.init_();
};