/**
 * Class Base64EncodeDecode
 * This class is responsible for all base64 encodes and decodes.
 * @class
 */
const Base64EncodeDecode = function(){

    this.tId        = "base64encodedecode"; //Tool Id

    //To make easy to call it.
    this._ID_BASE64 = "base64encodedecode-ct";

    this.init=function(){
        //Setuping the tool prototype.
        this.super(this.tId, "toolkit-block-base64", this._extensionURL); //Mandatory to call this function;

        this.addContainer_(this._ID_BASE64); //Adding a container internal needs.

        this.setComponentEvent_("btnEncodeDecode", "click", this.btnEncodeDecode); //It uses the event addEventListener internally;

        this.showTool_("center"); //Show tool on the screen;
    };

    this.btnEncodeDecode=function(){
        //Getting the components
        const txtTextToEncode = this.getComponent_("texttoencode");
        const txtTextEncoded  = this.getComponent_("textencoded");

        //Hiding the message if it was raised;
        //You need to have a <div class="erro-raise" on the JSON element;
        this.errorRaise_(false);

        if(txtTextEncoded.value.length>0)
            txtTextToEncode.value = atob(txtTextEncoded.value);
        else if(txtTextToEncode.value.length>0)
            txtTextEncoded.value = btoa(txtTextToEncode.value);

        if((txtTextEncoded.value.length==0) && (txtTextToEncode.value.length==0))
            this.errorRaise_(true, "Please insert the text to Decode or Encode!");
    };

};
Base64EncodeDecode.prototype = Tool.prototype;
Base64EncodeDecode.prototype.constructor = Base64EncodeDecode;

/**
 * Starting tool and calling elements;
 * The init call is on FrontEnd;
 * @instance FrontEnd Class
 */
const base64Obj = new Base64EncodeDecode();
ctxFront.initTool_(base64Obj.tId, base64Obj);
ctxFront.getElements_(base64Obj.tId);