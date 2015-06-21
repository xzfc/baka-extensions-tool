// ==UserScript==
// @name        Petridish.pw Expose
// @version     1.0
// @namespace   baka-extensions-tool
// @updateURL   https://raw.githubusercontent.com/xzfc/baka-extensions-tool/master/expose-petridish.user.js
// @include     http://petridish.pw/*
// @run-at      document-start
// @grant       none
// ==/UserScript==

if (window.top != window.self)
    return

function runExpose(){
    if (document.readyState !== 'loading')
        return console.error("Expose: this script should run at document-start")

    for(var i = 0; i < document.head.childNodes.length; i++)
        if(tryReplace(document.head.childNodes[i]))
            return

    function observerFunc(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var addedNodes = mutations[i].addedNodes
            for (var j = 0; j < addedNodes.length; j++)
                if(tryReplace(addedNodes[j])) {
                    observer.disconnect()
                    return
                }
        }
    }
    var observer = new MutationObserver(observerFunc)
    observer.observe(document.head, {childList: true})
}

runExpose()

function tryReplace(node) {
    if (!/\/engine\/main[0-9]+.js\?/.test(node.src))
        return false
    document.head.removeChild(node)
    
    var request = new XMLHttpRequest()
    request.onload = function() {
        var script = document.createElement("script")
        script.innerHTML = modify(this.responseText)
        insertScript(script)
        console.log("Expose: replacement done")
    }
    request.onerror = function() { console.error("Expose: response was null") }
    request.open("get", node.src, true)
    request.send()
    
    return true
}

function insertScript(script) {
    if (typeof jQuery === "undefined")
        return setTimeout(insertScript, 0, script)
    document.head.appendChild(script)
}

function modify(text) {
    var reset = ""
    function replace(what, from, to, defaultValue) {
        var newText = text.replace(from, to)
        if(newText === text) {
            console.error("Expose: " + what + " replacement failed!")
        } else {
            text = newText
            if(defaultValue !== undefined)
                reset += "window.agar." + what + "=" + defaultValue + ";"
        }
    }
    replace("allCells", /if \(blobs\.hasOwnProperty\(id\)\) {/,   "window.agar.allCells=blobs;" + "$&",       '{}')
    replace("myCells",  /case 32:/,                               "$&" + "window.agar.myCells=ids;",          '[]')
    replace("top",      /case 49:(.|\n|\r){0,400}users = \[\];/,  "$&" + "window.agar.top=users;",            '[]')
    replace("ws",       /new WebSocket\((\w+)[^;]+?;/,            "$&" + "window.agar.ws=$1;",                '""')
    replace("reset",    /new WebSocket\(\w+[^;]+?;/,   "$&" + reset)

    return "window.agar={};" + reset + text
}
