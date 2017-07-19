/**
 * @class NetStorage
 * This class is responsible for get elements from extesion storage.
 * For now it's just used to get ./elements/*.json to inject on tabs.
 */
var NetStorage = function(){
    this.init_();
};

NetStorage.prototype = {
    _ctx:null,
    _callBackFunc:null,

    init_:function(){
        this._ctx = new XMLHttpRequest();
    },

    setCallback_:function(_inCallbackFunc){
        this._callBackFunc = _inCallbackFunc;
    },

    getFromUrl_:function(url, type){
        //console.log("NetStorage::getFromUrl");
        this._ctx.onreadystatechange = this._callBackFunc;
        this._ctx.open(type, url, true);
        this._ctx.send();
    }
};
    
/**
 * @class ToolKit;
 * This class is responsible as a server to all requests from tabs.
 * It handles all menu contexts.
 */
var ToolKit = function(netstorage){
    this.init_(netstorage);
};

ToolKit.prototype = {

    _tabPool:[], //Pool of tabs opened
    _netStorage:null, //Handle for NetStorage~
    _blabla:null,
    _assets:{},

    _lastIdElements:null, //Id from last tool requested (Used for get the right elements)

    /**
     * Class constructor;
     * @param {NetStorage} netstorage NetStorage instance; Class is on Top of the code;
     * @constructor
     */
    init_:function(netstorage){
        //Get class NetStorage (Responsible for get elements .json)
        this._netStorage = netstorage;
        
        //Loading assets
        this.loadAssets_();

        //Open channel
        this.openChannel_();

        //Tab events. F5 or Closing.
        this.setTabEvents_();

        //Creating contexts
        this.toolContextCreate_();
    },

    /**
     * Context menus created;
     */
    toolContextCreate_:function(){
        //TranslateIt
        this.createContextM_(ID_TIT, T_SEL, "TranslateIt", this.translateEvt_);

        //ToolKitSwiss Parent Context
        this.createContextM_(ID_TKS, T_PAGE, "ToolKit Swiss", null);

        //Hex converter
        this.createContextM_(ID_HEX, T_PAGE, "HexConverter", this.hexConverterEvt_, ID_TKS);

        //Code highlighter
        this.createContextM_(ID_COD, T_PAGE, "Code Highlighter", this.codeHighlightEvt_, ID_TKS);

        //Base 64 Encode-Decode
        this.createContextM_(ID_B64, T_PAGE, "Base64 Encode-Decode", this.base64EncodeDecodeEvt_, ID_TKS);
    },

    /**
     * Event tabs; Controlling refresh and tab closes.
     */
    setTabEvents_:function(){
        //F5
        chrome.tabs.onUpdated.addListener(this.tabUpdateClose_.bind(this));

        //Closing
        chrome.tabs.onRemoved.addListener(this.tabUpdateClose_.bind(this));
    },

    /**
     * Remove tools on update and closing;
     * Freeing memory;
     */
    tabUpdateClose_:function(tId, changInfo, tab){
        //console.log("updatingORclosing_tab;");
        if(this._tabPool[tId]!==undefined){
            var tabIdx = this._tabPool.indexOf(tId);
            this._tabPool.splice(tabIdx, 1);
        }
    },

    /**
     * Open channel for communications with ToolKit Class
     */
    openChannel_:function(){
        chrome.runtime.onMessage.addListener(
            function(msg, sender, response){
                this.messageParser_(msg, sender, response);
            }.bind(this)
        );
    },

    /**
     * Send message to tabs;
     * @param {Object} msg Object with type and message;
     * @param {numer} id Tab id;
     */
    sendMessage_:function(msg, id){
        chrome.tabs.sendMessage(id, msg, function(resp){
            if(resp!==undefined){
                this.messageParser_(resp);
            }
        }.bind(this));
    },  

    /**
     * Message parser to the incoming connection;
     * @param {Object} message Object with message from tab.
     * @param {Object} sender Tab sender.
     * @param @callback respCallback Function callback.
     */
    messageParser_:function(message, sender=null, respCallback=null){
        switch (message.type) {
            case T_OKW:
                //console.log("OKWait");
                break;
            case T_CHKHS: /*HandShake from tab tool*/
                respCallback({type:T_OKHS, tabId:sender.tab.id});
                break;
            case T_ELM: /*Tab asking for tool elements to inject*/
                this.getElmFromStorage_(sender.tab.id, message.toolId);
                respCallback({type:T_WAIT});
                break;
            case T_GASST:
                respCallback({type:T_RASST, data:JSON.stringify(this._assets)});
                break;
            case T_GDATA:
                this.sendMessage_({type:T_RDATA, tool:message.tool, data:this._tabPool[sender.tab.id].tools[message.tool].data}, sender.tab.id);
                break;
            case T_EXEC:
                const tabId = sender.tab.id;
                const sMessage = this.sendMessage_;
                this.execDynamicScript_(tabId, message.script, function(tId, res){
                    sMessage({tab:tabId, type:T_REXEC, tool:message.tool, return:res},tId);
                }.bind(sMessage, tabId));
                break;
            case T_HIDE:
                this._tabPool[sender.tab.id].tools[message.tool].hide = true;
                break;
        }
    },

    /**
     * Load assets;
     */
    loadAssets_:function(){
        this._netStorage.setCallback_(this.callBackAssets_.bind(this));
        this._netStorage.getFromUrl_(
            chrome.runtime.getURL("elements/assetlist.json"),
            "GET"
        );
    },

    /**
     * Callback for loaded asstes;
     * @callback loadAssets
     */
    callBackAssets_:function(){
        if(this._netStorage._ctx.readyState==4){
            var assets = JSON.parse(this._netStorage._ctx.responseText).assets;
            assets.forEach(function(itm,idx){
                this._assets[itm.asset] = chrome.runtime.getURL(itm.url);
            }.bind(this));
        }
    },

    /**
     * Create context menus;
     * @param {string} id Id of context; types.js;
     * @param {string} type Type of context from Google Menu Context; types.js;
     * @param {string} title Title for the context;
     * @param @callback evntCallback Function called on context menu click;
     * @param {string} parentId Optional parameter. Item inside another context;
     */
    createContextM_:function(id, type, title, evntCallback, parentId=null){
        chrome.contextMenus.create({
            "id": id,
            "title": title,
            "contexts":[type],
            "parentId": (parentId!==null ? parentId : null),
            "onclick": (evntCallback!==null ? evntCallback.bind(this) : null)},
            function(){
                //console.log(chrome.runtime.lastError);
            }
        );
    },

    /**
     * Default object properties when initializing new tab-tools.
     * @param {number} _inTabId Tab id;
     */
    newTabTool_:function(_inTabId){
        if(this._tabPool[_inTabId]===undefined){
            this._tabPool[_inTabId] = {
                initialized:true,
                tabId:_inTabId,
                frontendInit:false,
                data:"",
                tools:[]
            };
            return true;
        }
        return false;
    },

    /**
     * Check if the tool already been created
     * @param {number} _inTabId Tab id;
     * @param {string} _inToolId Tool id; types.js;
     */
    checkTool_:function(_inTabId, _inToolId){
        if(this._tabPool[_inTabId]===undefined)
            return false;
        
        if(this._tabPool[_inTabId].tools[_inToolId]===undefined)
            return false;
        
        return true;
    },

    /**
     * Initializing new tool request
     * @param {number} _inTabId Tab id;
     * @param {string} _inToolId Tool id; types.js;
     */
    newTool_:function(_inTabId, _inIdTool){
        this._tabPool[_inTabId].tools[_inIdTool] = {
            initialized:true,
            hide:false,
            data:"null"
        }
    },

    /**
     * Function that initializes the tool
     * @param {number} _inTabId Tab id;
     * @param {string} _inToolId Tool id; types.js;
     */
    initializeTool_:function(_inTab, _inIdTool){
        //Initializing TOOL
        this.newTabTool_(_inTab.id)
        this.newTool_(_inTab.id, _inIdTool);
    },
    
    /**
     * Get script chain to inject on page
     * @param {number} _inTabId Tab id;
     * @param {string} _inToolJs Tool id; types.js;
     * 
     * @return {JsonObject}: Object with all scriptss to inject
     */
    getScriptChainTool_:function(_inTabId, _inToolJs){

        if(!this._tabPool[_inTabId].frontendInit){
            this._tabPool[_inTabId].frontendInit = true;
            return scriptChainObj = {
                    file:"js/types.js", type:"js", 
                        next:{file:"css/css.css", type:"css", 
                            next:{file:"js/ajax.js", type:"js",
                                next:{file:"js/elementbuilder.js", type:"js",
                                    next:{file:"js/tools/tool.js", type:"js",
                                        next:{file:"js/frontend.js", type:"js",
                                            next:{file:"js/tools/"+_inToolJs+".js", type:"js"
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
        } else {
            return {
                file:"js/tools/"+_inToolJs+".js",
                type: "js"
            };
        }
    },
    
    //
    // TOOL EVENTS -------------
    //
    
    /**
     * Function event for click in Base64 Encode-Decode tool;
     * @implements chrome.contextMenus.onClicked
     */
    base64EncodeDecodeEvt_:function(info, tab){
        if(!this.checkTool_(tab.id, ID_B64)){
            //Initializing TOOL
            this.initializeTool_(tab, ID_B64);

            this.execScriptChain_(tab.id, this.getScriptChainTool_(tab.id, ID_B64));
        } else {
            this.sendMessage_({type:T_UHIDE, tool:ID_B64}, tab.id);
        }
    },
    
    /**
     * Function event for click in Code Highlint option on tool menu
     * @implements chrome.contextMenus.onClicked
     */
    codeHighlightEvt_:function(info, tab){
        if(!this.checkTool_(tab.id, ID_COD)){
            //Initializing TOOL
            this.initializeTool_(tab, ID_COD);

            this.execScriptChain_(tab.id, this.getScriptChainTool_(tab.id, ID_COD));
        } else {
            this.sendMessage_({type:T_UHIDE, tool:ID_COD}, tab.id);
        }
    },

    /**
     * Function event for click on HexConverter
     * @implements chrome.contextMenus.onClicked
     */
    hexConverterEvt_:function(info, tab){        
        if(!this.checkTool_(tab.id, ID_HEX)){
            //Initializing TOOL
            this.initializeTool_(tab, ID_HEX);
            
            this._tabPool[tab.id].tools[ID_HEX].data = "";

            this.execScriptChain_(tab.id, this.getScriptChainTool_(tab.id, "hexconverter"));
        } else {
            this.sendMessage_({type:T_UHIDE, tool:ID_HEX}, tab.id);
        }
    },

    /**
     * Function event for click on TranslateIt (Tool)
     * @implements chrome.contextMenus.onClicked
     */
    translateEvt_:function(info, tab){
        if(!this.checkTool_(tab.id, ID_TIT)){
            //Initializing TOOL
            this.initializeTool_(tab, ID_TIT);

            this._tabPool[tab.id].tools[ID_TIT].data = "";

            //Couldn't find way to not duplicate it.
            this.execDynamicScript_(tab.id, "window.getSelection().toString();", 
                function(data){ 
                    this._tabPool[tab.id].tools[ID_TIT].data = data[0];

                    this.execScriptChain_(tab.id, this.getScriptChainTool_(tab.id, "translateit"));
                }.bind(this)
            );
        } else {
            //Couldn't find way to not duplicate it.
            this.execDynamicScript_(tab.id, "window.getSelection().toString();", 
                function(data){ 
                    var dataTool = this._tabPool[tab.id].tools[ID_TIT];
                    dataTool.data = data[0];
                    this.sendMessage_({type:T_UHIDE, tool:ID_TIT, data:dataTool.data}, tab.id);
                }.bind(this)
            );
        }
    },

    /**
     * Getting elementchain from elements/translateit.json
     * @param {number} tid Tab Id;
     * @param {string} elmId Id of the tool to get the JSON file;
     */
    getElmFromStorage_:function(tid, elmId){
        var url = chrome.runtime.getURL;

        this._netStorage.setCallback_(this.callBackForElements_.bind(this, tid, elmId));
        this._netStorage.getFromUrl_(
            url("elements/"+elmId+".json"), 
            "GET"
        ); //Find way to improve it
    },

    /**
     * Execute dynamic script on tab;
     * @param {integer} _inTabId Tab id;
     * @param {string} _inScript String script;
     * @param @callback _inFunc Callback function after script execution;
     */
    execDynamicScript_:function(_inTabId, _inScript, _inFunc){
        chrome.tabs.executeScript(_inTabId, {code:_inScript}, _inFunc);
    },

    /**
     * Callback function from function that gets elements from \elements\ 
     * @param {number} _inTabId Tab id;
     * @param {string} _inToolId Tool id; types.js;
     */
    callBackForElements_:function(_inTabId, _inToolId){
        if(this._netStorage._ctx.readyState==4){
            const dataTool = (this._tabPool[_inTabId].tools[_inToolId].data!==undefined) ? this._tabPool[_inTabId].tools[_inToolId].data : "";
            
            this.sendMessage_(
                {
                    type:T_ASYW, /*Type of message*/
                    tabId:_inTabId, /*Tab ID*/
                    data:this._netStorage._ctx.responseText, /*JSON from elementchain*/
                    tool:_inToolId, /*ID of tool*/
                    tool_data: dataTool/*Data from tool. e. g. selected text from translateit*/
                },
                _inTabId
            );
        }
    },

    /**
     * Inject scripts on tab that fires the context event
     * @param {TabId}: Id of tab;
     * @param {Object~ScriptChain}: Object with all the files to inject
     */
    execScriptChain_:function(tabId, sChain){
        extendedChain = function(){
            if(sChain.next!==undefined){
                this.execScriptChain_(tabId, sChain.next);
            }
        };

        if(sChain.type == "js"){
            chrome.tabs.executeScript(tabId, {file:sChain.file}, extendedChain.bind(this, sChain, tabId));
        } else {
            chrome.tabs.insertCSS(tabId, {file:sChain.file}, extendedChain.bind(this, sChain, tabId));
        }
    }
};

var ctxTk = new ToolKit(new NetStorage());