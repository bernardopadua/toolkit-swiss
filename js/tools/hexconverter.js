/**
 * Class HexConverter
 * This class is responsible for all convertions of hex values.
 * @class
 */
const HexConverter = function(){

    this._ID_CONV = "hexconverter-container";
    this._ID_CALC = "hexcalc-container";
    this._TAB_CONV = "hex-conv";
    this._TAB_CALC = "hex-calc";

    this.init=function(){
        this._tool_block_id = "toolkit-block-hex";
        this.super(ID_HEX);

        const isDefault = true;
        this.addTab_(this._TAB_CONV, isDefault);
        this.addTab_(this._TAB_CALC);
        this.addContainer_(this._ID_CONV);
        this.addContainer_(this._ID_CALC);

        this.setComponentEvent_("btnConverter", "click", this.btnConverterClick);
        this.setComponentEvent_("btnCalculateHex", "click", this.btnCalculaClick);
        this.showTool_();
    }

    this.btnConverterClick=function(e){
        const optConv = this.getComponent_("opt-conv");
        const optToConv = optConv.selectedIndex;
        
        const txtAreaResult = this.getComponent_("hexresult");
        const txtAreaHex = this.getComponent_("hexstring");

        const checkHex = function(_inHex){
            if((_inHex.value.length%2)==0){
                this.errorRaise_(false);
                return true;
            }

            this.errorRaise_(true, "Hex inválido!");
            return false;
        }.bind(this);

        const convertHexToDecimal=function(_inHex){
            var result = "";
            for (var i = 0; i<_inHex.length; i+=2) {
                var hex = _inHex.substr(i, 2);
                result += parseInt(hex, 16).toString();
            }

            return result;
        };

        const convertDecimalToHex=function(_inDec){
            var decimals = _inDec.split(" ");
            var hex = "";
            decimals.forEach(function(dec) {
                hex += parseInt(dec, 10).toString(16).toUpperCase();
            }, this);

            return hex;
        };

        const converStringToHex=function(_inString){
            var hex = "";
            for (var i = 0; i < _inString.length; i++) {
                hex += _inString.charCodeAt(i).toString(16).toUpperCase();
            }

            return hex;
        };

        const convertHexToString=function(_inHex){
            var result = "";
            for (var i = 0; i<_inHex.length; i+=2) {
                var hex = _inHex.substr(i, 2);
                result += String.fromCharCode(parseInt(hex, 16));
            }

            return result;
        };

        switch (optConv.options[optToConv].value) {
            case "dec":
                if(txtAreaResult.value.length>0 && txtAreaHex.value.length==0){
                    txtAreaHex.value = convertDecimalToHex(txtAreaResult.value);
                } else {
                    if(checkHex(txtAreaHex))
                        txtAreaResult.value = convertHexToDecimal(txtAreaHex.value);
                }
                break;
            case "string":
                if(txtAreaResult.value.length>0 && txtAreaHex.value.length==0){
                    txtAreaHex.value = converStringToHex(txtAreaResult.value);
                } else {
                    if(checkHex(txtAreaHex))
                        txtAreaResult.value = convertHexToString(txtAreaHex.value);
                }
                break;
            default:
                break;
        }
    };

    this.btnCalculaClick=function(){
        const optCalc = this.getComponent_("opt-calc");
        const optToCalc = optCalc.selectedIndex;
        
        const hexCalcResult = this.getComponent_("hex-result-calc");

        const iptOne = this.getComponent_("h-one");
        const iptTwo = this.getComponent_("h-two");

        const pihex = function(_inValue){
            return parseInt(_inValue, 16);
        };

        const phex = function(_inValue){
            return _inValue.toString(16).toUpperCase();
        };

        switch (optCalc.options[optToCalc].value) {
            case "add":
                hexCalcResult.innerHTML = phex(pihex(iptOne.value) + pihex(iptTwo.value));
                break;
            case "sub":
                hexCalcResult.innerHTML = phex(pihex(iptOne.value) - pihex(iptTwo.value));
                break;
            case "mul":
                hexCalcResult.innerHTML = phex(pihex(iptOne.value) * pihex(iptTwo.value));
                break;
            case "div":
                hexCalcResult.innerHTML = phex(pihex(iptOne.value) / pihex(iptTwo.value));
                break;
            case "xor":
                hexCalcResult.innerHTML = phex(pihex(iptOne.value) ^ pihex(iptTwo.value));
                break;
            default:
                break;
        }
    };

};
HexConverter.prototype = Object.create(Tool.prototype);

/**
 * Starting tool and calling elements;
 * The init call is on FrontEnd;
 * @instance FrontEnd Class
 */
ctxFront.initTool_(ID_HEX, new HexConverter());
ctxFront.getElements_(ID_HEX);