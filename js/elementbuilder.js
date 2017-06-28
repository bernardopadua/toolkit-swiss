/*
    Class ElementBuilder
    This class is responsible to build all elements on tab.
    It's not injecting html, it build it only. frontend inject the builded html.

    _inJson: Json of tool to build it.
*/
ElementBuilder = function(){
    this.init_();
};

ElementBuilder.prototype = {
    /*CONSTS*/
    _cTabIndent:2,

    /*PROPERTIES*/
    _idApp:null,
    _jsonObject:null,
    _outerHTML:null,
    _innerElmChain:null,

    init_:function(_inJson){
        console.log("INIT::ElementBuilder");
    },

    parseElement_:function(_inJson){
        if(_inJson != null){
            try {
                this._jsonObject = JSON.parse(_inJson);
                this._idApp = Object.keys(this._jsonObject)[0];

                this._outerHTML = this.buildElement_(this._jsonObject[this._idApp]);
                return true;
            } catch (error) {
                console.log("ElementBuilder::parseElement_->Error");
                console.log(error);
                return false;
            }
        }
    },

    //Build elements recursivily, i mean.. in general..
    buildElement_:function(_inElement, _inCounter=null){
        var tmpHtml = "";
        var gId = this.getIdStr_;
        var counter = (_inCounter==null ? 0 : _inCounter);
        var tabs = " ".repeat(counter*this._cTabIndent);

        if(_inElement.constructor==Array){

            _inElement.forEach(function(element) {
                tmpHtml += this.buildElement_(element);
            }, this);

        } else {

            switch (_inElement.element) {
                case "div":
                    tmpHtml  = tabs+"<div"+gId(_inElement.id);
                    tmpHtml += (_inElement.class!==undefined ? " class='"+_inElement.class+"'" : "");
                    tmpHtml += (_inElement.style!==undefined ? " style='"+_inElement.style+"'" : "");
                    tmpHtml += ">\n";

                    //Applying img URL if this element is IMG_ONLY
                    if( _inElement.asset!==undefined){
                         _inElement.data = "<img src='"+_inElement.data+"' class='asset_load' />";
                    }

                    tmpHtml += (_inElement.data!==undefined ? _inElement.data : "");
                    if(_inElement.next!=undefined && _inElement.next!=null){
                        counter++; //tab indent calculation
                        tmpHtml += this.buildElement_(_inElement.next, counter);
                    }
                    tmpHtml += tabs+"</div>\n";
                    break;
                case "ul":
                    tmpHtml = tabs+"<ul>\n";
                    if(_inElement.for!=undefined){
                        var iteration = parseInt(_inElement.for.split("x")[0]);
                        var elementtmp   = _inElement.for.split("x")[1];

                        for (var i=0;i < iteration;i++) {
                            tmpHtml += tabs;
                            tmpHtml += "<"+elementtmp;
                            tmpHtml += (_inElement.class_for!=undefined ? " class='"+_inElement.class_for[i]+"'" : "");
                            tmpHtml += (_inElement.id_for!=undefined ? " id='"+_inElement.id_for[i]+"'" : "");
                            tmpHtml += (_inElement.attr_for!=undefined ? " "+_inElement.attr_for[i].split(":")[0]+"='"+_inElement.attr_for[i].split(":")[1]+"'" : "");
                            tmpHtml += ">";
                            tmpHtml += _inElement.data_for[i];
                            tmpHtml += "</"+elementtmp+">\n";
                        }
                    }

                    tmpHtml += tabs+"</ul>\n";
                    break;
            }

        }

        return tmpHtml;
    },
    getIdStr_: function(_inId){
        if(_inId != undefined){
            return " id='"+_inId+"'";
        }
        
        return "";
    }
};