/* 
    Class TranslateIt
    This class handle all actions of this tool.

    URLS::
    //https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt-br&dt=t&q=beyond
    //http://api.pearson.com/v2/dictionaries/ldoce5/entries?headword=beyond
    //http://www.urbandictionary.com/define.php?term=Computer

*/
const TranslateIt = function(_inAjaxAPI){
    this.ajaxApi = _inAjaxAPI; //hold the ajax api handle

    this._ID_TRANSLATE  = "translate-container";
    this._ID_DEFINITION = "definition-container";
    this._ID_SLANG      = "slang-container";
    this._ID_LOADER     = "loader-container";
    this._TAB_TRT       = "tit-trt";
    this._TAB_DEF       = "tit-def";
    this._TAB_SLANG     = "tit-slang";
    this._LANG_FROM     = "en";
    this._LANG_TO       = "pt-br";

    this.selectedText   = "";
    this.isNewText      = false;

    this.init=function(){
        this._tool_block_id = "toolkit-block-trt";
        this.super(ID_TIT);

        const isDefault = true;
        this.addTab_(this._TAB_TRT, isDefault);
        this.setTabEvent_(this._TAB_TRT, "afterclick", this.getTranslate);
        
        this.addTab_(this._TAB_DEF);
        this.setTabEvent_(this._TAB_DEF, "afterclick", this.getDefinition);
        
        this.addTab_(this._TAB_SLANG);
        this.setTabEvent_(this._TAB_SLANG, "afterclick", this.getSlang);

        this.addContainer_(this._ID_TRANSLATE);
        this.addContainer_(this._ID_DEFINITION);
        this.addContainer_(this._ID_SLANG);
        this.addContainer_(this._ID_LOADER);

        this.setEvent_("onunhide", this.onUnhide);

        this.showTool_();

        /**
         * @default _recData Property from Tool class [Callback({string})]. 
         * Use it when need to get data from ToolKit;
         */
        this._recData = this.setSelectedText;
        this._sendMessageTk({type:T_GDATA, tool:ID_TIT});
    };

    this.onUnhide=function(){
        this._sendMessageTk({type:T_GDATA, tool:ID_TIT});
    };

    this.setSelectedText=function(_inText){
        if(this.selectedText!=_inText)
            this.isNewText = true;
        else
            this.isNewText = false;
        
        this.selectedText = _inText;
        const tab = this.getSelectedTab_();
        tab.tabObj.click();
    };
    
    this.getTranslate=function(){
        if(!this.isNewText){
            this.showContainer_(this._ID_TRANSLATE);
            return;
        }
        
        const setTranslateToElement=function(_inTxtTrt){
            const translatedText = eval(_inTxtTrt)[0][0][0];
            const originalText   = eval(_inTxtTrt)[0][0][1];

            const translateCtn   = this.getContainer_(this._ID_TRANSLATE);

            const originalElm    = translateCtn.ctnLink.children["trt-original"];
            const translatedElm  = translateCtn.ctnLink.children["trt-translated"];

            originalElm.innerHTML   = originalText;
            translatedElm.innerHTML = translatedText;
            this.showContainer_(translateCtn);
        }.bind(this);
        
        var url = "https://translate.googleapis.com/translate_a/single?client=gtx";
        url += "&sl="+this._LANG_FROM+"&tl="+this._LANG_TO+"&dt=t";
        url += "&q="+encodeURI(this.selectedText);

        this.ajaxApi.setCallback_(setTranslateToElement);
        this.ajaxApi.request_("GET", url);
        this.ajaxApi.sendReq_();
    };

    this.getSlang=function(){
        if(!this.isNewText){
            this.showContainer_(this._ID_SLANG);
            return;
        }

        const url = "https://www.urbandictionary.com/define.php?term="+encodeURI(this.selectedText);

        const setSlangToElement=function(_inTxtSlangHTML){        
            let tagInit = _inTxtSlangHTML.search('<div id="content">');
            let tagEnd  = _inTxtSlangHTML.search('<div class="large-4 columns show-for-large-up">');
            const content = _inTxtSlangHTML.substr(tagInit, tagEnd-tagInit);

            const ctnSlang= this.getContainer_(this._ID_SLANG);

            const removeLinks=function(_inHtml){
                let tmpHtml = _inHtml;

                tagInit = tmpHtml.search("<a");
                tagEnd  = tmpHtml.substr(tagInit, tmpHtml.length).search(">");

                tmpHtml = tmpHtml.replace(tmpHtml.substr(tagInit, tagEnd+1), "");
                tmpHtml = tmpHtml.replace("</a>", "");

                if(tmpHtml.search("<a") > 0)
                    return removeLinks(tmpHtml);
                else
                    return tmpHtml;
            }.bind(this);

            let divParser  = document.createElement("div");
            divParser.innerHTML = content;

            let divMeanings = document.createElement("div");
            divMeanings.style.overflowY = "scroll";
            divMeanings.style.overflowX = "hidden";
            divMeanings.style.maxHeight = "400px";

            const divsDefContent = divParser.getElementsByClassName("def-panel");

            for (var def of divsDefContent) {
                let meaning = def.getElementsByClassName("meaning")[0];
                meaning.innerHTML = removeLinks(meaning.outerHTML);
                divMeanings.appendChild(meaning);
            }

            if(divMeanings.outerHTML.length > 15)
                ctnSlang.ctnLink.innerHTML = "<div class='title'>" + this.selectedText.toUpperCase() + "</div>" + divMeanings.outerHTML;
            else 
                ctnSlang.ctnLink.innerHTML = "<div class='meaning'>No definitions!</div>";

            this.showContainer_(ctnSlang);
        }.bind(this);

        this.ajaxApi.setCallback_(setSlangToElement);
        this.ajaxApi.request_("GET", url);
        this.ajaxApi.sendReq_();
    };

    this.getDefinition=function(){
        if(!this.isNewText){
            this.showContainer_(this._ID_DEFINITION);
            return;
        }
        
        const url = "https://od-api.oxforddictionaries.com:443/api/v1/entries/en/"+encodeURI(this.selectedText).trim();

        const setDefinitionToElement=function(_inDefJson){
            var objDefinition = JSON.parse(_inDefJson);

            let ctnDefinition = this.getContainer_(this._ID_DEFINITION);

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

            ctnDefinition.ctnLink.innerHTML = "<div class='title'>" + this.selectedText.toUpperCase() + "</div>" + divMeanings.outerHTML;
            this.showContainer_(ctnDefinition);
        }.bind(this);

        this.ajaxApi.setCallback_(setDefinitionToElement);
        this.ajaxApi.request_("GET", url);

        /*
            Register free at oxforddictionaries.com and get your own. :)
            app_id: get after registration.
            app_key: get after registration.
        */
        this.ajaxApi.setParamHeader_({
            Accept: "application/json",
            app_id: "",
            app_key: ""
        });

        this.ajaxApi.sendReq_();
    };

};
TranslateIt.prototype = Object.create(Tool.prototype);

/**
 * Starting tool and calling elements;
 * The init call is on FrontEnd;
 * @instance FrontEnd Class
 */
ctxFront.initTool_(ID_TIT, new TranslateIt(new AjaxApi()));
ctxFront.getElements_(ID_TIT);
