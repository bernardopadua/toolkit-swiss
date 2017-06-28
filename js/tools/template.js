/*
    Class Template;
    Tool Template;
    This class is an example to implement new tools.
*/
Template = function(){
    this.init_();
};

Template.prototype = {
    //Id Elements
    _ID_ONE: "container-one",
    _ID_TWO: "container-two",

    //Containers
    _ctnOne: null,
    _ctnTwo: null,

    //Tabs
    _tabOne: null,
    _tabTwo: null,

    //Properties elements
    _main: null,

    //Callback function. Message to toolkit.
    //Mandatory.
    _sendMessageTk: null,

    init_:function(){
        this._main = document.getElementById(ELM_TIT);

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
    //Set All events of the toll.
    //Mandatory.
    setEvents_:function(){
        //Events for tabs
        this._tabOne.addEventListener("click", this.tabClick_.bind(this));
        this._tabTwo.addEventListener("click", this.tabClick_.bind(this));

        //Events for buttons
        this._btnConverter.addEventListener("click", this.btnConverterClick_.bind(this));

        //Events for tool
        this._ctnBlacklayer.addEventListener("click", this.blackLayerClick_.bind(this));
    },

    //Unhide the tool.
    //Mandatory.
    unhideMe_:function(){
        this._tabConv.click();
        this._main.style.display = "block";
    },

    //All tools are hide for default
    //Mandatory;
    showTool_:function(){
        this._main.style.display = "";
    },

    //Set the communication directly to ToolKit. Function from FrontEnd;
    //Mandatory.
    setSendMessageTk_:function(_inRefFunc){
        this._sendMessageTk = _inRefFunc;
    },

    //Events

    //Handle tab clicking
    //Mandatory. Handles the tab clicking and show container.
    tabClick_:function(evt){
        var elm = evt.target;
        
        this.removeSelected_();
        this.showContainer_(elm.getAttribute("container"));
        elm.className = "selected";
    },

    //Reset all tabs from "selected" class
    //Mandatory. Work with tabs.
    removeSelected_:function(){
        this._tabCalc.className = "";
        this._tabConv.className = "";
    },
    //Handle which tab show according with tab click
    //Mandatory. Work with tab selection.
    showContainer_:function(_inContainer){
        this._ctnHexConvert.style.display = "none";
        this._ctnHexCalc.style.display = "none";

        switch (_inContainer) {
            case this._ID_ONE:
                this._ctnOne.style.display = "";
                break;
            case this._ID_TWO:
                //Same as below
                break;
            default:
                break;
        }
    },    

};