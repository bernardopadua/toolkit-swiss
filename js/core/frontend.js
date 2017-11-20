/**
 * Class FrontEnd
 * This class is responsible for interact with ToolKit and initiate all elements of the tool invoked.
 * It only initiate the tool, after the initialization all actions is in the specific tool class.
 * @class
 * @param {ElementBuilder} _inElmBuilder 
 */
var FrontEnd = function(_inElmBuilder){
    this.init_(_inElmBuilder);
}

FrontEnd.prototype = {

    _tabId:null,
    _elementBuilder:null, //Handle for ElementBuilder
    _toolPool:[], //Pool of tools initialized in this tab
    _extensionURL:null,
    _IsToolKitInitialized:false,
    _types:null, //Types
    _tk_block:null, //Element->toolkit-parent

    /**
     * @constant
     * @default "tkblack-layer"
     */
    _ID_BLACKLAYER:"tkblack-layer",
    _ctnBlacklayer:null,

    /**
     * Class constructor.
     * @constructor
     * @param {ElementBuilder} _inElmBuilder
     */
    init_:function(_inElmBuilder){
        console.log("FrontEnd::init_");

        //ElementBuilder for dynamic html creation
        this._elementBuilder = _inElmBuilder;

        //Types
        this._types = new TkTypes();

        //Open channel
        this.openChannel_();

        //Establishing connection
        this.sendHandShake_();

        //Initializing ToolContainer
        this.initToolContainer_();
    },

    /**
     * Tool container initialization.
     */
    initToolContainer_:function(){
        this.sendMessage_({type:this._types["T_ELM"], file:"tkswiss"});
    },

    /**
     * Opens channel of communication with ToolKit
     */
    openChannel_:function(){
        chrome.runtime.onMessage.addListener(
            function(msg, sender, response){ 
                this.messageParser_(msg, sender, response); 
            }.bind(this)
        );
    },

    /**
     * Send message to ToolKit, general use
     */
    sendMessage_:function(type, callback=null){
        chrome.runtime.sendMessage(type,
            function(resp){
                if(resp!==undefined){
                    this.messageParser_(resp, null, callback);
                }
            }.bind(this)
        );
    },

    /**
     * Message parser function to listen all messages from toolkit
     * @param {Object} msg Message object,
     * @param {any} sender @default NULL
     * @param {any} response @default NULL
     */
    messageParser_:function(msg, sender=null, response=null){
        const t = this._types;
        
        if(msg!==undefined){
            switch (msg.type) {
                case t["T_OKHS"]:
                    this._tabId = msg.tabId;
                    this._extensionURL = msg.extensionURL;
                    break;
                case t["T_ASYW"]:
                    if(msg.tabId==this._tabId){
                        this.buildElementChain_(msg.data, msg.tool, msg.tool_data);
                    }
                    response({type:t["T_OKW"]});
                    break;
                case t["T_WAIT"]:
                    break;
                case t["T_UHIDE"]:
                    this.isToolBlackSupress_(msg.tool, "visible");
                    this._toolPool[msg.tool].ctx.unhideMe_(msg.data);
                    break;
                case t["T_RASST"]:
                    this._assets = JSON.parse(msg.data);
                    break;
                case t["T_REXEC"]:
                    this._toolPool[msg.tool].ctx.setSelectedText_(msg.return);
                    break;
                case t["T_RDATA"]:
                    this._toolPool[msg.tool].ctx.recData_(msg.data);
                    break;
                case t["T_RAVTL"]:
                    response(msg.tools);
                    break;
                default:
                    break;
            }
        } else {
            //Nothing;
        }
    },

    /**
     * Estabilish communication to future conversations;
     */
    sendHandShake_:function(){
        this.sendMessage_({type:this._types["T_CHKHS"]}, 
            function(tid){
                this.messageParser_(tid);
            }.bind(this)
        );
    },

    /**
     * After the handshake get all elements to inject on page. The context clicked is already known in ToolKit.
     * Since the ToolKit already know which context was clicked, it knows what elements to send.
     * This is called on the js of each tool throught the global {ctxFront};
     * @param {string} _inToolId Tool id to get elements
     */
    getElements_:function(_inToolId){
        this.sendMessage_({type:this._types["T_ELM"], file:_inToolId});
    },

    /**
     * Parse the json to html and then inject it on page/tab.
     * @param {Object~JSON} _inElement - JSON elements of tool
     * @param {string} _inTool - ID of tool
     * @param {(string|any)} _inDataTool - Data of tool context
     */
    buildElementChain_:function(_inElement, _inTool, _inDataTool){
        
        if(!this._IsToolKitInitialized){
            const vBody = document.getElementsByTagName("body")[0];

            this._elementBuilder.constructToolKitStructure_(_inElement);
            vBody.innerHTML = this._elementBuilder.buildHTML_() + vBody.innerHTML;
            this._tk_block = document.getElementById("toolkit-parent");

            this._IsToolKitInitialized = true;
        } else {
            this._elementBuilder.constructWindowElements_(_inElement, _inTool, this._extensionURL);
            //this._tk_block.innerHTML += this._elementBuilder.buildHTML_(null, true);
            this._tk_block.insertAdjacentHTML("beforeend", this._elementBuilder.buildHTML_(null, true));
            this.addBlackLayerEvent_(); //Every time the HTML is modified, blacklayer lost event.
        }
        
        //Calling the tool constructor.
        if(this._toolPool[_inTool]!==undefined){
            this._toolPool[_inTool].ctx._extensionURL = this._extensionURL;
            this._toolPool[_inTool].ctx.init();
            this._toolPool[_inTool].ctx.getBlackLayer_ = this.getBlackLayer_.bind(this);
            this.isToolBlackSupress_(_inTool, "visible");            
        }

    },

    /**
     * Check if tool is supressing black-layer;
     * @param {string} _inTool tool-id
     * @param {string} _inHideVisible Two options "visible" | "hidden"
     */
    isToolBlackSupress_:function(_inTool, _inHideVisible){
        const tool = this._toolPool[_inTool].ctx;    
        if(!tool._isSupressingBlack)
            this._ctnBlacklayer.style.visibility = _inHideVisible;
    },

    /**
     * Get black layer container
     * Tool Class is using it to hide the element.
     */
    getBlackLayer_:function(){
        return this._ctnBlacklayer;
    },

    /**
     * Add event to black layer everytime a new tool is created;
     */
    addBlackLayerEvent_:function(){
        this._ctnBlacklayer = this._tk_block.children[this._ID_BLACKLAYER];
        this._ctnBlacklayer.addEventListener("click", this.blackLayerClick_.bind(this), true);
    },

    /**
     * Blacklayer-click to hide opened tools.
     * If there are more than one tool opened it closes all of them.
     * @param {event} e event parameter (Click)
     */
    blackLayerClick_:function(e){
        const self = this;

        const toolsHide = new Promise(function(rs, rj){
            const responseTools = function(_inTools){
                rs(_inTools);
            }

            self.sendMessage_({type: self._types["T_GAVTL"]}, responseTools);
        });
        
        toolsHide.then(function(_inData){
            _inData.forEach(function(e,i,a){
                self._toolPool[e].ctx.hideMe_();
            });
        });

        e.target.style.visibility = "hidden"; //Hide blacklayer
    },

    /**
     * Initializes the tool;
     * @exports Tool class uses global ctxFront var to call this function to initilize the tool
     */    
    initTool_:function(_inToolId, _inToolObj){
        this._toolPool[_inToolId] = {
            ctx: _inToolObj
        };
        this._toolPool[_inToolId].ctx.setSendMessageTk_(this.sendMessage_.bind(this));
    }
};

/**
 * Gloval var of FrontEnd instance
 * @global @instance
 */
var ctxFront = new FrontEnd(new ElementBuilder());