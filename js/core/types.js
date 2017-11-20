/*
    Class Types
*/

TkTypes = function(){
    //Context Menu
    this.T_SEL = "selection";
    this.T_PAGE= "page";

    //Message type
    this.T_CCM  = "createcontextmenu";
    this.T_CHKHS= "checkhandshake";
    this.T_OKW  = "okwait";
    this.T_OKHS = "okhandshake"; 
    this.T_ELM  = "getelements"; //Send me the elements to build it. frontend -> toolkit;
    this.T_WAIT = "waitforit"; //Wait for the elements. toolkit -> frontend;
    this.T_ASYW = "asyncresponseforwait"; //Sending elements for frontend. toolkit -> frontend;
    this.T_RECV = "received"; 
    this.T_HIDE = "toolhide"; //Hide tool already injected;
    this.T_UHIDE= "unhidetool"; //Unhide tool;
    this.T_GASST= "getassets"; //Get all assets loaded;
    this.T_RASST= "receiveasset"; //Receive assets;
    this.T_TBUP = "tabupdates"; //Event on tab. F5;
    this.T_TBCL = "tabcloses"; //Event on tab. Closes;
    this.T_EXEC = "execscript"; //Exec Script;
    this.T_REXEC= "responseexecute"; //Response message from script execution;
    this.T_GDATA= "getdatafortool"; //Get data for tool if on ToolKit needed;
    this.T_RDATA= "retrievedata"; //ToolKit retrieve data to tool;
    this.T_GAVTL= "getallvisibletools"; //Get all visibile tools;
    this.T_RAVTL= "returnallvisibletools"; //Return of all visible tools;
    this.T_CLBLK= "closeblacklayer"; //Send message to frontend to close the blacklayer;
    this.T_OPBLK= "openblacklayer"; //Send message to frontend to open the blacklayer;

    //Main elements
    this.ELM_TIT = "toolkit-parent"; //TranslateIt //HexConverterCalculator //Both using the same element on elements/TOOL.json;
};