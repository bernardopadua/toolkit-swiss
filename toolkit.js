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
    _extensionURL:null,
    _types:null, //Types
    _toolsSpecs:[], //Loaded tools specifications

    /**
     * Class constructor;
     * @param {NetStorage} netstorage NetStorage instance; Class is on Top of the code;
     * @constructor
     */
    init_:function(netstorage){
        //Get class NetStorage (Responsible for get elements .json)
        this._netStorage = netstorage;
        
        //Initializing Types
        this._types = new TkTypes();

        //Setting the extension URL
        this.setExtensionURL_();

        //Open channel
        this.openChannel_();

        //Tab events. F5 or Closing.
        this.setTabEvents_();

        //Loading tools specifications
        this.loadToolsSpec_();
    },

    /**
     * Loading the config file for toolkit.
     * All items of menu context should be there.
     */
    loadToolsSpec_:function(){
        this._netStorage.setCallback_(this.finishInit_.bind(this));
        this._netStorage.getFromUrl_(
            this._extensionURL+"elements/config.json",
            "GET"
        );
    },

    /**
     * Finishing initialization of ToolKit.
     * Needed two functions since the config.json loading is asynchronous.
     */
    finishInit_:function(){
        if(this._netStorage._ctx.readyState==4){
            const specs = JSON.parse(this._netStorage._ctx.responseText);
            
            specs["tkswiss"]["tools"].forEach(tool => {
                if(specs["tkswiss"]["specs"][tool]===undefined){
                    console.log("ToolkitSwiss::Error Loading Tools [config.json]");
                    return;
                }
                
                const tspec = specs["tkswiss"]["specs"];
                this._toolsSpecs.push([tspec[tool].id, tspec[tool].type, tspec[tool].title, tspec[tool].root]);
            });

            //Creating contexts
            this.toolContextCreate_();
        }
    },

    setExtensionURL_:function(){
        this._extensionURL = chrome.runtime.getURL("");
    },

    /**
     * Menu context creation function
     */
    toolContextCreate_:function(){
        this._toolsSpecs.forEach(element => {
            this.createContextM_(element[0], element[1], element[2], element[3]);
        });

        //Listener to open all contextMenus
        chrome.contextMenus.onClicked.addListener(this.contexteEventListener_.bind(this));
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
        const t = this._types;
        
        switch (message.type) {
            case t["T_OKW"]:
                //console.log("OKWait");
                break;
            case t["T_CHKHS"]: /*HandShake from tab tool*/
                respCallback({type:t["T_OKHS"], tabId:sender.tab.id, extensionURL:this._extensionURL});
                break;
            case t["T_ELM"]: /*Tab asking for tool elements to inject*/
                this.getElmFromStorage_(sender.tab.id, message.file);
                respCallback({type:t["T_WAIT"]});
                break;
            case t["T_GASST"]:
                //respCallback({type:T_RASST, data:JSON.stringify(this._assets)});
                break;
            case t["T_GDATA"]:
                this.sendMessage_({type:t["T_RDATA"], tool:message.tool, data:this._tabPool[sender.tab.id].tools[message.tool].data}, sender.tab.id);
                break;
            case t["T_EXEC"]:
                const tabId = sender.tab.id;
                const sMessage = this.sendMessage_;
                this.execDynamicScript_(tabId, message.script, function(tId, res){
                    sMessage({tab:tabId, type:t["T_REXEC"], tool:message.tool, return:res},tId);
                }.bind(sMessage, tabId));
                break;
            case t["T_HIDE"]:
                this._tabPool[sender.tab.id].tools[message.tool].hide = true;
                break;
            case t["T_GAVTL"]:
                const tools = this.getOpenedWindows_(sender.tab.id);
                respCallback({type: t["T_RAVTL"], tools: tools});
                break;
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
    createContextM_:function(id, type, title, parentId=null){
        chrome.contextMenus.create({
            "id": id,
            "title": title,
            "contexts":[type],
            "parentId": (parentId!==null ? parentId : null)},
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
                    file:"js/core/types.js", type:"js", 
                        next:{file:"css/css.css", type:"css", 
                            next:{file:"js/core/ajax.js", type:"js",
                                next:{file:"js/core/elementbuilder.js", type:"js",
                                    next:{file:"js/tools/tool.js", type:"js",
                                        next:{file:"js/core/frontend.js", type:"js",
                                            next:{file:"js/tools/"+_inToolJs+"/"+_inToolJs+".js", type:"js"
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
        } else {
            return {
                file:"js/tools/"+_inToolJs+"/"+_inToolJs+".js",
                type: "js"
            };
        }
    },

    /**
     * Listener for context menus;
     * @param {object} info Info about clicked context
     * @param {object} tab Tab origin of the event
     */
    contexteEventListener_:function(info, tab){
        const IDMENU = info.menuItemId;
        if(!this.checkTool_(tab.id, IDMENU)){
            //Initializing TOOL
            this.initializeTool_(tab, IDMENU);

            if(info.selectionText !== undefined){
                this._tabPool[tab.id].tools[IDMENU].data = info.selectionText;
            }

            this.execScriptChain_(tab.id, this.getScriptChainTool_(tab.id, IDMENU));
        } else {

            if(info.selectionText !== undefined){
                this._tabPool[tab.id].tools[IDMENU].data = info.selectionText;
            }

            this._tabPool[tab.id].tools[IDMENU].hide = false;

            this.sendMessage_({type:this._types["T_UHIDE"], tool:IDMENU}, tab.id);
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
            url("js/tools/"+elmId+"/"+elmId+".json"), 
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
            const dataTool = (this._tabPool[_inTabId].tools[_inToolId]!==undefined) ? this._tabPool[_inTabId].tools[_inToolId].data : "";

                this.sendMessage_(
                {
                    type:this._types["T_ASYW"], /*Type of message*/
                    tabId:_inTabId, /*Tab ID*/
                    data:this._netStorage._ctx.responseText, /*JSON from elementchain*/
                    tool:_inToolId, /*ID of tool*/
                    tool_data:dataTool/*Data from tool. e. g. selected text from translateit*/
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
    },

    /**
     * Tools opened in the screen.
     */
    getOpenedWindows_:function(_inTabId){
        let tools = [];
        for(tl in this._tabPool[_inTabId].tools){
            if(!this._tabPool[_inTabId].tools[tl].hide)
                tools.push(tl);
        }

        return tools;
    }
};

var ctxTk = new ToolKit(new NetStorage());