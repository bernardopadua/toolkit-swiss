/*
    Class FrontEnd
    This class is responsible for interact with ToolKit and initiate all elements for determined(clicked)
    context. It only initiate the tool, after the initialization all actions is in the specific tool class.

    _inElement: Instance of elementbuilder class;
*/
var FrontEnd = function(_inElmBuilder){
    this.init_(_inElmBuilder);
}

FrontEnd.prototype = {

    _tabId:null,
    _elementBuilder:null, //Handle for ElementBuilder
    _toolPool:[], //Pool of tools initialized in this tab
    _assets:null,

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

    //Opens channel of communication with ToolKit
    openChannel_:function(){
        chrome.runtime.onMessage.addListener(
            function(msg, sender, response){ 
                this.messageParser_(msg, sender, response); 
            }.bind(this)
        );
    },
    //Send message to ToolKit, general use
    sendMessage_:function(type, callback=null){
        chrome.runtime.sendMessage(type,
            function(resp){
                if(resp!==undefined){
                    this.messageParser_(resp);
                }
            }.bind(this)
        );
    },
    //Message parser function to listen all messages from toolkit
    messageParser_:function(msg, sender=null, response=null){
        if(msg!==undefined){
            switch (msg.type) {
                case T_OKHS:
                    this._tabId = msg.tabId;
                    //Ready to message ToolKit
                    this.connectionReady_();
                    break;
                case T_ASYW:
                    if(msg.tabId==this._tabId){
                        this.buildElementChain_(msg.data, msg.tool, msg.tool_data);
                    }
                    response({type:T_OKW});
                case T_WAIT:
                    //Waiting toolkit get the json elements. // Async method, then we wait for T_ASYW;
                    //console.log("FrontEnd::getElements->Sent::T_ELM <-> Recv::T_WAIT");
                    break;
                case T_UHIDE:
                    this._toolPool[msg.tool].ctx.unhideMe_(msg.data);
                    break;
                case T_RASST:
                    this._assets = JSON.parse(msg.data);
                    break;
                default:
                    //console.log("FrontEnd::messageParser->[ERROR] Parsing message type.");
                    break;
            }
        } else {
            //console.log("FrontEnd::messageParser->[ERROR] Nothing to parse.");
        }
    },

    //Estabilish communication to future conversations
    sendHandShake_:function(){
        this.sendMessage_({type:T_CHKHS}, 
            function(tid){
                this.messageParser_(tid);
            }.bind(this)
        );
    },

    //All messages and functions must be in here. After handshake.
    connectionReady_:function(){
        //Calls to ToolKit here//
        //console.log('FrontEnd::ToolKit->readyState');

        //Get elements from last context called
        //this.getElements_();
    },

    //Get asset list to change after the elementbuilder work it on json;
    getAssets_:function(){
        this.sendMessage_({type:T_GASST});
    },

    //After the handshake get all elements to inject on page. The context clicked is already known in ToolKit.
    //Since the ToolKit already know which context was clicked, it knows what elements to send.
    getElements_:function(){
        this.sendMessage_({type:T_ELM});
    },

    //Parse the json to html and then inject it on page/tab.
    buildElementChain_:function(_inElement, _inTool, _inDataTool){

        if(this._elementBuilder.parseElement_(_inElement)){
            if(Object.keys(this._toolPool).length==0)
                document.getElementsByTagName("body")[0].innerHTML = this._elementBuilder._outerHTML + document.getElementsByTagName("body")[0].innerHTML;
            else {
                var extractToolBlock = document.createElement("div");
                extractToolBlock.innerHTML = this._elementBuilder._outerHTML;
                extractToolBlock = extractToolBlock.getElementsByClassName("toolkit-block")[0];
                document.getElementById("toolkit-parent").appendChild(extractToolBlock);
            }

            
            this.parseAssets_();
        }

        this.paserTool_(_inTool, _inDataTool);
    },

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

    //Parse the tool requested and then instantiate appropriated class.
    //At this time the tool already been called and will appear on screen.
    //So if he tool have some data to receive from the page here is where it receive it.
    paserTool_:function(_inTool, _inDataTool){
        switch (_inTool) {
            case ID_TIT:
                this._toolPool[_inTool] = {};
                this._toolPool[_inTool].ctx = new TranslateIt(new AjaxApi(), this._tabId);
                this._toolPool[_inTool].ctx.setSelectedText_(_inDataTool); //Receiving data. Data comes from toolkit.js; See context event click.
                this._toolPool[_inTool].ctx.setSendMessageTk_(this.sendMessage_);
                break;
            case ID_HEX:
                this._toolPool[_inTool] = {};
                this._toolPool[_inTool].ctx = new HexConverter();
                this._toolPool[_inTool].ctx.setSendMessageTk_(this.sendMessage_);
            default:
                break;
        }
    }
};

var ctxFront = new FrontEnd(new ElementBuilder());