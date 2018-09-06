// ==UserScript==
// @name             GC little helper II Countries/States Ids
// @namespace        http://www.amshove.net
// @version          0.0.1
// @include          http*://www.geocaching.com/pocket/gcquery.aspx*
// @require          http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js
// @require          https://raw.githubusercontent.com/2Abendsegler/GClh/master/data/gclh_defi.js
// @connect          raw.githubusercontent.com
// @description      Development Helper to get country and state list from PQ page
// @copyright        2018 CachingFoX
// @author           CachingFoX
// @icon             https://raw.githubusercontent.com/2Abendsegler/GClh/master/images/gclh_logo.png
// @license          GNU General Public License v2.0
// @grant            GM_getValue
// @grant            GM_setValue
// @grant            GM_log
// @grant            GM_xmlhttpRequest
// @grant            GM_getResourceText
// @grant            GM_info
// ==/UserScript==

var start = function(c) {
    quitOnAdFrames()
        .then(function() {return jqueryInit(c);})
        .then(function() {return constInit(c);})
        .done(function() {
            /* workaround: unknown and United States are not part of the list */
            $("#ctl00_ContentBody_lbCountries").append('<option value="2">United States</option>');
            $("#ctl00_ContentBody_lbCountries").append('<option value="1">Unknown</option>');            
            CountriesStates_ExcelCSV("#ctl00_ContentBody_lbCountries");
            CountriesStates_ExcelCSV("#ctl00_ContentBody_lbStates");
            CountriesStates_JSON("#ctl00_ContentBody_lbCountries", "country_idInit","c.country_id");
            CountriesStates_JSON("#ctl00_ContentBody_lbStates", "states_idInit","c.states_id");
        });
};

function CountriesStates_ExcelCSV(selector) { // output Excel-compatible csv, sorted by id
    var code=""; 

    $(selector).append($(selector+" option").remove().sort(function(a, b) {
        var at = parseInt($(a).val()), bt = parseInt($(b).val());
        return (at > bt)?1:((at < bt)?-1:0);
    }));

    $(selector+" option").each(function() {
        if (code != '') {
            code += '\n';
        }
        code += $(this).val()+';'+$(this).text()+'';
    });
    $(selector).after('<pre>'+code+'</pre>');
    return code;
}

function CountriesStates_JSON(selector, functionname, objectname) { // output json object, sorted by country/state name
    var code=""; 

    $(selector).append($(selector+" option").remove().sort(function(a, b) {
        var at = $(a).text(), bt = $(b).text();
        return at.localeCompare(bt);
    }));

    $(selector+" option").each(function() {
        if (code != '') {
            code += ',\n';
        }
        code += '        {"n":"'+$(this).text()+'","id":"'+$(this).val()+'"}';
    });

    code = "[\n"+code+"\n    ]";
    try {
        JSON.parse(code); // check for syntax errors
    } catch(e) {
        code = e;
    }

    code = "function "+functionname+"(c) {\n    "+objectname+" = "+code+";\n}";   
    $(selector).after('<pre>'+code+'</pre>');
    return code;
}


var quitOnAdFrames = function(c) {
    var quitOnAdFramesDeref = new jQuery.Deferred();
    if(window.name) {
        if (window.name.substring(0, 18) !== 'google_ads_iframe_') quitOnAdFramesDeref.resolve();
        else quitOnAdFramesDeref.reject();
    }
    else {
        quitOnAdFramesDeref.resolve();
    }
    return quitOnAdFramesDeref.promise();
};

var jqueryInit = function(c) {
    if (typeof c.$ === "undefined") c.$ = c.$ || unsafeWindow.$ || window.$ || null;
    if (typeof c.jQuery === "undefined") c.jQuery = c.jQuery || unsafeWindow.jQuery || window.jQuery || null;
    var jqueryInitDeref = new jQuery.Deferred();
    jqueryInitDeref.resolve();
    return jqueryInitDeref.promise();
};

var constInit = function(c) {
    var constInitDeref = new jQuery.Deferred();

    country_idInit(c);
    states_idInit(c);
    
    constInitDeref.resolve();
    return constInitDeref.promise();
};

start(this);
