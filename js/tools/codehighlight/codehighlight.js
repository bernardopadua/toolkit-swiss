/**
 * Class CodeHighlight
 * @class
 * @constructor
 */
const CodeHighlight = function(){

    this.Languages = {
        langc: {
            grammar: {
                funccall: /(~|\()\w+(\s|\S)(?=\((.*?)\)\;)/g,
                strings: /\"(.*?)\"/g,
                keywords: /\b(int|char|long|struct|void)\b/g,
                preprocessor: /\#(include|define)/g,
                numbers: /\b[0-9]+\b/g
            },
            syntax: {
                funccall: "style='color:#003300;font-weight:bold;'",
                strings: "style='color:#cc1d00;'",
                keywords: "style='color:#168dff;'",
                preprocessor: "style='color:#991600;'",
                numbers: "style='color:purple;'"
            }
        }
    };

    this.tId          = "codehighlight"; //Tool Id

    this._ID_HLIGHTER = "highlighter-ct";
    
    this.init=function(){
        this.super(this.tId, "toolkit-block-cdht", this._extensionURL);

        this.addContainer_(this._ID_HLIGHTER);
        this.setComponentEvent_("btnHighlight", "click", this.btnHighlightEvt);

        this.showTool_("center");
    };

    this.btnHighlightEvt=function(){
        const optLang = this.getComponent_("lang-to");
        const optLangIdx = optLang.selectedIndex;
        
        const txtCodeToHighlight = this.getComponent_("code-to-highlight");
        const codeHighlited = this.getComponent_("code-highlighted");

        this.errorRaise_(false);

        /**
         * Function receives the code and split the code while it finds the 
         * grammar regex.
         * Idea from [github]segmentio/highlight.
         * @param {string} code 
         * @param {Object} grammar object
         */
        const parseIt=function(code, grammar) {
            var ar = [code];
            
            for(const k in grammar) {
                for(var i=0;i<ar.length;i++){
                    const grRule = grammar[k];
                    const str  = ar[i];
                    const exR  = grRule.exec(str);

                    if(exR===null) continue;

                    const before = str.slice(0, exR.index);
                    const getGrammar  = { type: k, value: exR[0] };
                    const after  = str.slice(exR.index+exR[0].length);

                    var newNode = [i,1];

                    //Applying new array
                    if(before) newNode.push(before);
                    newNode.push(getGrammar);
                    if(after) newNode.push(after);

                    //Adding node to code string array.
                    ar.splice.apply(ar, newNode);
                }
            }
            return ar;
        };

        /**
         * Get the code object parsed and apply the syntax;
         * @param {Object} codeObj Code Object
         * @param {Object} syntax Syntax Object
         */
        const syntaxIt=function(codeObj, syntax){
            const syntaxTo = syntax[codeObj.type];
            return "<span "+syntaxTo+">"+codeObj.value+"</span>";
        };

        /**
         * Returning the complete html parsed and syntaxed.
         * @param {Object} parsedObj
         * @return {string} String HTML;
         */
        const stringIt=function(parsedObj, syntaxObj){
            return "<pre>" + parsedObj.reduce(function(prev, actual){ 
                return prev + (("object" == typeof actual) ? syntaxIt(actual, syntaxObj) : actual.replace("\n", "</br>")) 
            }, "") +
            "</pre>";
        };

        /**
         * Set grammar and syntax
         * @param {string} _inCode String Code;
         * @param {Object} _inLangObj Language object;
         */
        const highlightIt=function(_inCode, _inLangObj){
            const parsedCode = parseIt(_inCode, _inLangObj.grammar);
            return stringIt(parsedCode, _inLangObj.syntax);
        };

        /**
         * PreParse the code. Removing special characters.
         * @param {string} _inCode String code;
         */
        const preParse=function(_inCode){
            return _inCode.replace(/\n/g, ".bl.").replace(/\\n/g, ".nl.").replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/ /g, "~");
        };

        /**
         * Indent code;
         * @param {string} _inCode Highlited code;
         */
        const afterHl=function(_inCode){
            return _inCode.replace(/(.bl.)/g, "<br/>").replace(/\~/g, " ").replace(/(.nl.)/g, "\\n");
        };

        switch (optLang.options[optLangIdx].value) {
            case "-1":
                this.errorRaise_(true, "Please select a language!");
                break;
            case "C":
                let pCode = "";
                pCode = preParse(txtCodeToHighlight.value);
                pCode = highlightIt(pCode, this.Languages.langc);
                pCode = afterHl(pCode);
                codeHighlited.value = pCode;
                break;
            default:
                break;
        }
    }.bind(this);

};
CodeHighlight.prototype = Tool.prototype;
CodeHighlight.prototype.constructor = CodeHighlight;

/**
 * Starting tool and calling elements;
 * The init call is on FrontEnd;
 * @instance FrontEnd Class
 */
const codeObj = new CodeHighlight();
ctxFront.initTool_(codeObj.tId, codeObj);
ctxFront.getElements_(codeObj.tId);