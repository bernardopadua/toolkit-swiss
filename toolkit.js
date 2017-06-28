/*
    class NetStorage
    This class is responsible for get elements from extesion storage.
    For now it's just used to get \elements\ .json to inject on tabs.
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

/*
    class ToolKit;
    This class is responsible as a server to all requests from tabs.
    It handles all menu contexts.
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

    //All tool contexts creating
    toolContextCreate_:function(){
        //TranslateIt
        this.createContextM_(ID_TIT, T_SEL, "TranslateIt", this.translateEvt_);

        //ToolKitSwiss Parent Context
        this.createContextM_(ID_TKS, T_PAGE, "ToolKit Swiss", null);

        //Hex converter
        this.createContextM_(ID_HEX, T_PAGE, "HexConverter", this.hexConverterEvt_, ID_TKS);
    },

    //Setting events for tab.
    setTabEvents_:function(){
        //F5
        chrome.tabs.onUpdated.addListener(this.tabUpdateClose_.bind(this));

        //Closing
        chrome.tabs.onRemoved.addListener(this.tabUpdateClose_.bind(this));
    },
    tabUpdateClose_:function(tId, changInfo, tab){
        //console.log("updatingORclosing_tab;");
        if(this._tabPool[tId]!==undefined){
            var tabIdx = this._tabPool.indexOf(tId);
            this._tabPool.splice(tabIdx, 1);
        }
    },

    //Open channel for communications with ToolKit Class
    openChannel_:function(){
        chrome.runtime.onMessage.addListener(
            function(msg, sender, response){
                this.messageParser_(msg, sender, response);
            }.bind(this)
        );
    },

    //Send message to tab/tool
    sendMessage_:function(msg, id){
        chrome.tabs.sendMessage(id, msg, function(resp){
            if(resp!==undefined){
                this.messageParser_(resp);
            }
        }.bind(this));
    },  

    //Messages from tabs: Parser messages
    messageParser_:function(message, sender=null, respCallback=null){
        switch (message.type) {
            case T_OKW:
                //console.log("OKWait");
                break;
            case T_CHKHS: /*HandShake from tab tool*/
                respCallback({type:T_OKHS, tabId:sender.tab.id});
                break;
            case T_ELM: /*Tab asking for tool elements to inject*/
                this.getElmFromStorage_(sender.tab.id, this._lastIdElements);
                respCallback({type:T_WAIT});
                break;
            case T_GASST:
                respCallback({type:T_RASST, data:JSON.stringify(this._assets)});
                break;
            case T_HIDE:
                this._tabPool[sender.tab.id].tools[message.tool].hide = true;
                break;
        }
    },

    //Loading assets 
    loadAssets_:function(){
        this._netStorage.setCallback_(this.callBackAssets_.bind(this));
        this._netStorage.getFromUrl_(
            chrome.runtime.getURL("elements/assetlist.json"),
            "GET"
        );
    },
    callBackAssets_:function(){
        if(this._netStorage._ctx.readyState==4){
            var assets = JSON.parse(this._netStorage._ctx.responseText).assets;
            assets.forEach(function(itm,idx){
                this._assets[itm.asset] = chrome.runtime.getURL(itm.url);
            }.bind(this));
        }
    },

    //Functiont create context menu to call tools
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

    //Default object properties when initializing new tab-tools.
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
    //Check if the tool already been created
    checkTool_:function(_inTabId, _inToolId){
        if(this._tabPool[_inTabId]===undefined)
            return false;
        
        if(this._tabPool[_inTabId].tools[_inToolId]===undefined)
            return false;
        
        return true;
    },
    //Initializing new tool request
    newTool_:function(_inTabId, _inIdTool){
        this._tabPool[_inTabId].tools[_inIdTool] = {
            initialized:true,
            hide:false,
            data:"null"
        }
    },
    //Initilizes any tool
    initializeTool_:function(_inTab, _inIdTool){
        //Initializing TOOL
        this.newTabTool_(_inTab.id)
        this.newTool_(_inTab.id, _inIdTool);
    },
    getScriptChainTool_:function(_inTabId, _inToolJs){

        if(!this._tabPool[_inTabId].frontendInit){
            this._tabPool[_inTabId].frontendInit = true;
            return scriptChainObj = {
                    file:"js/types.js", type:"js", 
                        next:{file:"css/css.css", type:"css", 
                            next:{file:"js/ajax.js", type:"js",
                                next:{file:"js/elementbuilder.js", type:"js",
                                    next:{file:"js/frontend.js", type:"js",
                                        next:{file:"js/tools/"+_inToolJs+".js", type:"js"
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

    //Function event for click on HexConverter
    hexConverterEvt_:function(info, tab){        
        if(!this.checkTool_(tab.id, ID_HEX)){
            //Initializing TOOL
            this.initializeTool_(tab, ID_HEX);
            
            this._tabPool[tab.id].tools[ID_HEX].data = "";

            this._lastIdElements = ID_HEX;
            this.execScriptChain_(tab.id, this.getScriptChainTool_(tab.id, "hexconverter"));
        } else {
            this.sendMessage_({type:T_UHIDE, tool:ID_HEX}, tab.id);
        }
    },

    //Function event for click on TranslateIt (Tool)
    translateEvt_:function(info, tab){
        if(!this.checkTool_(tab.id, ID_TIT)){
            //Initializing TOOL
            this.initializeTool_(tab, ID_TIT);

            this._tabPool[tab.id].tools[ID_TIT].data = "";

            //Couldn't find way to not duplicate it.
            this.execDynamicScript_(tab.id, "window.getSelection().toString();", 
                function(data){ 
                    this._tabPool[tab.id].tools[ID_TIT].data = data[0];

                    //Recording id of tool to send the right elements.
                    this._lastIdElements = ID_TIT;
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

    //Getting elementchain from elements/translateit.json
    getElmFromStorage_:function(tid, elmId){
        var url = chrome.runtime.getURL;

        this._netStorage.setCallback_(this.callBackForElements_.bind(this, tid));
        this._netStorage.getFromUrl_(
            url("elements/"+elmId+".json"), 
            "GET"
        ); //Find way to improve it
    },

    //Exec some dynamic script on tab.
    execDynamicScript_:function(_inTabId, _inScript, _inFunc){
        chrome.tabs.executeScript(_inTabId, {code:_inScript}, _inFunc);
    },

    //Callback function from function that gets elements from \elements\ 
    // tid: Tab id requested the elements;
    callBackForElements_:function(tid){
        if(this._netStorage._ctx.readyState==4){
            this.sendMessage_(
                {
                    type:T_ASYW, /*Type of message*/
                    tabId:tid, /*Tab ID*/
                    data:this._netStorage._ctx.responseText, /*JSON from elementchain*/
                    tool:this._lastIdElements, /*ID of tool*/
                    tool_data:this._tabPool[tid].tools[this._lastIdElements].data /*Data from tool. e. g. selected text from translateit*/
                },
                tid
            );
            this._lastIdElements = null; //Clean context clicked.
        }
    },

    //Inject scripts on tab that fires the context event
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
