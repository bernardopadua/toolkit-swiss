/**
 * Class FrontEnd
 * This class is responsible for interact with ToolKit and initiate all elements for determined(clicked)
 * context. It only initiate the tool, after the initialization all actions is in the specific tool class.
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
    _assets:null,

    /**
     * Class constructor.
     * @constructor
     * @param {ElementBuilder} _inElmBuilder
     */
    init_:function(_inElmBuilder){
        //console.log("INIT::FrontEnd");

        //ElementBuilder for dynamic html creation
        this._elementBuilder = _inElmBuilder;

        //Open channel
        this.openChannel_();

        //Get assets
        this.getAssets_();

        //Establishing connection
        this.sendHandShake_();
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
                    this.messageParser_(resp);
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
        if(msg!==undefined){
            switch (msg.type) {
                case T_OKHS:
                    this._tabId = msg.tabId;
                    break;
                case T_ASYW:
                    if(msg.tabId==this._tabId){
                        this.buildElementChain_(msg.data, msg.tool, msg.tool_data);
                    }
                    response({type:T_OKW});
                case T_WAIT:
                    break;
                case T_UHIDE:
                    this._toolPool[msg.tool].ctx.unhideMe_(msg.data);
                    break;
                case T_RASST:
                    this._assets = JSON.parse(msg.data);
                    break;
                case T_REXEC:
                    this._toolPool[msg.tool].ctx.setSelectedText_(msg.return);
                    break;
                case T_RDATA:
                    this._toolPool[msg.tool].ctx.recData_(msg.data);
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
        this.sendMessage_({type:T_CHKHS}, 
            function(tid){
                this.messageParser_(tid);
            }.bind(this)
        );
    },

    /**
     * Get asset list to change after the elementbuilder work it on json;
     */
    getAssets_:function(){
        this.sendMessage_({type:T_GASST});
    },

    /**
     * After the handshake get all elements to inject on page. The context clicked is already known in ToolKit.
     * Since the ToolKit already know which context was clicked, it knows what elements to send.
     * This is called on the js of each tool throught the global {ctxFront};
     * @param {string} _inToolId Tool id to get elements
     */
    getElements_:function(_inToolId){
        this.sendMessage_({type:T_ELM, toolId:_inToolId});
    },

    /**
     * Parse the json to html and then inject it on page/tab.
     * @param {Object~JSON} _inElement - JSON elements of tool
     * @param {string} _inTool - ID of tool
     * @param {(string|any)} _inDataTool - Data of tool context
     */
    buildElementChain_:function(_inElement, _inTool, _inDataTool){

        if(this._elementBuilder.parseElement_(_inElement)){
            if(document.getElementById("toolkit-parent")===null)
                document.getElementsByTagName("body")[0].innerHTML = this._elementBuilder._outerHTML + document.getElementsByTagName("body")[0].innerHTML;
            else {
                var extractToolBlock = document.createElement("div");
                extractToolBlock.innerHTML = this._elementBuilder._outerHTML;
                extractToolBlock = extractToolBlock.getElementsByClassName("toolkit-block")[0];
                document.getElementById("toolkit-parent").appendChild(extractToolBlock);
            }

            
            this.parseAssets_();
        }
        //Calling the tool constructor.
        this._toolPool[_inTool].ctx.init();
    },

    /**
     * Parse the asset loaded;
     * If the injected html requires changes for assests this function do it;
     */
    parseAssets_:function(){
        var assetElements = document.getElementById(ELM_TIT).getElementsByClassName("asset_load");
        if(assetElements.length>0){
            for(var itm of assetElements){
                //Check element type.
                switch (itm.tagName) {
                    case "IMG":
                        var idAsset = itm.getAttribute("src");
                        itm.setAttribute("src", this._assets[idAsset]);       
                        break;
                    default:
                        //console.log("parseAssets::Type->noIMG");
                        break;
                }
            }
        }
    },

    /**
     * Initializes the tool;
     * @exports Tool Used in each class through the global ctxFront
     * to initializes the tool;
     */    
    initTool_:function(_inToolId, _inToolObj){
        this._toolPool[_inToolId] = {
            ctx: _inToolObj
        };
        this._toolPool[_inToolId].ctx.setSendMessageTk_(this.sendMessage_);
    }
};

/**
 * Gloval var of FrontEnd instance
 * @global @instance
 */
var ctxFront = new FrontEnd(new ElementBuilder());