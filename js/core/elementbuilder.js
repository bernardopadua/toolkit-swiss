/**
 * Class WindowConstructor
 * Interface element creation to be build and generate HTML.
 */
WindowConstructor = function(){
    this._element = null;
    this._nextComponent = null;
    this._isWindow = false;

    this.setWindow=function(){
        this._isWindow = true;
    };
    this.addAttr=function(_inAttr, _inValue){
        this._element.setAttribute(_inAttr, _inValue);
    };
    this.setId=function(_inId, _inClass=null){
        this._element.setAttribute("id", _inId);
        if(_inClass!==null)
            this._element.setAttribute("class", _inClass)
        else
            this._element.setAttribute("class", _inId);
    };
    this.getHtml=function(){
        if(this._element!==null)
            return this._element.outerHTML
        else
            return "";
    };
    this.getInnerHtml=function(){
        return this._element.innerHTML;
    };
    this.setHtml=function(_inHtml){
        this._element.innerHTML = _inHtml;
    };
    this.appendHtml=function(_inHtml){
        this._element.innerHTML += _inHtml;
    };
    this.setStyle=function(_inStyle){
        this._element.setAttribute("style", _inStyle);
    };
    this.setPropStyle=function(_inProp, _inValue){
        this._element.style[_inProp] = _inValue;
    };
    this.createElement=function(_inType){
        this._element = document.createElement(_inType);
    };
    this.getElement=function(){
        return this._element;
    };
    this.addNComponent=function(_inComponent){
        this._nextComponent = _inComponent;
    };
}

