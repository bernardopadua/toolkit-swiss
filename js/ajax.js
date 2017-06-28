/*
    Class Ajax
*/

var AjaxApi = function(){
    this.init_();
};

AjaxApi.prototype = {

    //Ajax props
    _httpReq:null,
    _response:null,
    _callbackFunc:null,

    init_:function(){
        console.log("INIT::Ajax");
        
        this._httpReq = new XMLHttpRequest();
        this._httpReq.onreadystatechange = function(){
            this.readyState_();
        }.bind(this);

        console.log("ajaxei");
    },
    readyState_:function(){
        var ctx = this._httpReq;
        if(ctx.status==200 && ctx.readyState==4)
            this._callbackFunc(ctx.responseText);
        else if (ctx.status==404 && ctx.readyState==4)
            this._callbackFunc("404");
    },

    setParamHeader_:function(_inObjParam){
        for(var param of Object.keys(_inObjParam)){
            this._httpReq.setRequestHeader(param, _inObjParam[param]);
        }
    },

    setCallback_:function(_inFunc){
        this._callbackFunc = _inFunc;
    },

    request_:function(_inType, _inUrl){
        this._httpReq.open(_inType, _inUrl);
    },

    sendReq_:function(){
        this._httpReq.send();
    }

};