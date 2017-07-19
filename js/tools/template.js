/**
 * Class Template
 * @class
 * @constructor
 */
Template = function(){
    this.init_();
};

Template.prototype = {
    //Id Elements
    _ID_ONE: "template-container-one",
    _ID_TWO: "template-container-one",

    /**
     * @constant
     * @default "tkblack-layer"
     */
    _ID_BLACKLAYER: "tkblack-layer",
    /**
     * @constant
     * @default
     */
    _ctnBlacklayer:null, 

    //Containers
    _ctnOne: null,
    _ctnTwo: null,

    //Tabs
    _tabOne: null,
    _tabTwo: null,

    //Properties elements
    /**
     * @constant
     * @default
     */
    _main: null,
    /**
     * @constant
     * @default
     */
    _tool_block: null,

    /**
     * Callback function. Message to toolkit.
     * @default
     * @callback FrontEnd~sendMessage
     */
    _sendMessageTk: null,

    /**
     * Initializes the Class
     * @constructor
     * @implements @override
     */
    init_:function(){
        this._main = document.getElementById(ELM_TIT);
        this._tool_block = document.getElementById("toolkit-block-cdht");
        this._ctnBlacklayer = this._main.children[this._ID_BLACKLAYER];

        var containers = this._main.children["toolkit-block"].children["container-tk"];

        this._ctnOne = containers.children[this._ID_ONE];
        this._ctnTwo = containers.children[this._ID_TWO];
        
        this._tabConv = this._main.getElementsByClassName("c1")[0];
        this._tabCalc = this._main.getElementsByClassName("c2")[0];
        
        this.removeSelected_();

        this._tabOne.className = "selected"; //Selecting default tab
    
        this.setEvents_();
        this.showTool_();
    },

    /**
     * Set All events of the toll.
     * @implements @override
     */
    setEvents_:function(){
        /**
         * Set all events of the tool here.
         * 
         * Examples: {
         *  this._tabOne.addEventListener("click", this.tabClick_.bind(this));
         *  this._btnConverter.addEventListener("click", this.btnConverterClick_.bind(this));
         * }
         */

        /**
         * @constant
         * @default
         */
        this._ctnBlacklayer.addEventListener("click", this.blackLayerClick_.bind(this));
    },

    /**
     * Receive Data from ToolKit->FrontEnd->Tool
     * @param {any} _inData Data requested
     * @implements @default
     */
    recData_:function(_inData){
        /**
         * Implement if needed!
         */
    },

    /**
     * Unhide the tool.
     * @implements @override
     */
    unhideMe_:function(){
        this._tabConv.click();
        this._main.style.display = "block";
    },

    /**
     * All tools are hide for default
     * @implements @override
     */
    showTool_:function(){
        this._main.style.display = "";
    },

    /**
     * Set the communication directly to ToolKit. Function from FrontEnd;
     * @param {FrontEnd~sendMessage} _inRefFunc: Callback to communicate with frontend;
     * @implements
     */
    setSendMessageTk_:function(_inRefFunc){
        this._sendMessageTk = _inRefFunc;
    },

    //Events

    /**
     * Handles the tab clicking and show container.
     * The 'container' attribute on the HTML tab must be the same name on
     * this._ID_ONE or this._ID_TWO (for example).
     * @param {event}: click event;
     * @implements
     */
    tabClick_:function(evt){
        var elm = evt.target;
        
        this.removeSelected_();
        this.showContainer_(elm.getAttribute("container"));
        elm.className = "selected";
    },

    /**
     * Blacklayer click to hide the tool
     * Change tool id on sendmessage.
     * @default
     * @implements
     */
    blackLayerClick_:function(){
        this._main.style.display = "none";
        this._tool_block.style.display = "none";
        this._sendMessageTk({type:T_HIDE, tool:ID_COD}); /*CHANGE THE ID OF THE TOOL*/
    },

    /**
     * Reset all tabs from "selected" class
     * @implements
     */
    removeSelected_:function(){
        /**
         * If working with tabs.
         * Unselect it all here.
         * Examples:{
         *  this._tabCalc.className = "";
         *  this._tabConv.className = "";
         * }
         */
    },
    /**
     * Handle which tab show according with tab click.
     * Work with tab selection.
     * @implements
     * @param {_ID_CONTAINER}: Id do container to show
     */
    showContainer_:function(_inContainer){
        /**
         * Hide all containers. When working with tabs.
         * On change tab, change containers.
         * Example: {this._ctn.style.display = "none"}
         * ... 
         */

        switch (_inContainer) {
            default:
                break;
        }
    },   

};

/**
 * Calling the elements of tool;
 * @default ctxFront Context of FrontEnd class;
 */
ctxFront.getElements_();