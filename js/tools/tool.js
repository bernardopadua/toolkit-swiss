function Tool(){};

Tool.prototype = {
    
    initProperties:function(){
        Object.assign(this, {
            /**
             * @constant
             * @default
             */
            _main:null,
            _id_tool:null,
            _tool_block:null,
            _errorRaise:null,
            _containers:[],
            _isSupressingBlack:false,
            _resized:false, //This tool was resized anytime ?
            _resizeBk:{
                width: "",
                height: ""
            }, //Keep the last resize value for minimize event.
            _tabs:[],
            _events:{
                onHide: null,
                onUnhide: null
            },
            _jsEvents:[],
            _assets: [],
            _types: null, //Types
            /**
             * Function to call when need to get data from ToolKit;
             * Set this property if using the T_GDATA to get data from ToolKit;
             * @default
             */
            _recData:null,
            /**
             * Black-Layer Element got from FrontEnd Class
             */
            getBlackLayer_:null
        });
    },

    /**
     * Initializes the Class
     * @param {string} _inTool Id of tool;
     * @constructor
     */
    super:function(_inTool, _inToolBlock, _inExtURL=null){
        this.initProperties();
        this._types = new TkTypes();
        this._id_tool = _inTool;
        this._extensionURL = _inExtURL;

        this._main = document.getElementById(this._types["ELM_TIT"]);
        this._tool_block = document.getElementById(_inToolBlock);
        this._tool_block.style.zIndex = "10";

        //Supress the black layer ?
        if(this._tool_block.getAttribute("supress-black")!==null)
            this._isSupressingBlack = true;
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
    showTool_:function(_inPosition=null){
        
        const winWidth  = window.innerWidth;
        const winHeight = window.innerHeight;
        const toolWdt   = this._tool_block.offsetWidth;
        const toolHgt   = this._tool_block.offsetHeight;

        const subt = function(vo, vs){
            if(vo>vs)
                return vo-vs
            else
                return vs-vo;
        }

        const div = function(vo, vs){
            return Math.ceil((vo/vs));
        }

        switch (_inPosition) {
            case "center":
                this._tool_block.style.top  = (subt(div(winHeight,2), div(toolHgt,2))+window.scrollY).toString()+"px";
                this._tool_block.style.left = subt(div(winWidth,2), div(toolWdt,2)).toString()+"px";       
                break;
            case "upper":
                this._tool_block.style.top  = "15px";
                this._tool_block.style.left = subt(div(winWidth,2), div(toolWdt,2)).toString()+"px";       
                break;
            default:
                break;
        }

        const toolTop = parseInt(this._tool_block.style.top.replace("px", ""))+div(toolHgt,2);
        if(window.scrollY > toolTop){
            this.showTool_("center");
            return;
        } else if (subt(window.scrollY, toolTop)>window.innerHeight){
            this.showTool_("center");
            return;
        }

        this.getComponent_("tool").style.visibility = "visible";
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
        const container = this._tool_block.children["window-elements-bundled"].children["window-content"].children[_inCName];

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

        const funcBinded = _inFuncCallback.bind(this);

        if(!this.checkComponentEvent_(_inCName, _inEventType)){
            this.addEventHandler_(_inCName, _inEventType, funcBinded);
            component.addEventListener(_inEventType, funcBinded, true);
        }
    },

    unsetComponentEvent_:function(_inCName, _inEventType){
        let component = _inCName;

        if('string' == typeof _inCName)
            component = this.getComponent_(_inCName);

        const funcBinded = this.getComponentEvent_(_inCName, _inEventType).funcEvent;

        if(this.checkComponentEvent_(_inCName, _inEventType)){
            component.removeEventListener(_inEventType, funcBinded, true);
            this.removeEventHandler_(_inCName, _inEventType);
        }
    },

    checkComponentEvent_:function(_inCName, _inEventType){
        const checked = this._jsEvents.filter(function(elm, idx, array){
            if(elm.component==_inCName && elm.event==_inEventType)
                return true;
        });

        return (checked.length > 0) ? true : false;
    },

    getComponentEvent_:function(_inCName, _inEventType){
        const elmEvent = this._jsEvents.filter(function(elm, idx, array){
            if(elm.component==_inCName && elm.event==_inEventType)
                return idx;
        });
        return elmEvent[0];
    },

    addEventHandler_:function(_inCName, _inEventType, _inFuncCallback){
        this._jsEvents.push({component: _inCName, event:_inEventType, funcEvent:_inFuncCallback});
    },

    removeEventHandler_:function(_inCName, _inEventType){
        this._jsEvents.splice(this._jsEvents.indexOf(this.getComponentEvent_(_inCName, _inEventType)),1);
    },

    getComponent_:function(_inCName){
        switch (_inCName) {
            case "main":
                return this._main;
                break;
            case "body":
                return document.getElementsByTagName("body")[0];
                break;
            case "tool":
                return this._tool_block;
                break;
            default:
                return this._tool_block.getElementsByClassName(_inCName)[0];
                break;
        }
    },

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
     * Function to hide tool.
     * @param {bool} _inSupressBlack Hide/Supress black layer or not ?
     */
    hideMe_:function(_inSupressBlack=true){
        if(this._isSupressingBlack || _inSupressBlack)
            this.getBlackLayer_().style.visibility = "hidden";

        this._tool_block.style.visibility = "hidden";
        this._sendMessageTk({type:this._types["T_HIDE"], tool:this._id_tool});

        if(this._events.onHide!==null)
            this._events.onHide();
    },

    /**
     * Event to close the window
     */
    closeWindow_:function(){
        const self = this;

        const hideTool = new Promise(function(rs, rj){
            const responseTools = function(_inTools){
                rs(_inTools);
            }

            self._sendMessageTk({type: self._types["T_GAVTL"]}, responseTools);
        });

        hideTool.then(function(_inTools){
            if(_inTools.length>1)
                self.hideMe_(false);
            else
                self.hideMe_();
        });
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

    /**
     * Functions to hide all containerd added on the init function of tool.
     * @param {string} _inExcept Container ID
     */
    hideAllContainers_:function(_inExcept=null){
        for(ctn of this._containers){
            if(_inExcept!==null && ctn.ctnName == _inExcept.ctnName)
                ctn.ctnLink.style.display = "";
            else
                ctn.ctnLink.style.display = "none";
        }
    },

    /**
     * Error box for tools.
     * Must be enhanced yet, for now it should have HTML hardcoded on the json tool.
     * @param {bool} _inShow Show it or Supress it
     * @param {string} _inMsg String containing the message to show
     */
    errorRaise_:function(_inShow, _inMsg=null){
        this.getComponent_("error-raise").innerHTML = (_inMsg!==null ? _inMsg : "");

        const er = this.getComponent_("error-raise");

        if (_inShow)
            er.classList.add("visible");
        else
            er.classList.remove("visible");
    },

    /**
     * Handle window resizer
     */
    handleWindowResizer_:function(e){
        const hTool    = this.getComponent_("tool");
        const hContent = this.getComponent_("window-content");
        const hFooter  = this.getComponent_("window-footer");
        const hClick= {
            x: e.x,
            y: e.y
        };

        this._resized = true; //Tool fired the resize event.

        hTool.style.width     = (hTool.style.width==="") ? (hTool.offsetWidth.toString()+"px") : hTool.style.width;
        hTool.style.height    = (hTool.style.height==="") ? (hTool.offsetHeight.toString()+"px") : hTool.style.height;
        hContent.style.height = (hContent.style.height==="") ? ((hContent.offsetHeight).toString()+"px") : hContent.style.height;
        hFooter.style.height  = (hFooter.style.height==="") ? (hFooter.offsetHeight.toString()+"px") : hFooter.style.height;

        const hMove = function(e){
            const subt = function(vo, vt){
                if(vo > vt)
                    return vo-vt;
                else
                    return vt-vo;
            };

            const aWidth  = parseInt(hTool.style.width.replace("px", ""));
            const aHeight = parseInt(hTool.style.height.replace("px", ""));
            const wcHeight= parseInt(hContent.style.height.replace("px", ""));

            if(e.x > hClick.x) 
                hTool.style.width = (aWidth+subt(e.x, hClick.x)).toString() + "px";
            else
                hTool.style.width = subt(aWidth, subt(e.x, hClick.x)).toString() + "px";

            if(e.y > hClick.y){
                hTool.style.height    = (aHeight+subt(e.y, hClick.y)).toString() + "px";
                hContent.style.height = (wcHeight+subt(e.y, hClick.y)).toString() + "px";
            } else {
                hTool.style.height    = subt(aHeight, subt(e.y, hClick.y)).toString() + "px";
                hContent.style.height = subt(wcHeight, subt(e.y, hClick.y)).toString() + "px";
            }


            hClick.x = e.x;
            hClick.y = e.y;
        };

        this.setComponentEvent_("body", "mouseup", function(){
            this.unsetComponentEvent_("body", "mousemove");
            this.unsetComponentEvent_("body", "mouseup");
        });
        this.setComponentEvent_("body", "mousemove", hMove);
    },

    /**
     * Window moving handler
     */
    handleWindowMove_:function (e){
        const handle = {
            target: e.target.parentElement,
            x: e.x,
            y: e.y
        };
    
        this._tool_block.style.zIndex = "11"; //Tool super position
        e.target.style.cursor = "move";

        const mMove = function(e){
            const left = (handle.target.style.left==="") ? 0 : parseInt(handle.target.style.left.replace("px", ""));
            const top  = (handle.target.style.left==="") ? 0 : parseInt(handle.target.style.top.replace("px", ""));

            const subt = function(vo, vt){
                if(vo > vt)
                    return vo-vt;
                else
                    return vt-vo;
            };

            const difLeft = subt(handle.x, e.x);
            const difTop  = subt(handle.y, e.y);

            const winWidth  = window.innerWidth;
            const winHeight = window.innerHeight;
            const toolWidth = parseInt(handle.target.style.width.replace("px", ""));

            if(e.x < handle.x){
                const tmpVal = (left < 0) ? "0px" : subt(left, difLeft).toString()+"px";
                handle.target.style.left = tmpVal;
            } else {
                const tmpVal = (left > winWidth-(toolWidth/2)) ? "0px" : (left+difLeft).toString()+"px";
                handle.target.style.left = tmpVal;
            }

            if(e.y < handle.y){
                const tmpVal = (top < 0) ? "0px" : subt(top, difTop).toString()+"px";
                handle.target.style.top = tmpVal;
            } else {
                const tmpVal = (top+difTop).toString()+"px";
                handle.target.style.top = tmpVal;
            }
            
            handle.x = e.x;
            handle.y = e.y;
        };

        this.setComponentEvent_("body", "mouseup", function(e){
            this.unsetComponentEvent_("body", "mousemove");
            this.unsetComponentEvent_("body", "mouseup");
            this.getComponent_("window-head").style.cursor = "";
            
            this._tool_block.style.zIndex = "10"; //Managing window superposition
        });
        this.setComponentEvent_("body", "mousemove", mMove);
    },

    /**
     * Function handle window head click options
     */
    handleWindowClickOptions_:function(e){
        const hTool           = this.getComponent_("tool");
        const windowElements  = this.getComponent_("window-elements-bundled");
        const wUp             = this.getComponent_("wup-btn");
        const wMini           = this.getComponent_("wmini-btn");
        const opt             = e.target.getAttribute("opt");

        switch (opt) {
            case "wclose-btn":
                this.closeWindow_();
                break;
            case "wmini-btn":
                if(this._resized){
                    this._resizeBk.width  = hTool.style.width;
                    this._resizeBk.height = hTool.style.height;
                    hTool.style.width     = "";
                    hTool.style.height    = "";
                }

                windowElements.style.display = "none";
                wUp.style.display            = "";
                wMini.style.display          = "none";
                break;
            case "wup-btn":
                if(this._resized){
                    hTool.style.width  = this._resizeBk.width
                    hTool.style.height = this._resizeBk.height
                }

                windowElements.style.display = "";
                wUp.style.display            = "none";
                wMini.style.display          = "";
                break;
            default:
                break;
        }

    },

    /**
     * Function to manage window options (close, minimize, maximize)
     */
    setWindowButtonsEvt_:function(){
        //Buttons pointer style
        const buttonContainer = this.getComponent_("wbuttons-float");
        const wUp             = this.getComponent_("wup-btn");
        
        buttonContainer.style.cursor = "pointer";
        wUp.style.display            = "none";

        this.setComponentEvent_("wclose-btn", "click", this.handleWindowClickOptions_);
        this.setComponentEvent_("wup-btn",    "click", this.handleWindowClickOptions_);
        this.setComponentEvent_("wmini-btn",  "click", this.handleWindowClickOptions_);
    },

    /**
     * Set the event to move the window in the browser.
     */
    setWindowDnD_:function(){
        this.getComponent_("wbuttons-float").style.display = "block";
        this.setWindowButtonsEvt_();
        this.setComponentEvent_("window-head", "mousedown", this.handleWindowMove_);
    },

    /**
     * Set resizer event to tool window
     */
    setWindowResizable_:function(){
        const winFooter = this.getComponent_("window-footer");
        const resizer   = new WindowConstructor(); //Used to create element;

        resizer.createElement("div");
        resizer.setId("tk-resizer");
        resizer.setPropStyle("float",           "right");
        resizer.setPropStyle("width",           "15px");
        resizer.setPropStyle("height",          "15px");
        resizer.setPropStyle("display",         "block");
        resizer.setPropStyle("backgroundImage", "url("+this._extensionURL+"assets/wresize-btn.png)");
        resizer.setPropStyle("cursor",          "nwse-resize");
        resizer.setPropStyle("zIndex",          "99");

        winFooter.insertAdjacentHTML("beforeend", resizer.getHtml());

        this.setComponentEvent_("tk-resizer", "mousedown", this.handleWindowResizer_);
    }
}