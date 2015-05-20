// ==UserScript==
// @name        Baka extensions tool
// @include     http://agar.io/*
// @grant       none
// ==/UserScript==

(function() {
    var g = function(id) {return document.getElementById(id);}
    var chatactive = false;

    var join = function(l) {
        if (l.length == 0)
            return "";
        if (l.length == 1)
            return l[0];
        return l.slice(0, -1).join(", ") + " и " + l[l.length-1]
    }

    var nononame = function (n) {
        return n === "" ?  "Безымянная Сырна" : n
    }

    var connectChat = function () {
        var reconnect = function(e) {
            e = e || window.event;e = e.target || e.srcElement;
            e.parentNode.removeChild(e)
            connectChat()
        }
        var wsUri = "ws://89.31.114.117:8000/";
        websocket = new WebSocket(wsUri);
        websocket.onopen = function(evt) { console.log(evt); };
        websocket.onclose = function(evt) { console.log(evt); addLine(0, "", "Вебсокет закрыт", ["переподключиться к вебсокету", reconnect]); };
        websocket.onerror = function(evt) { console.log(evt); addLine(0, "", "Ошибка вебсокета"); };
        websocket.onmessage = function(evt) {
            var d = JSON.parse(evt.data)
            d.f = nononame(d.f)
            switch(d.t) {
                case "names":
                    {
                        var names = d.names.filter(function(n) { return n !== "" })
                        var nonames = d.names.length - names.length;
                        var iHaveNoName = g('nick').value === ""
                        if(nonames == 0);
                        else if(nonames == 1)
                            names.push("одна безымянная Сырна" + (iHaveNoName?" (это ты)":""));
                        else if(nonames <= 4)
                            names.push(nonames + " безымянных Сырны" + (iHaveNoName?" (включая тебя)":""));
                        else
                            names.push(nonames + " безымянных Сырн" + (iHaveNoName?" (включая тебя)":""));
                        addLine(0, "", "В чате " + join(names) + ".")
                    }
                    break;
                case "message":
                    addLine(d.T, d.f, d.text)
                    break;
                case "name":
                    addLine(d.T, "", d.f + " теперь " + nononame(d.name))
                    break;
                case "join":
                    addLine(d.T, "", d.f + " заходит")
                    break;
                case "leave":
                    addLine(d.T, "", d.f + " выходит")
                    break;
            }
        }
    }

    var clickName = function (e) {
        e = e || window.event;e = e.target || e.srcElement;
        var ca = document.getElementById('carea')
        ca.value = e.textContent + ": " + ca.value
        ca.focus()
        return false
    }

    var addLine = function (time, name, text, button) {
        var d = document.createElement('div')

        if(name != "") {
            var name_ = document.createElement('a')
            name_.href = "#"
            name_.className = "name"
            name_.onclick = clickName
            name_.textContent = name
            d.appendChild(name_)
            d.appendChild(document.createTextNode(": "))
        }

        var text_ = document.createElement('span')
        text_.textContent = text
        if (name != "" && text.indexOf(nononame(g('nick').value)) > -1)
            text_.className = "higlight";

        d.appendChild(text_)

        if(button !== undefined) {
            var button_ = document.createElement('a')
            button_.href = "#"
            button_.onclick = button[1]
            button_.textContent = button[0]
            d.appendChild(document.createTextNode(" "))
            d.appendChild(button_)
        }

        var msgbox = document.getElementById('msgsbox')
        msgbox.appendChild(d)
        msgbox.lastChild.scrollIntoView()
    }

    var send = function (a) {
        websocket.send(JSON.stringify(a))
    }

    var submit = function(e) {
        var ca = document.getElementById('carea')
        if(ca.value != "") {
            var m = {t: "message", text: ca.value, f: document.getElementById('nick').value}
            send(m)
            ca.value = ""
        }
        return false
    }

    var handleKeys = function () {
        var ishidden = false
        var hider = function () {
            ishidden = !ishidden
            g('cbox').style.display = (ishidden ? 'none' : '')
        }

        var olddown = window.onkeydown, oldup = window.onkeyup;
        var repeat = 0;
        window.onkeydown = function(e) {
            if (chatactive)
                if (e.keyCode == 27 || e.keyCode == 9) {
                    g('carea').blur();
                    return false;
                } else return true;

            if(!e.altKey && !e.shiftKey && !e.ctrKey && !e.metaKey) {
                switch(e.keyCode) {
                    case 9: g('carea').focus(); return false;
                    case 49: hider(); return true;
                    case 81: repeat = 1; return true;
                }
            }
            return olddown(e);
        };
        window.onkeyup = function(e) {
            switch(e.keyCode) {
                case 81: repeat = 0;break;
                default: return oldup(e)
            }
        };	
        var k = {keyCode: 87};
        setInterval(function() {
            if (!repeat) return;
            olddown(k);oldup(k);
        }, 50)
    }

    var init = function() {
        var stl = document.createElement('style')
        stl.innerHTML = '#cbox {background: black; position:fixed; z-index:100; bottom:0; right:0; width:400px; height:250px; opacity:0.5; color:white;} #carea {width:100%; color:black; height: 30px;} #msgsbox {height: 220px; overflow: auto;} #cbox .name {color: #AAA;} .higlight {color: #faa}'
        document.body.appendChild(stl)

        var cbox = document.createElement('div')
        cbox.id = 'cbox'
        cbox.innerHTML = '<div id="msgsbox"></div><div id="cform"><form id="form"><input id="carea" autocomplete="off"></input></div><div id="lpltrigger"></div>'
        document.body.appendChild(cbox)

        g('form').onsubmit = submit
        g('carea').onfocus = function () {
            chatactive = true
            g('cbox').style.opacity = '0.6'
        }
        g('carea').onblur = function () {
            chatactive = false
            g('cbox').style.opacity = '0.5'
        }
        handleKeys()
        connectChat()
    }

    window.addEventListener('load', init)
})()
