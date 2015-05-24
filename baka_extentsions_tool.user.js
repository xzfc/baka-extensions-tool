// ==UserScript==
// @name        Baka extensions tool
// @include     http://agar.io/*
// @version     1.8
// @grant       none
// ==/UserScript==

(function() {
    var g = function(id) {return document.getElementById(id)}
    var chatactive = false
    var myName = ""
    var wsUri = "ws://89.31.114.117:8000/";
    var quickTemplates = [["Покорми", "Не корми"],
                          ["Взорви колючку", "Пульни колючку"],
                          ["Возьми мои ошмётки", "Не бери мои ошмётки"]]
    var allyName = /([⑨Ø]|^Умничка$|^Rika Nippa$|^HakureiのMiko$|^H-hauau Q\.Q$|^Reimu$)/

    var join = function(l) {
        if (l.length == 0)
            return "";
        if (l.length == 1)
            return l[0];
        return l.slice(0, -1).join(", ") + " и " + l[l.length-1]
    }
    
    var pad = function(number) {
        if (number < 10)
            return '0' + number;
        return number
    }
    
    var currentTimeFormat = 0
    var formatTime = function (t) {
        t = new Date(t*1000 + 1000*60*60*3)
        var h = pad(t.getUTCHours()), m = pad(t.getUTCMinutes()), s = pad(t.getUTCSeconds())
        switch(currentTimeFormat % 3) {
            case 0: return  h+':'+m+':'+s+' ';
            case 1: return  h+':'+m+' ';
            case 2: return '';
        }
    }
    var reformatTime = function() {
        currentTimeFormat ++
        var l = document.getElementsByClassName("time");
        for(var i = 0; i < l.length; i++)
            l.item(i).textContent = formatTime(l.item(i).getAttribute("T"))
    }
    
    var chatHidden = false
    var chatHider = function () {
        chatHidden = !chatHidden
        g('cbox').style.visibility = (chatHidden ? 'hidden' : '')
        updateNotification()
    }
    
    var mapHidden = false
    var mapHider = function () {
        mapHidden = !mapHidden
        g('map').style.visibility = (mapHidden ? 'hidden' : '')
    }
    
    var unreadCount = 0
    var updateNotification = function() {
        var n = g("notification")
        if (!chatHidden) {
            unreadCount = 0
            n.style.visibility =  'hidden'
        } else {        
            if(unreadCount) {
                n.textContent = unreadCount
                n.style.visibility =  ''
            } else {
                n.style.visibility =  'hidden'
            }
        }
    }

    var nononame = function (n) {
        return n === "" ?  "Безымянная Сырна" : n
    }
    
    var chatUsersCount = 0
    var setChatUsersCount = function (add, value) {
        if (add)
            chatUsersCount += value;
        else
            chatUsersCount = value;
        
        g("chat_users").textContent = (chatUsersCount >= 0) ? chatUsersCount : "#"
    }

    var connectChat = function () {
        var reconnect = function(e) {
            e = e || window.event;e = e.target || e.srcElement;
            e.parentNode.removeChild(e)
            connectChat()
        }
        websocket = new WebSocket(wsUri);
        websocket.onopen = function(evt) {
            send({t: "name", "name": myName})
        }
        websocket.onclose = function(evt) {
            addLine(undefined, "", "Вебсокет закрыт", ["переподключиться к вебсокету", reconnect])
            setChatUsersCount(false, -1)
            unreadCount += 1;updateNotification()
        }
        websocket.onerror = function(evt) { addLine(undefined, "", "Ошибка вебсокета"); };
        websocket.onmessage = function(evt) {
            var d = JSON.parse(evt.data)
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
                        addLine(d.T, "", "В чате " + join(names) + ".")
                        setChatUsersCount(false, d.names.length)
                    }
                    break;
                case "message":
                    addLine(d.T, nononame(d.f), d.text)
                    unreadCount += 1;updateNotification()
                    break;
                case "quick":
                    addLine(d.T, nononame(d.f), "[" + d.text + "]")
                    unreadCount += 1;updateNotification()
                    break;
                case "name":
                    addLine(d.T, "", nononame(d.f) + " теперь " + nononame(d.name))
                    break;
                case "map":
                    drawMap(d.data)
                    break
                case "join":
                    if (d.f !== "")
                        addLine(d.T, "", d.f + " заходит");
                    setChatUsersCount(true, +1)
                    break;
                case "leave":
                    if (d.f !== "")
                        addLine(d.T, "", d.f + " выходит");
                    setChatUsersCount(true, -1)
                    break;
            }
        }
    }

    var topScreenshot = function() {
        var canvas = document.getElementById("canvas")
        var data = canvas.getContext('2d').getImageData(canvas.width-220, 0, 220, 320)

        var top_canvas = document.createElement("canvas")
        top_canvas.width = 220
        top_canvas.height = 320
        top_canvas.getContext('2d').putImageData(data, 0, 0)
        return top_canvas.toDataURL()
    }

    var downloadTopScreenshot = function() {
        var a = document.createElement('a')
        a.setAttribute('download', 'top.png')
        a.setAttribute('href', topScreenshot())
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
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
        
        if(time !== undefined) {
            var time_ = document.createElement('span')
            time_.className = "time"
            time_.textContent = formatTime(time)
            time_.setAttribute("T", time)
            d.appendChild(time_)
        }

        if(name != "") {
            var name_ = document.createElement('a')
            name_.href = "javascript:void(0)"
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
            button_.href = "javascript:void(0)"
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
            var n = document.getElementById('nick')
            if (myName != n.value) {
                myName = n.value
                send({t: "name", name:myName})
            }
            if(ca.value == "/names")
                send({t:"names"});
            else
                send({t: "message", text: ca.value})
            ca.value = ""
        }
        return false
    }

    var handleKeys = function () {
        var defaultPosition = true
        var move = function () {
            defaultPosition = !defaultPosition
            g('cbox').style.bottom = g('cbox').style.right = (defaultPosition ? '0' : '')
            g('cbox').style.top = g('cbox').style.left = (defaultPosition ? '' : '0')
        }

        var olddown = window.onkeydown, oldup = window.onkeyup;
        var repeat = 0;
        var extended = false;
        window.onkeydown = function(e) {
            if(extended) {
                if(e.keyCode == 16) return false;
                var cmd = quickTemplates[e.keyCode - 49]
                if (cmd !== undefined) {
                    cmd = cmd[e.shiftKey?1:0];
                    if (cmd !== undefined)
                        send({t:"quick", text:cmd});
                }
                quickHint.style.visibility = 'hidden'
                extended = false;
                return false;
            }
            
            if (chatactive)
                if (e.keyCode == 27 || e.keyCode == 9) {
                    g('carea').blur();
                    return false;
                } else return true;
            
            if (e.ctrlKey && e.keyCode === 83) {
                downloadTopScreenshot();
                return false;
            }

            if(!e.altKey && !e.shiftKey && !e.ctrKey && !e.metaKey) {
                switch(e.keyCode) {
                    case 9: g('carea').focus(); return false;
                    case 49: chatHider(); return true;
                    case 50: reformatTime(); return true;
                    case 51: move(); return true;
                    case 52: extended = true; quickHint.style.visibility = ''; return true;
                    case 53: mapHider(); return true;
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
    
    var handleSetNick = function() {
        var oldSetNick = window.setNick
        window.setNick = function(n) {
            if (n !== myName) {
                myName = n
                send({t: "name", "name": myName})
            }
            oldSetNick(n)
        }
    }
    
    var sendMap = function() {
        var a = window.agar
        if (a.allCells === undefined || a.myCells === undefined || a.top === undefined)
            return;
        var cells = a.allCells.filter(function(c){
            return c.size >= 32 || a.myCells.indexOf(c.id) > -1
        }).map(function(c){
            return {x:c.x,
                    y:c.y,
                    i:c.id,
                    n:c.name,
                    c:c.color,
                    s:c.size,
                    v:c.isVirus?1:0}
        })
        var top = a.top.map(function(x){return [x.id, x.name]})
        send({t:'map', all:cells, my:a.myCells, top:top, reply:mapHidden?1:0})
    }
    
    var sendMapThread = function() {
        if (window.agar === undefined)
            return addLine(undefined, "", "Карты не будет :<");
        setInterval(sendMap, 1000)
    }
    
    var drawMap = function(data) {
        if (mapHidden)
            return;
        var map = document.getElementById("map")
        var context = map.getContext('2d')
        
        context.clearRect(0 , 0, canvas.width, canvas.height)
        context.globalAlpha = 0.5
        context.fillStyle = "#777"
        context.fillRect(0 , 0, canvas.width, canvas.height)
        var scale = 256/11180
        var i
        
        context.globalAlpha = .4
        for(i = 0; i < data.length; i++) {
            var a = data[i].a, m = window.agar.myCells.indexOf(data[i].i) > -1, t = allyName.test(data[i].n)
            if(a || m || t) {
                context.fillStyle = m ? "#fff" : (a ? "#000" :  "#00f")
                context.beginPath()
                context.arc(data[i].x * scale, data[i].y * scale, data[i].s*scale+4, 0, 2 * Math.PI, false)
                context.fill()
            }
        }
        
        context.lineWidth = 2
        for(i = 0; i < data.length; i++) {
            context.beginPath()
            context.arc(data[i].x * scale, data[i].y * scale, data[i].s*scale, 0, 2 * Math.PI, false)
            context.globalAlpha = 1
            context.fillStyle = data[i].c
            context.fill()
            if(data[i].v) {
                context.strokeStyle = "#ff0000"
            } else {
                context.globalAlpha = .1
                context.strokeStyle = "#000000"
            }
            context.stroke()
        }
    }
    window.sendMap = sendMap

    var init = function() {
        var stl = document.createElement('style')
        stl.textContent = '#cbox {background: black; position:fixed; z-index:100; bottom:0; right:0; width:400px; opacity:0.5; color:white;} ' +
            '#carea { width: 100%; color: black}' +
            '#form {margin: 0;}' +
            '#msgsbox { overflow: auto; word-wrap: break-word; width:100%; height: 250px; }' +
            '#msgsbox .name {color: #AAA;}' +
            '#msgsbox .higlight {color: #faa}' +
            '#msgsbox .time {font-size: 70%; color: #777;}'+
            '#notification {background: red; position:fixed; z-index:100; bottom:5px;right:5px;opacity:0.5;color:white}'+
            '#quickHint {background: #777; position:fixed; z-index:120; top:0; left:0; color:white;}'+
            '#quickHint .key {font-weight: bold;margin-right: 1em;}'+
            '#map {position: fixed; bottom: 5px; left: 5px; z-index:100; border: 1px black solid;}';
        document.body.appendChild(stl)

        var cbox = document.createElement('table')
        cbox.cellpadding = cbox.cellspacing = 0
        cbox.id = 'cbox'
        cbox.innerHTML = '<tr><td colspan="2"><div id="msgsbox"></div></td></tr>' +
            '<tr height="0">' + 
            '<td width="100%"><form id="form"><input id="carea" autocomplete="off"></input></form></td>' +
            '<td id="chat_users"></td>' +
            '</tr>';
        document.body.appendChild(cbox)
        
        var notification = document.createElement('div')
        notification.id = "notification"
        document.body.appendChild(notification)
        
        var quickHint = document.createElement('div')
        quickHint.id = "quickHint"
        var addQuickHint = function (key, text) {
            var line = document.createElement('div')
            
            var key_ = document.createElement('span')
            key_.textContent = key
            key_.className = 'key'
            line.appendChild(key_)
            
            var text_ = document.createElement('span')
            text_.textContent = text
            text_.className = 'text'
            line.appendChild(text_)
            
            quickHint.appendChild(line)
        }
        for(var i = 0; i < quickTemplates.length; i++) {
            addQuickHint(1+i, quickTemplates[i][0])
            addQuickHint("Shift + " + (1+i), quickTemplates[i][1])
        }
        quickHint.style.visibility = 'hidden'
        document.body.appendChild(quickHint)
        
        var map = document.createElement("canvas")
        map.id = "map"
        map.width = 256
        map.height = 256
        document.body.appendChild(map)

        g('form').onsubmit = submit
        g('carea').onfocus = function () {
            chatactive = true
            g('cbox').style.opacity = '0.6'
        }
        g('carea').onblur = function () {
            chatactive = false
            g('cbox').style.opacity = '0.5'
        }
        
        g("chat_users").onclick = function() { send({t:'names'}) }
        
        handleSetNick()
        handleKeys()
        connectChat()
        sendMapThread();mapHider()
        map.onmousemove = notification.onmousemove = cbox.onmousemove = g("canvas").onmousemove
        notification.onclick = chatHider
    }

    var wait = function() {
        if (!window.onkeydown || !window.onkeyup || !window.setNick || !g("canvas").onmousemove)
            return setTimeout(wait, 100);
        init()
    }
    wait()
})()
