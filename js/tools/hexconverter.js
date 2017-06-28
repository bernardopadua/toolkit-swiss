/*
    Class HexConverter
    This class is responsible for all convertions of hex values.
*/
HexConverter = function(){
    this.init_();
};

HexConverter.prototype = {
    //Id Elements
    _ID_CONV: "hexconverter-container",
    _ID_CALC: "hexcalc-container",
    _ID_BLACKLAYER: "tkblack-layer",
    _ID_HIDE_CONTAINERS: "none",

    //Containers
    _ctnHexConvert: null,
    _ctnHexCalc: null,

    //Tabs
    _tabConv: null,
    _tabCalc: null,

    //Main Element from Tool
    _main: null,
    _tool_block: null,
    _optConv: null,
    _optCalc: null,
    _btnConverter: null,
    _btnCalculate: null,
    _iptOne: null,
    _iptTwo: null,
    _hexCalcResult: null,
    _textAreaHex: null,
    _textAreaResult: null,
    _errorRaise: null,

    //Callback function. Message to toolkit.
    _sendMessageTk: null,

    init_:function(){
        this._main = document.getElementById(ELM_TIT);
        this._tool_block = document.getElementById("toolkit-block-hex");

        var containers = this._main.children["toolkit-block-hex"].children["container-tk"];

        this._ctnHexConvert  = containers.children[this._ID_CONV];
        this._ctnHexCalc = containers.children[this._ID_CALC];
        this._ctnBlacklayer = this._main.children[this._ID_BLACKLAYER];

        this._tabConv = this._main.getElementsByClassName("hex-conv")[0];
        this._tabCalc = this._main.getElementsByClassName("hex-calc")[0];

        this._errorRaise = this._ctnHexConvert.getElementsByClassName('error-raise')[0];

        this._optConv = this._ctnHexConvert.getElementsByClassName("opt-conv")[0];
        this._optCalc = this._ctnHexCalc.getElementsByClassName("opt-calc")[0];
        
        this._iptOne = this._ctnHexCalc.getElementsByClassName("h-one")[0];
        this._iptTwo = this._ctnHexCalc.getElementsByClassName("h-two")[0];

        this._hexCalcResult = document.getElementById("hex-result-calc");

        this._textAreaHex = this._ctnHexConvert.getElementsByClassName("hexstring")[0];
        this._textAreaResult = this._ctnHexConvert.getElementsByClassName("hexresult")[0];

        this._btnConverter = this._main.getElementsByClassName("btnConverter")[0];
        this._btnCalculate = this._main.getElementsByClassName("btnCalculateHex")[0];

        this.removeSelected_();
        
        this._tabConv.className = "selected"; //Default

        this.setEvents_();
        this.showTool_();
    },
    setEvents_:function(){
        //Events for tabs
        this._tabConv.addEventListener("click", this.tabClick_.bind(this));
        this._tabCalc.addEventListener("click", this.tabClick_.bind(this));

        //Events for buttons
        this._btnConverter.addEventListener("click", this.btnConverterClick_.bind(this));
        this._btnCalculate.addEventListener("click", this.btnCalculateClick_.bind(this));

        //Events for tool
        this._ctnBlacklayer.addEventListener("click", this.blackLayerClick_.bind(this));
    },

    //Unhide the tool
    unhideMe_:function(){
        this._tabConv.click();
        this.showTool_();
    },

    //All tools are hide for default
    showTool_:function(){
        this._main.style.display = "block";
        this._tool_block.style.display = "block";
    },

    //Set the communication directly to ToolKit. Function from FrontEnd;
    setSendMessageTk_:function(_inRefFunc){
        this._sendMessageTk = _inRefFunc;
    },
    errorRaise_:function(_inShow, _inMsg=null){

        this._errorRaise.innerHTML = (_inMsg!==null ? _inMsg : "");

        if (_inShow) {
            this._errorRaise.style.display = "";
        } else {
            this._errorRaise.style.display = "none";
        }
    },

    //Events

    //Button calculator
    btnCalculateClick_:function(){
        var optToCalc = this._optCalc.selectedIndex;
        
        var pihex = function(_inValue){
            return parseInt(_inValue, 16);
        };

        var phex = function(_inValue){
            return _inValue.toString(16).toUpperCase();
        };

        switch (this._optCalc.options[optToCalc].value) {
            case "add":
                this._hexCalcResult.innerHTML = phex(pihex(this._iptOne.value) + pihex(this._iptTwo.value));
                break;
            case "sub":
                this._hexCalcResult.innerHTML = phex(pihex(this._iptOne.value) - pihex(this._iptTwo.value));
                break;
            case "mul":
                this._hexCalcResult.innerHTML = phex(pihex(this._iptOne.value) * pihex(this._iptTwo.value));
                break;
            case "div":
                this._hexCalcResult.innerHTML = phex(pihex(this._iptOne.value) / pihex(this._iptTwo.value));
                break;
            case "xor":
                this._hexCalcResult.innerHTML = phex(pihex(this._iptOne.value) ^ pihex(this._iptTwo.value));
                break;
            default:
                break;
        }
    },

    //Button event for tab of converting hex.
    btnConverterClick_:function(e){
        var optToConv = this._optConv.selectedIndex;
        switch (this._optConv.options[optToConv].value) {
            case "dec":
                if(this._textAreaResult.value.length>0 && this._textAreaHex.value.length==0){
                    this._textAreaHex.value = this.convertDecimalToHex_(this._textAreaResult.value);
                } else {
                    if(this.checkHex_(this._textAreaHex))
                        this._textAreaResult.value = this.convertHexToDecimal_(this._textAreaHex.value);
                }
                break;
            case "string":
                if(this._textAreaResult.value.length>0 && this._textAreaHex.value.length==0){
                    this._textAreaHex.value = this.converStringToHex_(this._textAreaResult.value);
                } else {
                    if(this.checkHex_(this._textAreaHex))
                        this._textAreaResult.value = this.convertHexToString_(this._textAreaHex.value);
                }
                break;
            default:
                break;
        }
    },
    //Check if it's a valid hex
    checkHex_:function(_inHex){
        if((_inHex.value.length%2)==0){
            this.errorRaise_(false);
            return true;
        }

        this.errorRaise_(true, "Hex inválido!");
        return false;
    },
    convertHexToString_:function(_inHex){
        var result = "";
        for (var i = 0; i<_inHex.length; i+=2) {
            var hex = _inHex.substr(i, 2);
            result += String.fromCharCode(parseInt(hex, 16));
        }

        return result;
    },
    convertHexToDecimal_:function(_inHex){
        var result = "";
        for (var i = 0; i<_inHex.length; i+=2) {
            var hex = _inHex.substr(i, 2);
            result += parseInt(hex, 16).toString();
        }

        return result;
    },
    convertDecimalToHex_:function(_inDec){
        var decimals = _inDec.split(" ");
        var hex = "";
        decimals.forEach(function(dec) {
            hex += parseInt(dec, 10).toString(16).toUpperCase();
        }, this);

        return hex;
    },
    converStringToHex_:function(_inString){
        var hex = "";
        for (var i = 0; i < _inString.length; i++) {
            hex += _inString.charCodeAt(i).toString(16);
        }

        return hex;
    },

    //Handle tab clicking
    tabClick_:function(evt){
        var elm = evt.target;
        
        this.removeSelected_();
        this.showContainer_(elm.getAttribute("container"));
        elm.className = "selected";
    },
    //Blacklayer click to close the tool
    blackLayerClick_:function(){
        this._main.style.display = "none";
        this._tool_block.style.display = "none";
        this._sendMessageTk({type:T_HIDE, tool:ID_HEX});
    },

    //Reset all tabs from "selected" class
    removeSelected_:function(){
        this._tabCalc.className = "";
        this._tabConv.className = "";
    },
    //Handle which tab show according with tab click
    showContainer_:function(_inContainer){
        this._ctnHexConvert.style.display = "none";
        this._ctnHexCalc.style.display = "none";

        switch (_inContainer) {
            case this._ID_CONV:
                this._ctnHexConvert.style.display = "";
                break;
            case this._ID_CALC:
                this._ctnHexCalc.style.display = "";
                break;
            default:
                break;
        }
    },    

};

//Calling the elements of tool
// ctxFront: instance FrontEnd Class;
ctxFront.getElements_();