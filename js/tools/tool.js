const Tool = function(){};

Tool.prototype = {
    /**
     * @constant
     * @default "tkblack-layer"
     */
    _ID_BLACKLAYER:"tkblack-layer",

    /**
     * @constant
     * @default
     */
    _ctnBlacklayer:null,

    /**
     * @constant
     * @default
     */
    _main:null,
    _id_tool:null,
    _tool_block:null,
    _tool_block_id:"",
    _errorRaise:null,
    _containers:[],
    _tabs:[],
    _events:{
        onHide: null,
        onUnhide: null
    },

    /**
     * Callback function. Message to toolkit.
     * @default
     * @callback FrontEnd~sendMessage
     */
    _sendMessageTk: null,

    /**
     * Function to call when need to get data from ToolKit;
     * Set this property if using the T_GDATA to get data from ToolKit;
     * @default
     */
    _recData:null,

    /**
     * Initializes the Class
     * @param {string} _inTool Id of tool;
     * @constructor
     */
    super:function(_inTool){
        this._id_tool = _inTool;
        
        this._main = document.getElementById(ELM_TIT);
        this._tool_block = document.getElementById(this._tool_block_id);
        this._ctnBlacklayer = this._main.children[this._ID_BLACKLAYER];
        this._errorRaise = this._main.getElementsByClassName("error-raise")[0];

        this.setComponentEvent_(this._ctnBlacklayer, "click", this.blackLayerClick_)
    },

    /**
     * Set All events of the toll.
     * @implements @override
     */
    setEvent_:function(_inEvent, _inCallback){
        switch (_inEvent) {
            case "onhide":
                this._events.onHide = _inCallback.bind(this);
                break;
            case "onunhide":
                this._events.onUnhide = _inCallback.bind(this);
                break;
            default:
                break;
        }
    },

     /**
     * Unhide the tool.
     * @implements @override
     */
    unhideMe_:function(){
        if(this._events.onUnhide!==null)
            this._events.onUnhide();

        this.showTool_();
    },

    /**
     * Receive Data from ToolKit->FrontEnd->Tool
     * @param {any} _inData Data requested
     * @implements @default
     */
    recData_:function(_inData){
        this._recData(_inData);
    },

    /**
     * All tools are hide for default
     * @implements @override
     */
    showTool_:function(){
        this._main.style.display = "block";
        this._tool_block.style.display = "block";
    },

    /**
     * Set the communication directly to ToolKit. Function from FrontEnd;
     * @param {FrontEnd~sendMessage}: Callback to communicate with frontend;
     * @implements
     */
    setSendMessageTk_:function(_inRefFunc){
        this._sendMessageTk = _inRefFunc;
    },
    
    addContainer_:function(_inCName){
        const container = this._tool_block.children["container-tk"].children[_inCName];

        this._containers.push({
            ctnName: _inCName,
            ctnLink: container
        });
    },

    getContainer_:function(_inCName){
        return this._containers.filter(function(el, idx){
            return (el.ctnName == _inCName);
        })[0];
    },

    addTab_:function(_inTName, _inIsDefault=false){
        const tabLink = this._main.getElementsByClassName(_inTName)[0];
        if(_inIsDefault) tabLink.className = (tabLink.className + " selected").trim();

        tabLink.addEventListener("click", this.tabClick_.bind(this));
        this._tabs.push({
            tabName: _inTName,
            tabObj: tabLink,
            beforeClick: null,
            afterClick: null
        });
    },

    getTab_:function(_inTName){
        return this._tabs.filter(function(el, idx){
            return (el.tabName == _inTName);
        })[0];
    },

    getSelectedTab_:function(){
        return this._tabs.filter(function(el, idx){
            return (el.tabObj.className.indexOf("selected") >= 0);
        })[0];
    },

    setTabEvent_:function(_inTabName, _inEvent, _inCallback){
        const tab = this.getTab_(_inTabName)
        if(_inEvent=="beforeclick")
            tab.beforeClick = _inCallback.bind(this);
        if(_inEvent=="afterclick")
            tab.afterClick = _inCallback.bind(this);
    },

    setComponentEvent_:function(_inCName, _inEventType, _inFuncCallback){
        let component = _inCName;

        if('string' == typeof _inCName)
            component = this.getComponent_(_inCName);

        component.addEventListener(_inEventType, _inFuncCallback.bind(this));
    },

    getComponent_:function(cName){
        return this._main.getElementsByClassName(cName)[0];
    },

    //Events
    /**
     * Handles the tab clicking and show container.
     * @param {event}: click event;
     * @implements
     */
    tabClick_:function(evt){
        const elm = evt.target;
        const tab = this.getTab_((elm.className.replace("selected", "")).trim());

        if(tab.beforeClick!==null)
            tab.beforeClick();

        this.removeSelected_();
        this.showContainer_(elm.getAttribute("container"));
        elm.className = (elm.className.replace("selected", "") + " selected").trim();

        if(tab.afterClick!==null)
            tab.afterClick();
    },

    /**
     * Reset all tabs from "selected" class
     * @implements
     */
    removeSelected_:function(){
        for(tab of this._tabs)
            tab.tabObj.className = tab.tabObj.className.replace("selected", "");
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
        this._sendMessageTk({type:T_HIDE, tool:this._id_tool});

        if(this._events.onHide!==null)
            this._events.onHide();
    },

    /**
     * Handle which tab show according with tab click.
     * Work with tab selection.
     * @implements
     * @param {(string|Object)}: Id do container to show or Object of container;
     */
    showContainer_:function(_inContainer){
        let except = _inContainer;

        if('string' == typeof _inContainer)
            except = this.getContainer_(_inContainer);

        this.hideAllContainers_(except);
    },

    hideAllContainers_:function(_inExcept=null){
        for(ctn of this._containers){
            if(_inExcept!==null && ctn.ctnName == _inExcept.ctnName)
                ctn.ctnLink.style.display = "";
            else
                ctn.ctnLink.style.display = "none";
        }
    },

    errorRaise_:function(_inShow, _inMsg=null){
        this._errorRaise.innerHTML = (_inMsg!==null ? _inMsg : "");

        if (_inShow)
            this._errorRaise.style.display = "block";
        else
            this._errorRaise.style.display = "none";
    },
}