/*
    Class ElementBuilder
    This class is responsible to build all elements on chrome-tab.
    It's not injecting html, it build it only. Frontend class inject the builded html.

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
    _windowToBuild:null,
    _tmpAssets:null,

    init_:function(_inJson){
        console.log("ElementBuilder::init_");
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

    constructToolKitStructure_:function(_inJsonTK){
        const jsonTk     = JSON.parse(_inJsonTK);
        const blackLayer = "<div id='tkblack-layer'></div>";

        const strTk = new WindowConstructor();
        strTk.createElement("div");
        strTk.setId(jsonTk["tkswiss"]["id"]);
        strTk.setHtml(blackLayer);
        
        this._windowToBuild = strTk;
    },

    constructWindowElements_:function(_inWindowConstructor, _inIdTool, _inExtURL){

        const _cwdw = JSON.parse(_inWindowConstructor)[_inIdTool];
        let tmpHtml = "";
        
        //Assets Ids
        let vAssets = (_cwdw["window"]["asset-list"]===undefined) ? [] : _cwdw["window"]["asset-list"];

        //Parsing assets. Replacing variables/assets-ids
        const parseAssets = function(_inAssets, _inHtml){
            let tmpHtml = _inHtml;
            _inAssets.forEach(function(el){
                tmpHtml = tmpHtml.replace("{"+el[0]+"}", _inExtURL+el[1]);
            });

            return tmpHtml;
        };

        //Window
        const wintool = new WindowConstructor();
        wintool.createElement("div");
        wintool.setId(_cwdw["window"]["id"], _cwdw["window"]["class"]);
        wintool.setStyle(_cwdw["window"]["style"]);
        if(_cwdw["window"]["supress-black"]!==undefined) //Supress black div on the background
            wintool.addAttr("supress-black", _cwdw["window"]["supress-black"]);

        //Head
        const winhead = new WindowConstructor();
        winhead.createElement("div");
        winhead.setId("window-head");
        if(_cwdw["window-head"].style!==undefined)
            winhead.setStyle(_cwdw["window-head"].style);
        winhead.setHtml(_cwdw["window-head"].title);
        // Buttons Window ----
        vAssets = Array(vAssets)[0].concat([["wclose-btn", "assets/wclose-btn.png"]], [["wup-btn", "assets/wup-btn.png"]], [["wmini-btn", "assets/wmini-btn.png"]]);
        const buttons = "<div class='wbuttons-float'><img opt='wup-btn'  src='{wup-btn}' class='wup-btn button-head' /><img opt='wmini-btn' src='{wmini-btn}' class='wmini-btn button-head' /><img opt='wclose-btn' src='{wclose-btn}' class='wclose-btn button-head' /></div>";
        winhead.appendHtml(parseAssets(vAssets, buttons));

        //Options
        const winoptions = new WindowConstructor();
        if(_cwdw["window-options"]!==undefined){
            tmpHtml = "";
            winoptions.createElement("div");
            winoptions.setId("window-options");
            if(_cwdw["window-options"]["style"]!==undefined)
                winoptions.setStyle(_cwdw["window-options"]["style"]);
            tmpHtml += "<ul>";

            const fattrs = function(_inAttrs){
                return _inAttrs.reduce(function(p, el){
                    return p +" "+ el;
                },0);
            }

            if(_cwdw["window-options"]["options"].length > 0){
                for (var i = 0; i < _cwdw["window-options"]["options"].length; i++) {
                    const opt      = _cwdw["window-options"]["options"][i];
                    const optTitle = _cwdw["window-options"]["options-title"][i];
                    tmpHtml += "<li class='"+opt+"' ";
                    if(_cwdw["window-options"]["options-attr"]!==undefined)
                        tmpHtml += fattrs(_cwdw["window-options"]["options-attr"][i]);
                    tmpHtml += ">" + optTitle + "</li>";
                }
            }
            tmpHtml += "</ul>";
            winoptions.setHtml(tmpHtml);
        }

        //Content
        const wincontent = new WindowConstructor();
        if(_cwdw["window-content"]!==undefined){
            tmpHtml = "";
            wincontent.createElement("div");
            wincontent.setId("window-content");
            for (var i = 0; i < _cwdw["window-content"]["contents"].length; i++) {
                const content      = _cwdw["window-content"]["contents"][i];
                const content_data = _cwdw["window-content"]["data-contents"][content];
                if(content_data!==undefined){
                    tmpHtml += "<div id='"+content+"'";
                    tmpHtml += (content_data.style!==undefined) ? "style='"+content_data.style+"'" : "";
                    tmpHtml += (content_data.class!==undefined) ? "class='"+content_data.class+"'" : "";
                    tmpHtml += ">";

                    content_data.html.forEach(function(ctnData) {
                        tmpHtml += ctnData;
                    }, this);
                    tmpHtml += "</div>"
                    if(content_data.assets!==undefined)
                        tmpHtml = parseAssets(vAssets, tmpHtml);
                } else {
                    console.log("ElementBuilder::ContentBuildError");
                }
                wincontent.setHtml(tmpHtml);
            }
        }

        //Footer
        const winfooter  = new WindowConstructor();
        if(_cwdw["window-content"]!==undefined){
            winfooter.createElement("div");
            winfooter.setId("window-footer");
            winfooter.setHtml(_cwdw["window-footer"]["footer"]);
            if(_cwdw["window-footer"]["footer"]!==undefined)
                winfooter.setStyle(_cwdw["window-footer"]["footer"]["style"]);
        }

        //Isolate the head of window
        const winelements = new WindowConstructor();
        winelements.createElement("div");
        winelements.setId("window-elements-bundled");
        winelements.setWindow();

        //Mounting Elements
        wincontent.addNComponent(winfooter);
        winoptions.addNComponent(wincontent);
        winelements.addNComponent(winoptions);
        winhead.addNComponent(winelements);
        wintool.addNComponent(winhead);

        this._windowToBuild = wintool;
    },

    buildHTML_:function(_inWindow=null, _inIsWindow=false){
        let winC = _inWindow;
        let tmpHtml = "";

        if(_inWindow===null)
            winC = this._windowToBuild;

        if(winC._nextComponent!==null)
            tmpHtml += this.buildHTML_(winC._nextComponent, winC._nextComponent._isWindow);

        if(_inIsWindow){ 
            winC.appendHtml(tmpHtml);
            tmpHtml = winC.getHtml();
        } else {
            tmpHtml = winC.getHtml() + tmpHtml;
        }

        return tmpHtml;
    },

    getAssets_:function(){
        return this._tmpAssets;
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