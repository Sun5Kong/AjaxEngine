/*
* Author:Houfeng
* Email:admin@xhou.net
*/
(function (env) {
    if (!env.jQuery) {
        throw "jQuery not found.";
    }
    /********    extends outerHTML    ********/
    if (navigator.userAgent.indexOf("Gecko/") > -1) {
        HTMLElement.prototype.__defineGetter__("outerHTML", function () {
            var a = this.attributes, str = "<" + this.tagName, i = 0; for (; i < a.length; i++)
                if (a[i].specified)
                    str += " " + a[i].name + '="' + a[i].value + '"';
            if (!this.canHaveChildren)
                return str + " />";
            return str + ">" + this.innerHTML + "</" + this.tagName + ">";
        });
        HTMLElement.prototype.__defineSetter__("outerHTML", function (s) {
            var r = this.ownerDocument.createRange();
            r.setStartBefore(this);
            var df = r.createContextualFragment(s);
            this.parentNode.replaceChild(df, this);
            return s;
        });
        HTMLElement.prototype.__defineGetter__("canHaveChildren", function () {
            return !/^(area|base|basefont|col|frame|hr|img|br|input|isindex|link|meta|param)$/.test(this.tagName.toLowerCase());
        });
    }
    /********    START    ********/
    var owner = env.AjaxEngine = env.AjaxEngine || {};
    owner.onRequestBegin = owner.onRequestBegin || env.onRequestBegin;
    owner.onRequestEnd = owner.onRequestEnd || env.onRequestEnd;
    //�Ի���
    owner.dialog = owner.dialog || {};
    owner.dialog.confirm = function (msg, onOk, onCancel) {
        if (confirm(msg)) {
            if (onOk) onOk();
        } else {
            if (onCancel) onCancel();
        }
    };
    owner.dialog.alert = function (msg, callback) {
        alert(msg)
        if (callback) callback();
    };
    owner.dialog.open = function (url, target, features, replace) {
        var dlg = window.open(url, target, features, replace);
        owner.dialog.focus(dlg);
        return dlg;
    };
    owner.dialog.close = function () {
        window.close();
    };
    owner.dialog.getOpener = function () {
        return window.opener;
    };
    owner.dialog.focus = function (dlg) {
        dlg.focus();
    };
    //----
    owner.wrapUrl = owner.wrapUr || function (url) {
        var app = this;
        if (url.indexOf('?') > -1)
            url += "&__t=" + Math.random();
        else
            url += "?__t=" + Math.random();
        return url;
    };
    owner.isArray = function (obj) {
        var v1 = Object.prototype.toString.call(obj) === '[object Array]';
        var v2 = obj instanceof Array;
        var v3 = (obj.length instanceof Array) && obj[0];
        var v3 = (obj.length instanceof Array) && (typeof obj.splice === 'function');
        return v1 || v2 || v3 || v4;
    };
    owner.stringToJson = owner.stringToJson || function (str) {
        if (env.JSON && env.JSON.parse) {
            return env.JSON.parse(str);
        }
        return (new Function("return " + str + ";"))();
    };
    owner.jsonToString = owner.jsonToString || function (obj) {
        if (env.JSON && env.JSON.stringify) {
            return env.JSON.stringify(obj);
        }
        var THIS = this;
        switch (typeof (obj)) {
            case 'string':
                return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';
            case 'array':
                return '[' + obj.map(THIS.jsonToString).join(',') + ']';
            case 'object':
                if (owner.isArray(obj)) {
                    var strArr = [];
                    var len = obj.length;
                    for (var i = 0; i < len; i++) {
                        strArr.push(THIS.jsonToString(obj[i]));
                    }
                    return '[' + strArr.join(',') + ']';
                } else if (obj == null || obj == undefined) {
                    return 'null';
                } else {
                    var string = [];
                    for (var p in obj) {
                        string.push(THIS.jsonToString(p) + ':' + THIS.jsonToString(obj[p]));
                    }
                    return '{' + string.join(',') + '}';
                }
            case 'number':
                return obj;
            case 'boolean':
                return obj;
            case false:
                return obj;
        }
    };
    owner.$ = owner.$ || function (id) {
        var element = document.getElementById(id);
        if (element) {
            return element;
        }
        else {
            element = document.getElementsByName(id)
            element = element[0] || element;
            return element;
        }
    };
    owner.query = env.jQuery;
    owner.ajax = owner.ajax || env.jQuery.ajax;
    owner.serializeData = owner.serializeData || function () {
        var formData = owner.query(theForm).serializeArray();
        theForm.__EVENTTARGET.value = "";
        theForm.__EVENTARGUMENT.value = "";
        return formData;
    };
    owner.callServer = owner.callServer || function (data, callback) {
        if (owner.onRequestBegin)
            owner.onRequestBegin();
        var formData = owner.serializeData();
        formData["ajax-request"] = "yes";
        formData.push({ "name": "ajax-request", "value": "true" });
        for (var name in data) {
            var value = (typeof data[name] === "string") ? data[name] : owner.jsonToString(data[name]);
            formData.push({ "name": name, "value": value });
        }
        //--
        var reutrnResult = null;
        owner.ajax({
            type: "post",
            url: owner.wrapUrl(location.href.indexOf('?') > -1 ? location.href : theForm.action),
            async: callback != null,
            cache: false,
            data: formData,
            dataType: "json",
            success: function (result, status) {
                reutrnResult = owner.processResult(result);
                if (callback) {
                    callback(reutrnResult);
                }
            },
            error: function (xmlRequest, status, errorThrown) {
                document.write(xmlRequest.responseXML || xmlRequest.responseText || errorThrown || status);
            }
        });
        return reutrnResult;
    };
    owner.processResult = owner.processResult || function (msgList) {
        var returnResult = null;
        if (!msgList) return returnResult;
        for (var i in msgList) {
            var msg = msgList[i];
            if (msg.Type === 0) {
                returnResult = msg.Context;
            }
            else if (msg.Type === 1) {
                var element = owner.$(msg.Id);
                if (element && element.outerHTML) {
                    element.outerHTML = msg.Context;
                }
            }
            else if (msg.Type === 2) {
                eval(msg.Context);
            }
        }
        if (owner.onRequestEnd) {
            owner.onRequestEnd();
        }
        return returnResult;
    };
    owner.doPostBack = owner.doPostBack || function (eventTarget, eventArgument) {
        if (!theForm.onsubmit || (theForm.onsubmit() != false)) {
            theForm.__EVENTTARGET.value = eventTarget;
            theForm.__EVENTARGUMENT.value = eventArgument;
            var target = owner.$(eventTarget);
            if (target && target.getAttribute && target.getAttribute("ajax-disabled") == "yes") {
                theForm.submit();
            }
            else {
                owner.callServer({}, function (result) { });
            }
        }
    };
    //
    if (__ControlAjaxEnabled) {
        __doPostBack = owner.doPostBack;
    }
}(this));
