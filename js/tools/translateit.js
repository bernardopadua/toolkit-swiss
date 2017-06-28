/* 
    Class TranslateIt
    This class handle all actions of this tool.

    URLS::
    //https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt-br&dt=t&q=beyond
    //http://api.pearson.com/v2/dictionaries/ldoce5/entries?headword=beyond
    //http://www.urbandictionary.com/define.php?term=Computer

*/

TranslateIt = function(_inAjax){
    this.init_(_inAjax);
};

TranslateIt.prototype = {
    //Constants
    _ID_TRANSLATE: "translate-container",
    _ID_DEFINITION: "definition-container",
    _ID_SLANG: "slang-container",
    _ID_LOADER: "loader-container",
    _ID_BLACKLAYER: "tkblack-layer",
    _ID_HIDE_CONTAINERS: "none",
    _LANG_FROM: "en",
    _LANG_TO: "pt-br",

    //Loaded
    _ldTRT:false,
    _ldSLG:false,
    _ldDEF:false,

    //Internal properties
    _sendMessageTk:null, //Reference to bidirectional function message<>response. tool<>toolkit

    //Ajax props
    _ajaxApi:null, //hold the ajax api handle
    _ajaxCallback:null, //store function callback for all calls on ajaxapi
    
    //Variables
    _selectedText:null,

    //Elements
    _main:null, //Main element from tool
    _tool_block: null,
    _trt:null, //Tab translate
    _def:null, //Tab definition
    _slang:null, //Tab slang,

    //Containers
    _ctnTranslate:null,
    _ctnDefinition:null,
    _ctnSlang:null,
    _ctnBlacklayer:null, //Black background layer
    _ctnLoader:null, //Loader container, ajax gif

    //Events
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
        this._sendMessageTk({type:T_HIDE, tool:ID_TIT});
    },

    //Initiating all elements and setting events
    init_:function(_inAjax){
        this._ajaxApi = _inAjax;
        this._main = document.getElementById(ELM_TIT);
        this._tool_block = document.getElementById("toolkit-block-trt");

        var containers = this._main.children["toolkit-block-trt"].children["container-tk"];

        this._ctnTranslate  = containers.children[this._ID_TRANSLATE];
        this._ctnDefinition = containers.children[this._ID_DEFINITION];
        this._ctnSlang      = containers.children[this._ID_SLANG];
        this._ctnLoader     = containers.children[this._ID_LOADER];
        this._ctnBlacklayer = this._main.children[this._ID_BLACKLAYER];

        this._trt = this._main.getElementsByClassName("tit-trt")[0];
        this._def = this._main.getElementsByClassName("tit-def")[0];
        this._slang = this._main.getElementsByClassName("tit-slang")[0];

        this.setEvents_();
        this.showTool_();
    },
    setEvents_:function(){
        //Events for tabs
        this._trt.addEventListener("click", this.tabClick_.bind(this));
        this._def.addEventListener("click", this.tabClick_.bind(this));
        this._slang.addEventListener("click", this.tabClick_.bind(this));

        //Events for tool
        this._ctnBlacklayer.addEventListener("click", this.blackLayerClick_.bind(this));
    },

    //Unhide tool
    unhideMe_:function(_inData){
        this.showToolNewData_(_inData);
    },

    //All tools are hide for default
    showTool_:function(){
        this._main.style.display = "block";
        this._tool_block.style.display = "block";
    },

    //New data coming in, show the tool and translate it;
    showToolNewData_:function(_inData){
        //Reseting loaded tabs;
        this._ldDEF = false;
        this._ldSLG = false;
        this._ldTRT = false;
        
        this.showContainer_(this._ID_HIDE_CONTAINERS); //hidding all container and showing loader
        this.removeSelected_();
        this.setSelectedText_(_inData);
        this.showTool_();
    },

    //Show or hide container.
    // _inShow: true=show // false=hide
    showHideLoader_:function(_inShow){
        if(_inShow){
            this._ctnLoader.style.display = "";
        } else {
            this._ctnLoader.style.display = "none";
        }
    },
    //Reset all tabs from "selected" class
    removeSelected_:function(){
        this._trt.className = "";
        this._def.className = "";
        this._slang.className = "";
    },
    //Handle which tab show according with tab click
    showContainer_:function(_inContainer){
        this._ctnTranslate.style.display = "none";
        this._ctnDefinition.style.display = "none";
        this._ctnSlang.style.display = "none";
        this._ctnLoader.style.display = "none";

        switch (_inContainer) {
            case this._ID_TRANSLATE:
                if(this._ldTRT)
                    this._ctnTranslate.style.display = "";
                else
                    this.getTranslate_();
                break;
            case this._ID_DEFINITION:
                if(this._ldDEF)
                    this._ctnDefinition.style.display = "";
                else
                    this.getDefinition_();
                break;
            case this._ID_SLANG:
                if(this._ldSLG)
                    this._ctnSlang.style.display = "";
                else
                    this.getSlang_();
                break;
            case this._ID_HIDE_CONTAINERS:
                this.showHideLoader_(true);
                break;
            default:
                break;
        }
    },
    //Called from FrontEnd class after the code, elements and data(selection text in this case) injection.
    setSelectedText_:function(text){
        //Seleting tab
        this._trt.className = "selected";
        
        this._selectedText = text;

        //Call translate. Translate it and show container.
        this.getTranslate_();
    },
    //Set the communication directly to ToolKit. Function from FrontEnd;
    setSendMessageTk_:function(_inRefFunc){
        this._sendMessageTk = _inRefFunc;
    },

    getTranslate_:function(){
        var url = "https://translate.googleapis.com/translate_a/single?client=gtx";
        url += "&sl="+this._LANG_FROM+"&tl="+this._LANG_TO+"&dt=t";
        url += "&q="+encodeURI(this._selectedText);

        this._ajaxApi.setCallback_(this.setTranslateToElement_.bind(this));
        this._ajaxApi.request_("GET", url);
        this._ajaxApi.sendReq_();
    },
    //Set the translated text to the elements.
    //  _inTextTrt: Text translated (is an object array). [[["translated", "original"]]]
    setTranslateToElement_:function(_inTxtTrt){
        var translatedText = eval(_inTxtTrt)[0][0][0];
        var originalText   = eval(_inTxtTrt)[0][0][1];

        var originalElm    = this._ctnTranslate.children["trt-original"];
        var translatedElm  = this._ctnTranslate.children["trt-translated"];

        originalElm.innerHTML   = originalText;
        translatedElm.innerHTML = translatedText;
        this.showHideLoader_(false);
        
        this._ldTRT = true;
        this.showContainer_(this._ID_TRANSLATE);
    },

    //Get slang from site slang
    getSlang_:function(){
        var url = "https://www.urbandictionary.com/define.php?term="+encodeURI(this._selectedText);

        this.showContainer_(this._ID_HIDE_CONTAINERS); //Show loader

        this._ajaxApi.setCallback_(this.setSlangToElement_.bind(this));
        this._ajaxApi.request_("GET", url);
        this._ajaxApi.sendReq_();
    },
    //Parse the html from UrbanDictionary slang to the element.
    // _inTxtSlangHTML: HTML from ajax query. Needs parsing.
    setSlangToElement_:function(_inTxtSlangHTML){        
        var tagInit = _inTxtSlangHTML.search('<div id="content">');
        var tagEnd  = _inTxtSlangHTML.search('<div class="large-4 columns show-for-large-up">');
        var content = _inTxtSlangHTML.substr(tagInit, tagEnd-tagInit);

        var divParser  = document.createElement("div");
        divParser.innerHTML = content;

        var divMeanings = document.createElement("div");
        divMeanings.style.overflowY = "scroll";
        divMeanings.style.overflowX = "hidden";
        divMeanings.style.maxHeight = "400px";

        var divsDefContent = divParser.getElementsByClassName("def-panel");

        for (var def of divsDefContent) {
            var meaning = def.getElementsByClassName("meaning")[0];
            meaning.innerHTML = this.removeLinks_(meaning.outerHTML);
            divMeanings.appendChild(meaning);
        }

        if(divMeanings.outerHTML.length > 15)
            this._ctnSlang.innerHTML = "<div class='title'>" + this._selectedText.toUpperCase() + "</div>" + divMeanings.outerHTML;
        else 
            this._ctnSlang.innerHTML = "<div class='meaning'>No definitions!</div>";

        this._ldSLG = true;
        this.showContainer_(this._ID_SLANG);
    },
    removeLinks_:function(_inHtml){
        var tmpHtml = _inHtml;

        tagInit = tmpHtml.search("<a");
        tagEnd  = tmpHtml.substr(tagInit, tmpHtml.length).search(">");

        tmpHtml = tmpHtml.replace(tmpHtml.substr(tagInit, tagEnd+1), "");
        tmpHtml = tmpHtml.replace("</a>", "");

        if(tmpHtml.search("<a") > 0)
            return this.removeLinks_(tmpHtml);
        else
            return tmpHtml;
    },

    getDefinition_:function(){
        var url = "https://od-api.oxforddictionaries.com:443/api/v1/entries/en/"+encodeURI(this._selectedText).trim();

        this.showContainer_(this._ID_HIDE_CONTAINERS); //Show loader

        this._ajaxApi.setCallback_(this.setDefinitionToElement_.bind(this));
        this._ajaxApi.request_("GET", url);

        /*
            Register free at oxforddictionaries.com and get your own. :)
            app_id: get after registration.
            app_key: get after registration.
        */
        this._ajaxApi.setParamHeader_({
            Accept: "application/json",
            app_id: "",
            app_key: ""
        });

        this._ajaxApi.sendReq_();
    },
    setDefinitionToElement_:function(_inDefJson){
        var objDefinition = JSON.parse(_inDefJson);

        var divMeanings = document.createElement("div");
        divMeanings.style.overflowY = "scroll";
        divMeanings.style.overflowX = "hidden";
        divMeanings.style.maxHeight = "400px";
        divMeanings.innerHTML = "<div class='meaning'>No definitions</div>";

        if(_inDefJson!="404"){
            divMeanings.innerHTML = "";
            for(var obj of objDefinition.results[0].lexicalEntries[0].entries[0].senses){
                var divMeaning = document.createElement("div");
                divMeaning.className = "meaning";
                divMeaning.innerHTML = "<ul> <li>"+obj.definitions[0]+"</li> "+(obj.examples!==undefined ? "<li>"+obj.examples[0].text+"</li>" : "")+"</ul>";
                divMeanings.appendChild(divMeaning);
            }
        }

        this._ldDEF = true;
        this._ctnDefinition.innerHTML = "<div class='title'>" + this._selectedText.toUpperCase() + "</div>" + divMeanings.outerHTML;
        this.showContainer_(this._ID_DEFINITION);
    }
};

//Calling the elements of tool
// ctxFront: instance FrontEnd Class;
ctxFront.getElements_();