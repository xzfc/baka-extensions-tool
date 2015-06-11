// ==UserScript==
// @name        Baka extensions tool
// @version     1.17
// @namespace   baka-extensions-tool
// @updateURL   https://raw.githubusercontent.com/xzfc/baka-extensions-tool/master/baka_extentsions_tool.user.js
// @include     http://agar.io/*
// @grant       none
// ==/UserScript==

(function() {
    setConf({wsUri: "ws://89.31.114.117:8000/",
             quickTemplates: {
                 _049: [['К', 'Покорми'],
                        ['!К', 'Не корми']],
                 _050: [['ВК', 'Взорви колючку'],
                        ['ПК', 'Пульни колючку']],
                 _051: [['Е', 'Возьми мои ошмётки'],
                        ['!Е', 'Не бери мои ошмётки']],
	         _052: [['⧀', 'Отходим'],
                        ['⧁', 'Наступаем']],
	         _097: [['↙', 'Левый нижний угол']],
	         _098: [['↓', 'Центр внизу']],
	         _099: [['↘', 'Правый нижний угол']],
	         _100: [['←', 'Центр слева']],
	         _101: [['⨀', 'Центр']],
	         _102: [['→', 'Центр справа']],
	         _103: [['↖', 'Левый верхний угол']],
	         _104: [['↑', 'Центр сверху']],
	         _105: [['↗', 'Правый верхний угол']],
             },
             teams:{
                 baka:{aura: "#00f",
                       names: [/[⑨Ø]/,
                               "DUKE NUKEM", "Reimu", "天才　Умничка　秀才", "桜華さん"]
                      },
                 pkb: {aura: "#AA5",
                       names: [/\b(pkb|ркб|ркв)\b/i, /pkb/i]},
                 fr: {names: /[1①❶][8⑧❽]-?[2②❷][5⑤❺]/},
                 turkey: {names: [/ek[sşŞ\$][iİ]/i,
                                  /[iİ][╦T][µÜ]/i,
                                  /[ʍm][εe][†t][υuü]|ʍε†/i,
                                  /[Ծo][dԺ][tԵ][uü]/i,
                                  /\bDH\b/, /つみ|ⒹⒽ/i]},
                 eigth: {names: /ȣȣȣ|ȢȢȢ/},
                 other: {names: [/\[(\$|WAR|AOG|DH|FBI|TUC|EU|TW|AGU|T[iİ]T)\]/i,
                                 /\b(MKB|MZK|FKS|RZCW|TİT|MZDK|Mezdeke|ⓂⓋⓅ|HKG)\b/i]}
             },
             showOnlyBakaAura: false,
             myAura: "#fff",
             bakaAura: "#000",
             defaultTeamAura: "#A55",
             timeFormat: 0,
            })
    var myName = ""
    var chatactive = false
    var serverRestart = false

    var defaultName = "Безымянная сырно"
    function g(id) {return document.getElementById(id)}

    function setConf(defaults) {
        function setDefault(record, field, value) {
            if(record[field] === undefined && value !== undefined)
                record[field] = value
        }
        setDefault(window, 'bakaconf', {})
        for(var i in defaults)
            if (i != 'teams')
                setDefault(window.bakaconf, i, defaults[i])
        setDefault(window.bakaconf, 'teams', {})
        for(var i in defaults.teams)
            setDefault(window.bakaconf.teams, i, defaults.teams[i])
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

    function formatTime(t) {
        function pad(number) { return (number < 10) ? '0' + number : number }
        t = new Date(t*1000 + 1000*60*60*3)
        var h = pad(t.getUTCHours()), m = pad(t.getUTCMinutes()), s = pad(t.getUTCSeconds())
        switch(window.bakaconf.timeFormat % 3) {
        case 0: return  h+':'+m+':'+s+' '
        case 1: return  h+':'+m+' '
        case 2: return ''
        }
    }

    var chatHidden = false
    function chatHider(show) {
        chatHidden = show === undefined ? !chatHidden : !show
        g('cbox').style.visibility = (chatHidden ? 'hidden' : '')
        updateNotification()
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
        var reconnect = false, closed = false
        var ws = new WebSocket(window.bakaconf.wsUri)
        ws.onopen = function(evt) {
            send({t: "version", version: GM_info.script.version, expose: (window.agar===undefined?0:1) })
            send({t: "name", "name": myName})
        }
        ws.onclose = function(evt) {
            if (closed) return
            setChatUsersCount(false, -1)
            if (reconnect) {
                closed = true
                addLine({message:['Переподключаюсь~']})
                return connectChat()
            }
            if (serverRestart) {
                serverRestart = false
                return setTimeout(connectChat, 500)
            } else {
                addLine({message:["Вебсокет закрыт. ", aButton("переподключиться к вебсокету", reconnectButton)]})
            }
            unreadCount += 1;updateNotification()
        }
        ws.onerror = function(evt) {
            if (closed) return
            addLine({message:"Ошибка вебсокета"})
        }
        ws.reconnect = function() {
            reconnect = true
            ws.close()
            setTimeout(function() {
                if (closed) return
                closed = true
                addLine({message:['Переподключаюсь~~']})
                connectChat()
            }, 1000)
        }
        ws.onmessage = function(evt) {
            if (closed) return
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
                if (d.legacy <= 1)
                    break
                addLine({time:d.T, sender:d.f, message:formatMessage(d.text)})
                unreadCount += 1;updateNotification()
                break
            case "quick":
                var message = "[" + d.text + "]"
                if (d.symbol !== undefined)
                    message = "[" + d.symbol + ":" + d.text + "]"
                addLine({time:d.T, sender:d.f, message:message})
                unreadCount += 1;updateNotification()
                if (d.cells !== undefined)
                    map.blink(d.cells, d.symbol)
                break
            case "name":
                addLine({time:d.T, message: [aName(d.f), " теперь ", aName(d.name), "."]})
                break
            case "map":
                map.update(d.data)
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
            case "addr":
                showAddr(d.f, d.T, d.ws, d.top)
                unreadCount += 1;updateNotification()
                break
            case "restart":
                addLine({time:d.T, message:["Сейчас сервер будет перезапущен"]})
                serverRestart = true
                break
            }
        }
        websocket = ws
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
            result[i] = aButton(result[i], connector.connect.bind(connector, result[i]))
        return result
    }

    function addLine(p) {
        var d = document.createElement('div')

        if(p.time !== undefined) {
            var time = document.createElement('span')
            time.className = "time"
            time.textContent = formatTime(p.time)
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
        var scroll = msgbox.scrollTop + msgbox.offsetHeight - msgbox.scrollHeight === 0
        msgbox.appendChild(d)
        if (scroll)
            msgbox.lastChild.scrollIntoView()
        window.yoba = msgbox
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
        send({t: "message", text: "connect('" + ws + "') Топ: " + top.join(", "), legacy: 1})
        send({t: "addr", ws: window.agar.ws, top: window.agar.top})
        return true
    }

    var connector = {
        connect: function(ws) {
            this.stopAutoConnect()
            window.connect(ws)
        },
        maxAttempts: 10,
        autoConnect: function(ws, top, status) {
            if (!this.checkExpose())
                return this.connect(ws)
            this.stopAutoConnect()
            this.attempt = 0
            this.ws = ws
            this.top = top
            this.status = status
            this.autoConnectIteration()
        },
        autoConnectIteration: function() {
            if (this.checkConnection())
                return this.status.ok()
            window.connect(this.ws)
            this.status.trying(this.attempt, this.maxAttempts)
            if (++this.attempt != this.maxAttempts)
                this.timer = setTimeout(this.autoConnectIteration.bind(this), 5000)
            else
                return this.status.fail()
        },
        checkConnection: function() {
            if (window.agar.ws !== this.ws)
                return false
            var top1 = window.agar.top, top2 = this.top
            for (var i = 0; i < top1.length; i++)
                for (var j = 0; j < top2.length; j++)
                    if (top1[i].id === top2[j].id && top1[i].name === top2[j].name)
                        return true
            return false
        },
        checkExpose: function() {
            return window.agar !== undefined &&
                window.agar.ws !== undefined &&
                window.agar.top !== undefined
        },
        stopAutoConnect: function() {
            if (this.timer === undefined)
                return
            this.status.stop()
            clearTimeout(this.timer)
            this.timer = undefined
        }
    }

    function showAddr(name, time, ws, top) {
        var statusLine = document.createElement('span')
        function setStatus(text) {
            return (function() {
                statusLine.textContent = text
                aStop.textContent = ''
            })
        }
        var status = {
            ok: setStatus('[OK]'),
            fail: setStatus('[FAIL]'),
            trying: function(n, max) {
                statusLine.textContent = '['+n+'/'+max+'...]'
                aStop.textContent = 'stop'
            },
            stop: setStatus('')
        }
        var aConnect = aButton(ws, function() {
            connector.autoConnect(ws, top, status)
            return false
        })
        var aStop = aButton("", function() {
            connector.stopAutoConnect()
            return false
        })
        addLine({time:time, sender:name, message:[
            "connect('", aConnect ,"')",
            statusLine, aStop,
            " Топ: " + top.map(function(x){return x.name}).join(", ")
        ]})
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
                case "/reconnect":
                    websocket.reconnect(); break
                default:
                    addLine({message: ["Команды чата:"]})
                    addLine({message: ["/names — получить список сырн в чате"]})
                    addLine({message: ["/addr — отправить текущий севрер и топ (требуется expose)"]})
                    addLine({message: ["/reconnect — переподключиться к чатсерверу"]})
                }
            else
                send({t: "message", text: ca.value})
            ca.value = ""
            if (window.agar === undefined || window.agar.myCells === undefined || window.agar.myCells.length !== 0)
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
                if(e.keyCode >= 16 && e.keyCode <= 18) return false
                var cmd = quick.eventToAction(e)
                if (cmd !== undefined) {
                    var m = {t:"quick", symbol:cmd[0], text:cmd[1]}
                    if (window.agar !== undefined && window.agar.myCells !== undefined)
                        m.cells = window.agar.myCells
                    send(m)
                }
                quick.hide()
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
                case 9: chatHider(true); g('carea').focus(); return false
                case 49: chatHider(); return true
                case 51: move(); return true
                case 52: extended = true; quick.show(); return true
                case 53: map.toggle(); return true
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

    function handleOptions() {
        var oldSetNick = window.setNick
        window.setNick = function(n) {
            if (n !== myName) {
                myName = n
                send({t: "name", "name": myName})
            }
            oldSetNick(n)
        }
        var oldSetDarkTheme = window.setDarkTheme
        window.setDarkTheme = function(n) {
            if (n) {
                if (document.body.hasAttribute("dark"))
                    document.body.removeAttribute("dark")
                else
                    document.body.setAttribute("dark", n)
            }
            oldSetDarkTheme(n)
        }
    }

    var map = {
        canvas: null,
        data: null,
        blackRibbon: true,
        hidden: false,
        blinks: {},
        blinkIdsCounter: 0,
        init: function() {
            this.canvas = document.createElement("canvas")
            this.canvas.id = "map"
            this.canvas.width = 256
            this.canvas.height = 256
            document.body.appendChild(this.canvas)
            this.canvas.onclick = function() { map.blackRibbon = false; map.draw() }
        },
        toggle: function() {
            this.hidden = !this.hidden
            g('map').style.visibility = (this.hidden ? 'hidden' : '')
        },
        update: function(data) {
            this.data = data
            this.draw()
        },
        blink: function(ids, sym) {
            var c = this.blinkIdsCounter++
            var iteration = 12
            var blink = map.blinks[c] = {ids:ids, sym:sym, hl:false}
            function toggle() {
                if(--iteration)
                    window.setTimeout(toggle, 250)
                else
                    delete map.blinks[c]
                blink.hl = !blink.hl
                map.draw()
            }
            toggle()
        },
        draw: function() {
            if (this.hidden)
                return
            var context = this.canvas.getContext('2d')
            var myCells = ((window.agar || {}).myCells) || []
            var teams = window.bakaconf.teams
            var idx = {}
            function getAura(cell) {
                if(myCells.indexOf(cell.i) > -1)
                    return window.bakaconf.myAura
                if(cell.a)
                    return window.bakaconf.bakaAura
                for(var i in teams) {
                    if(i !== 'baka' && window.bakaconf.showOnlyBakaAura)
                        continue
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

            if (this.blackRibbon) {
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
            for(i = 0; i < this.data.length; i++) {
                var d = this.data[i]
                var aura = getAura(d)
                if(aura) {
                    context.fillStyle = aura
                    context.beginPath()
                    context.arc(d.x*scale, d.y*scale,
                                d.s*scale+4, 0, 2 * Math.PI, false)
                    context.fill()
                }

                idx[d.i] = this.data[i]
            }

            context.lineWidth = 2
            for(i = 0; i < this.data.length; i++) {
                var d = this.data[i]
                context.beginPath()
                context.arc(d.x*scale, d.y*scale,
                            d.s*scale, 0, 2 * Math.PI, false)
                context.globalAlpha = 1
                context.fillStyle = d.c
                context.fill()
                if(d.v) {
                    context.strokeStyle = "#ff0000"
                } else {
                    context.globalAlpha = .1
                    context.strokeStyle = "#000000"
                }
                context.stroke()
            }

            for(i in this.blinks) {
                var blink = this.blinks[i]
                if (blink.ids.length == 0 || !blink.hl)
                    continue
                context.beginPath()
                context.fillStyle = "#f00"
                context.globalAlpha = 0.7
                var minX, maxX, minY, maxY, drawText = false
                for(var j = 0; j < blink.ids.length; j++) {
                    console.log[j]
                    var d = idx[blink.ids[j]]
                    if (d === undefined) continue
                    drawText = true
                    if (j == 0 || minX > d.x*2-d.s) minX = d.x*2-d.s
                    if (j == 0 || maxX < d.x*2+d.s) maxX = d.x*2+d.s
                    if (j == 0 || minY > d.y*2-d.s) minY = d.y*2-d.s
                    if (j == 0 || maxY < d.y*2+d.s) maxY = d.y*2+d.s
                    context.arc(d.x*scale, d.y*scale,
                                d.s*scale+6, 0, 2 * Math.PI, false)
                    context.closePath()
                }
                context.fill()
                if (!drawText) continue
                context.globalAlpha = 1
                context.font = 'bold 13px Ubuntu'
                context.textAlign = 'center'
                context.textBaseline = 'middle'
                context.fillStyle = '#0ff'
                context.fillText(blink.sym, scale*(minX+maxX)/4, scale*(minY+maxY)/4)
            }
        },
        send: function() {
            var a = window.agar
            if (a === undefined || a.allCells === undefined || a.myCells === undefined || a.top === undefined || a.ws === "") {
                if (!this.hidden)
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
            send({t:'map', all:cells, my:a.myCells, top:top, reply:map.hidden?0:1})
            this.blackRibbon = false
        },
        sendThread: function() {
            if (window.agar === undefined)
                addLine({message:["Карта отправляться не будет :<"]})
            setInterval(function(){ map.send() }, 1000)
        }
    }

    var quick = {
        eventToAction: function(e) {
            var key
            if (e.keyCode < 10) key = "_00" + e.keyCode
            else if (e.keyCode < 100) key = "_0" + e.keyCode
            else key = "_" + e.keyCode
            var t = window.bakaconf.quickTemplates[key]
            if (t === undefined || t.length === 0)
                return
            var mod = e.shiftKey || e.altKey || e.ctrlKey || e.metaKey
            if (mod && t.length >= 2)
                return t[1]
            return t[0]
        },
        show: function() {
            this.hide()
            var quickHint = document.createElement('div')
            quickHint.id = "quickHint"
            function add(key, sym, text) {
                var line = document.createElement('div')
                function span(className, textContent) {
                    var span = document.createElement('span')
                    span.textContent = textContent
                    span.className = className
                    line.appendChild(span)
                }
                span('key', key)
                span('sym', sym)
                span('text', text)
                quickHint.appendChild(line)
            }
            function codeToName(x) {
                if (x >= 48 && x <= 57) return ""+(x-48)
                if (x >= 96 && x <= 105) return "num"+(x-96)
                if (x >= 65 && x <= 90) return x-65+"a".charCodeAt(0)
                return "[" + x + "]"
            }
            var keys = Object.keys(window.bakaconf.quickTemplates).sort()
            for(var i = 0; i < keys.length; i++) {
                var name = codeToName(+keys[i].substr(1))
                var t = window.bakaconf.quickTemplates[keys[i]]
                if(t.length >= 1)
                    add(name, t[0][0], t[0][1])
                if(t.length >= 2)
                    add("Mod + " + name, t[1][0], t[1][1])
            }
            document.body.appendChild(quickHint)
        },
        hide: function() {
            var quickHint = document.getElementById('quickHint')
            if (quickHint)
                document.body.removeChild(quickHint)
        }
    }

    function init() {
        if (g('baka-style') === null) {
            var stl = document.createElement('style')
            stl.id = 'baka-style'
            stl.textContent = '#cbox { background:rgba(255,255,255,0.5); position:fixed; z-index:205; bottom:0; right:0; width:400px; color:#000; opacity:0.7 }' +
                '#carea { width:100%; color:black }' +
                '#form { margin:0 }' +
                '#msgsbox { overflow:auto; word-wrap:break-word; width:400px; height:250px }' +
                '#msgsbox .name { color:#333 }' +
                '#msgsbox .higlight { color:#055 }' +
                '#msgsbox .time { font-size:70%; color:#777 }' +
                'body:not([dark]) a { color:#275d8b }' +
                'body[dark] #cbox { background:rgba(0,0,0,0.5); color:#fff }' +
                'body[dark] #msgsbox .name { color:#CCC }' +
                'body[dark] #msgsbox .higlight { color:#faa }' +
                '#notification { background:red; position:fixed; z-index:205; bottom:5px; right:5px; opacity:0.5; color:white }' +
                '#quickHint { background:#777; position:fixed; z-index:210; top:0; left:0; color:white }'+
                '#quickHint .key { font-weight:bold; margin-right:1em; float:left; width:4em }' +
                '#quickHint .sym { color:#000; float:left; width:2em }' +
                '#map { position:fixed; bottom:5px; left:5px; z-index:205; border:1px black solid }'
            document.head.appendChild(stl)
        }

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

        map.init()

        g('form').onsubmit = submit
        g('carea').onfocus = function () {
            chatactive = true
            g('cbox').style.opacity = '1'
        }
        g('carea').onblur = function () {
            chatactive = false
            g('cbox').style.opacity = '0.7'
        }

        g("chat_users").onclick = function() { send({t:'names'}) }

        handleOptions()
        handleKeys()
        connectChat()
        map.sendThread()
        map.canvas.onmousemove = notification.onmousemove = cbox.onmousemove =
            g("canvas").onmousemove
        g("canvas").onmousewheel = map.canvas.onmousewheel = notification.onmousewheel =
            document.body.onmousewheel
        document.body.onmousewheel = null
        notification.onclick = chatHider.bind(undefined, true)
    }

    function wait() {
        if (!window.onkeydown || !window.onkeyup ||
            !window.setNick || !g("canvas").onmousemove)
            return setTimeout(wait, 100)
        init()
    }
    wait()
})()
