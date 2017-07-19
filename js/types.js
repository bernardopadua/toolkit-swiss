/*
    Constants ToolKit
*/
//Context Menu
const T_SEL = "selection";
const T_PAGE= "page";

//Message type
const T_CCM  = "createcontextmenu";
const T_CHKHS= "checkhandshake";
const T_OKW  = "okwait";
const T_OKHS = "okhandshake"; 
const T_ELM  = "getelements"; //Send me the elements to build it. frontend -> toolkit;
const T_WAIT = "waitforit"; //Wait for the elements. toolkit -> frontend;
const T_ASYW = "asyncresponseforwait"; //Sending elements for frontend. toolkit -> frontend;
const T_RECV = "received"; 
const T_HIDE = "toolhide"; //Hide tool already injected;
const T_UHIDE= "unhidetool"; //Unhide tool;
const T_GASST= "getassets"; //Get all assets loaded;
const T_RASST= "receiveasset"; //Receive assets;
const T_TBUP = "tabupdates"; //Event on tab. F5;
const T_TBCL = "tabcloses"; //Event on tab. Closes;
const T_EXEC = "execscript"; //Exec Script;
const T_REXEC= "responseexecute"; //Response message from script execution;
const T_GDATA= "getdatafortool"; //Get data for tool if on ToolKit needed;
const T_RDATA= "retrievedata"; //ToolKit retrieve data to tool;

//Unique ID
const ID_TIT = "translate_it"; //Tool translate;
const ID_TKS = "toolkit_swiss"; //Top level page context;
const ID_HEX = "hexconverter"; //Tool hex;
const ID_COD = "codehighlight"; //Tool for code highlighting;
const ID_B64 = "base64encodedecode"; //Tool for encoding and decoding base64;

//Main elements
const ELM_TIT = "toolkit-parent"; //TranslateIt //HexConverterCalculator //Both using the same element on elements/TOOL.json;