// ==UserScript==
// @name        Baka extensions tool
// @version     1.12
// @namespace   baka-extensions-tool
// @updateURL   https://raw.githubusercontent.com/xzfc/baka-extensions-tool/master/baka_extentsions_tool.user.js
// @include     http://agar.io/*
// @grant       none
// ==/UserScript==

(function() {
    setConf({wsUri: "ws://89.31.114.117:8000/",
             quickTemplates: [["Покорми", "Не корми"],
                              ["Взорви колючку", "Пульни колючку"],
                              ["Возьми мои ошмётки", "Не бери мои ошмётки"]],
             teams:{
                 baka:{aura: "#00f",
                       names: [/[⑨Ø]/,
                               "Alice M.", "DUKE NUKEM", "H-hauau Q.Q", "HakureiのMiko",
                               "Kongo-san", "MarisaB", "OxykomaFan", "QRBG-Chan",
                               "Reimu", "Rika Nippa", "Колчанька", "Сырно не дура",
                               "Умничка", "Хуйле", "桜華さん"]
                      },
                 tuc:{names: /\[TUC\]/},
                 pkb:{aura: "#ff0",
                      names: /\bpkb\b/i}
             },
             myAura: "#fff",
             bakaAura: "#000",
             defaultTeamAura: "#f00",
            })
    var myName = ""
    var chatactive = false
    var serverRestart = false
    var blackRibbon = true

    var defaultName = "Безымянная сырно"
    function g(id) {return document.getElementById(id)}

    function setConf(defaults) {
        if(window.bakaconf === undefined)
            window.bakaconf = {}
        for(var i in defaults)
            if (window.bakaconf[i] === undefined)
                window.bakaconf[i] = defaults[i]
    }

    function join(l) {
        if(l.length <= 1)
            return l
        result = []
        for(var i = 0; i < l.length; i++) {
            result.push(l[i])
            if(i < l.length-2)
                result.push(", ")
            else if(i == l.length-2)
                result.push(" и ")
        }
        return result
    }

    var currentTimeFormat = 0
    function formatTime(t) {
        function pad(number) { return (number < 10) ? '0' + number : number }
        t = new Date(t*1000 + 1000*60*60*3)
        var h = pad(t.getUTCHours()), m = pad(t.getUTCMinutes()), s = pad(t.getUTCSeconds())
        switch(currentTimeFormat % 3) {
        case 0: return  h+':'+m+':'+s+' '
        case 1: return  h+':'+m+' '
        case 2: return ''
        }
    }
    function reformatTime() {
        currentTimeFormat ++
        var l = document.getElementsByClassName("time")
        for(var i = 0; i < l.length; i++)
            l.item(i).textContent = formatTime(l.item(i).getAttribute("T"))
    }

    var chatHidden = false
    function chatHider() {
        chatHidden = !chatHidden
        g('cbox').style.visibility = (chatHidden ? 'hidden' : '')
        updateNotification()
    }

    var mapHidden = false
    function mapHider() {
        mapHidden = !mapHidden
        g('map').style.visibility = (mapHidden ? 'hidden' : '')
    }

    var unreadCount = 0
    function updateNotification() {
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

    var chatUsersCount = 0
    function setChatUsersCount(add, value) {
        if (add)
            chatUsersCount += value
        else
            chatUsersCount = value

        g("chat_users").textContent = (chatUsersCount >= 0) ? chatUsersCount : "#"
    }

    function connectChat() {
        function reconnectButton(e) {
            e = e || window.event;e = e.target || e.srcElement
            e.parentNode.removeChild(e)
            connectChat()
        }
        websocket = new WebSocket(window.bakaconf.wsUri)
        websocket.onopen = function(evt) {
            send({t: "version", version: GM_info.script.version, expose: (window.agar===undefined?0:1) })
            send({t: "name", "name": myName})
        }
        websocket.onclose = function(evt) {
            setChatUsersCount(false, -1)
            if (serverRestart) {
                serverRestart = false
                return setTimeout(connectChat, 500)
            } else {
                addLine({message:["Вебсокет закрыт. ", aButton("переподключиться к вебсокету", reconnectButton)]})
            }
            unreadCount += 1;updateNotification()
        }
        websocket.onerror = function(evt) { addLine({message:"Ошибка вебсокета"}) }
        websocket.onmessage = function(evt) {
            var d = JSON.parse(evt.data)
            switch(d.t) {
            case "names":
                d.names = d.names.map(function(n) { return typeof n == "string" ? n : n.name })
                var namesList = d.names.filter(function(n) { return n !== "" }).map(aName)
                var nonameCount = d.names.length - namesList.length
                var iHaveNoName = g('nick').value === ""
                if(nonameCount === 0) {/* do nothing */}
                else if(nonameCount === 1)
                    namesList.push("одна безымянная сырно" + (iHaveNoName?" (это ты)":""))
                else
                    namesList.push(nonameCount + " безымянных сырно" + (iHaveNoName?" (включая тебя)":""))
                addLine({time:d.T, message: [].concat(["В чате "], join(namesList), ["."])})
                setChatUsersCount(false, d.names.length)
                break
            case "message":
                addLine({time:d.T, sender:d.f, message:formatMessage(d.text)})
                unreadCount += 1;updateNotification()
                break
            case "quick":
                addLine({time:d.T, sender:d.f, message:"[" + d.text + "]"})
                unreadCount += 1;updateNotification()
                break
            case "name":
                addLine({time:d.T, message: [aName(d.f), " теперь ", aName(d.name), "."]})
                break
            case "map":
                drawMap(d.data)
                break
            case "join":
                if (d.f !== "")
                    addLine({time:d.T, message: [aName(d.f), " заходит."]})
                setChatUsersCount(true, +1)
                break
            case "leave":
                if (d.f !== "")
                    addLine({time:d.T, message: [aName(d.f), " выходит."]})
                setChatUsersCount(true, -1)
                break
            case "ping":
                d.t = 'pong'
                send(d)
                break
            case "restart":
                addLine({time:d.T, message:["Сейчас сервер будет перезапущен"]})
                serverRestart = true
                break
            }
        }
    }

    function topScreenshot() {
        var canvas = document.getElementById("canvas")
        var data = canvas.getContext('2d').getImageData(canvas.width-220, 0, 220, 320)

        var top_canvas = document.createElement("canvas")
        top_canvas.width = 220
        top_canvas.height = 320
        top_canvas.getContext('2d').putImageData(data, 0, 0)
        return top_canvas.toDataURL()
    }

    function downloadTopScreenshot() {
        var a = document.createElement('a')
        a.setAttribute('download', 'top.png')
        a.setAttribute('href', topScreenshot())
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    function clickName(e) {
        e = e || window.event;e = e.target || e.srcElement
        var ca = document.getElementById('carea')
        ca.value = e.textContent + ": " + ca.value
        ca.focus()
        return false
    }

    function aButton(text, action, className) {
        var a = document.createElement('a')
        a.href = "javascript:void(0)"
        if (className)
            a.className = className
        a.onclick = action
        a.textContent = text
        return a
    }

    function aName(name) {
        return aButton(name||defaultName, clickName, "name")
    }

    function formatMessage(text) {
        var addrRe = /(ws:\/\/\d+\.\d+\.\d+\.\d+:\d+)/
            var i, node, result = text.split(addrRe)
        if (text.indexOf(g('nick').value||defaultName) > -1)
            result.higlight = true
        for (i = 1; i < result.length; i += 2)
            result[i] = aButton(result[i], window.connect.bind(undefined, result[i]))
        return result
    }

    function addLine(p) {
        var d = document.createElement('div')

        if(p.time !== undefined) {
            var time = document.createElement('span')
            time.className = "time"
            time.textContent = formatTime(p.time)
            time.setAttribute("T", time)
            d.appendChild(time)
        }

        if(p.sender !== undefined) {
            d.appendChild(aName(p.sender))
            d.appendChild(document.createTextNode(": "))
        }

        if(p.message !== undefined) {
            if(typeof p.message === "string")
                p.message = [p.message]
            var message = document.createElement('span')
            p.message.forEach(function(i) {
                if (typeof i === "string")
                    message.appendChild(document.createTextNode(i))
                else
                    message.appendChild(i)
            })
            if (p.message.higlight)
                message.className = "higlight"
            d.appendChild(message)
        }

        var msgbox = document.getElementById('msgsbox')
        msgbox.appendChild(d)
        msgbox.lastChild.scrollIntoView()
    }

    function send(a) {
        if(websocket.readyState == 1)
            websocket.send(JSON.stringify(a))
    }
    window.send = send

    function sendAddr() {
        if(window.agar === undefined ||
           window.agar.ws === undefined ||
           window.agar.top === undefined ||
           window.agar.top.length === 0)
            return false
        var ws = window.agar.ws
        if (ws[ws.length-1] == '/')
            ws = ws.substring(0, ws.length-1)
        var top = agar.top.map(function(x){return (x.name||"An unnamed cell")})
        send({t: "message", text: "connect('" + ws + "') Топ: " + top.join(", ")})
        return true
    }

    function submit(e) {
        var ca = document.getElementById('carea')

        if(ca.value != "") {
            var n = document.getElementById('nick')
            if (myName != n.value) {
                myName = n.value
                send({t: "name", name:myName})
            }
            if(ca.value[0] == "/")
                switch(ca.value) {
                case "/names":
                    send({t:"names"}); break
                case "/addr":
                    sendAddr(); break
                default:
                    addLine({message: ["Команды чата:"]})
                    addLine({message: ["/names — получить список сырн в чате"]})
                    addLine({message: ["/addr — отправить текущий севрер и топ (требуется expose)"]})
                }
            else
                send({t: "message", text: ca.value})
            ca.value = ""
            ca.blur()
        }
        return false
    }

    function handleKeys() {
        var defaultPosition = true
        var move = function () {
            defaultPosition = !defaultPosition
            g('cbox').style.bottom = g('cbox').style.right = (defaultPosition ? '0' : '')
            g('cbox').style.top = g('cbox').style.left = (defaultPosition ? '' : '0')
        }

        var olddown = window.onkeydown, oldup = window.onkeyup
        var repeat = 0
        var extended = false
        window.onkeydown = function(e) {
            if(extended) {
                if(e.keyCode == 16) return false
                var cmd = window.bakaconf.quickTemplates[e.keyCode - 49]
                if (cmd !== undefined) {
                    cmd = cmd[e.shiftKey?1:0]
                    if (cmd !== undefined)
                        send({t:"quick", text:cmd})
                }
                quickHint.style.visibility = 'hidden'
                extended = false
                return false
            }

            if (chatactive)
                if (e.keyCode == 27 || e.keyCode == 9) {
                    g('carea').blur()
                    return false
                } else return true

            if (e.ctrlKey && e.keyCode === 83) {
                downloadTopScreenshot()
                return false
            }

            if(!e.altKey && !e.shiftKey && !e.ctrKey && !e.metaKey) {
                switch(e.keyCode) {
                case 9: g('carea').focus(); return false
                case 49: chatHider(); return true
                case 50: reformatTime(); return true
                case 51: move(); return true
                case 52: extended = true; quickHint.style.visibility = ''; return true
                case 53: mapHider(); return true
                case 81: repeat = 1; return true
                }
            }
            return olddown(e)
        }
        window.onkeyup = function(e) {
            switch(e.keyCode) {
            case 81: repeat = 0;break
            default: return oldup(e)
            }
        }
        var k = {keyCode: 87}
        setInterval(function() {
            if (!repeat) return
            olddown(k)
            oldup(k)
        }, 50)
    }

    function handleSetNick() {
        var oldSetNick = window.setNick
        window.setNick = function(n) {
            if (n !== myName) {
                myName = n
                send({t: "name", "name": myName})
            }
            oldSetNick(n)
        }
    }

    function sendMap() {
        var a = window.agar
        if (a === undefined || a.allCells === undefined || a.myCells === undefined || a.top === undefined || a.ws === "") {
            if (!mapHidden)
                send({t:'map', reply:1})
            return
        }
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
        send({t:'map', all:cells, my:a.myCells, top:top, reply:mapHidden?0:1})
        blackRibbon = false
    }

    function sendMapThread() {
        if (window.agar === undefined)
            addLine({message:["Карта отправляться не будет :<"]})
        setInterval(sendMap, 1000)
    }

    function drawMap(data) {
        if (mapHidden)
            return
        var map = document.getElementById("map")
        var context = map.getContext('2d')
        var myCells = ((window.agar || {}).myCells) || []
        var teams = window.bakaconf.teams
        function getAura(cell) {
            if(myCells.indexOf(cell.i) > -1)
                return window.bakaconf.myAura
            if(cell.a)
                return window.bakaconf.bakaAura
            for(var i in teams) {
                var names = teams[i].names
                if(names instanceof RegExp || typeof names === 'string')
                    names = [names]
                for(var j = 0; j < names.length; j++)
                    if(names[j] === cell.n ||
                       (names[j] instanceof RegExp && names[j].test(cell.n)))
                        return teams[i].aura || window.bakaconf.defaultTeamAura
            }
        }

        context.clearRect(0 , 0, canvas.width, canvas.height)
        context.globalAlpha = 0.5
        context.fillStyle = "#777"
        context.fillRect(0 , 0, canvas.width, canvas.height)
        var scale = 256/11180
        var i

        if (blackRibbon) {
            context.beginPath()
            context.lineWidth = 32
            context.strokeStyle = "#000"
            context.beginPath();
            context.moveTo(256-96-32,256+32);
            context.lineTo(256+32,256-96-32);
            context.stroke()
            context.fill()
        }

        context.globalAlpha = .4
        for(i = 0; i < data.length; i++) {
            var aura = getAura(data[i])
            if(aura) {
                context.fillStyle = aura
                context.beginPath()
                context.arc(data[i].x*scale, data[i].y*scale,
                            data[i].s*scale+4, 0, 2 * Math.PI, false)
                context.fill()
            }
        }

        context.lineWidth = 2
        for(i = 0; i < data.length; i++) {
            context.beginPath()
            context.arc(data[i].x*scale, data[i].y*scale,
                        data[i].s*scale, 0, 2 * Math.PI, false)
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

    function init() {
        var stl = document.createElement('style')
        stl.textContent = '#cbox {background: black; position:fixed; z-index:205; bottom:0; right:0; width:400px; opacity:0.5; color:white;}' +
            '#carea { width: 100%; color: black}' +
            '#form {margin: 0;}' +
            '#msgsbox { overflow: auto; word-wrap: break-word; width:400px; height: 250px; }' +
            '#msgsbox .name {color: #AAA;}' +
            '#msgsbox .higlight {color: #faa}' +
            '#msgsbox .time {font-size: 70%; color: #777;}'+
            '#notification {background: red; position:fixed; z-index:205; bottom:5px;right:5px;opacity:0.5;color:white}'+
            '#quickHint {background: #777; position:fixed; z-index:120; top:0; left:0; color:white;}'+
            '#quickHint .key {font-weight: bold;margin-right: 1em;}'+
            '#map {position: fixed; bottom: 5px; left: 5px; z-index:205; border: 1px black solid;}'
        document.body.appendChild(stl)

        var cbox = document.createElement('table')
        cbox.cellpadding = cbox.cellspacing = 0
        cbox.id = 'cbox'
        cbox.innerHTML = '<tr><td colspan="2"><div id="msgsbox"></div></td></tr>' +
            '<tr height="0">' +
            '<td width="100%"><form id="form"><input id="carea" autocomplete="off"></input></form></td>' +
            '<td id="chat_users"></td>' +
            '</tr>'
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
        for(var i = 0; i < window.bakaconf.quickTemplates.length; i++) {
            addQuickHint(1+i, window.bakaconf.quickTemplates[i][0])
            addQuickHint("Shift + " + (1+i), window.bakaconf.quickTemplates[i][1])
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
        sendMapThread()
        map.onmousemove = notification.onmousemove = cbox.onmousemove =
            g("canvas").onmousemove
        map.onclick = function() { blackRibbon = false }
        notification.onclick = chatHider
    }

    function wait() {
        if (!window.onkeydown || !window.onkeyup ||
            !window.setNick || !g("canvas").onmousemove)
            return setTimeout(wait, 100)
        init()
    }
    wait()
})()
