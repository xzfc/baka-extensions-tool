// ==UserScript==
// @name        Baka extensions tool
// @include     http://agar.io/
// @grant       GM_xmlhttpRequest
// @grant       unsafeWindow
// @run-at      document-end
// ==/UserScript==

function main() {
	g = function(id) {return document.getElementById(id);}

	reqc = 0
	acc = '3a32aebd068d46be842fcb125868b059e37ba425efc2733a90f72622d27d1eaad238fa2e7da24ad72434b'
	callback = {}
	chatactive = 0
	qactive = 0
	rskipc = 0
	ishidden = 0

	q = function (m, q, ret) {
		var script = document.createElement('script')
		script.id = reqc
		script.src = 'https://api.vk.com/method/' + m + '?https=1&access_token=' + acc + '&' + q + '&callback=callback[' + reqc +']'
		callback[reqc] = (function(reqc, ret) {return function(r) {
			//console.log('q ', r)
			if (typeof ret == 'function') ret(r)
			else console.log('ret is not a function', ret)
			g(reqc).remove()
		 }} (reqc, ret))
		document.getElementsByTagName("head")[0].appendChild(script)
		reqc++
	}

	im = {
		guid: 0,
		load: function() {
			q('messages.getHistory', 'count=200&user_id=288367682', im.draw)
		},
		draw: function(r) {
			if (r.error_code)
				if (r.error_code == 14)
					if (rskipc < 5) {rskipc++; return setTimeout(im.load, 500);}
					else console.log('imload 5 error', r)
				else console.log('imload error', r)
			else {
				r = r['response']
				var box = g('msgsbox')
				for (var i = 1; i < r.length; i++) {
					var msg = document.createElement('div')
					msg.innerHTML = (r[i].body.indexOf('|') != -1 ? r[i].body.substr(0, r[i].body.indexOf('|')) + ': ' + r[i].body.substr(r[i].body.indexOf('|') + 1) : r[i].body)
					box.insertBefore(msg, box.firstChild)
				}
				g('msgsbox').lastChild.scrollIntoView()
				rskipc = 0
			}
		},
		send: function() {
			params = 'user_id=288367682' + '&guid=' + im.guid + '&message=' + encodeURIComponent(g('nick').value + '|' + g('carea').value)
			ret = function(r) {
				if (r.error_code)
					if (r.error_code == 14)
						if (rskipc < 5) {rskipc++; return setTimeout(im.send, 500);}
						else console.log('imsend 5 error', r)
					else console.log('imsend error', r)
				else g('carea').value = ''
			}
			im.guid = Date.now()
			q('messages.send', params, ret)
		}
	}

	lpconnect = function () {
		var ret = function(r) {
			if (r.error_code)
				if (r.error_code == 14)
					if (rskipc < 5) {rskipc++; return setTimeout(lpconnect, 500);}
					else console.log('lpconnect 5 error', r)
				else console.log('lpconnect error', r)
			else {
				window.lpi = r.response
				g('lpltrigger').click()
			}
		}
		q('messages.getLongPollServer', 'use_ssl=1', ret)
	}

	www = function () {
		dkd({keyCode: 87})
		dku({keyCode: 87})
		if (qactive) window.qtimeout = setTimeout(www, 100)
	}
	
	hider = function () {
		ishidden = !ishidden
		g('cbox').style.display = (ishidden ? 'none' : '')
	}

	function init() {
		im.load()
		lpconnect()

		g('carea').onfocus = function () {
			chatactive = 1
			g('cbox').style.opacity = '0.6'
			g('cbox').style.borderLeft = '2px solid black'
		}
		g('carea').onblur = function () {
			chatactive = 0
			g('cbox').style.opacity = '0.5'
			g('cbox').style.borderLeft = ''
		}

		//keyjeck
		window.dkd = window.onkeydown
		window.dku = window.onkeyup
		window.onkeydown = function (e) {
			if (chatactive) if (e.keyCode != 27) return true; else {g('carea').blur(); return false;}
			if (e.keyCode == 49) return hider()
			switch (e.keyCode) {
				case 9:
					g('carea').focus()
					return false
				case 81:
					qactive = 1
					www()
					break
			}
			dkd(e)
		}
		console.log(window.onkeydown, dkd)
		window.onkeyup = function (e) {
			if (!chatactive) {
				switch (e.keyCode) {
					case 81:
						console.log('81up')
						clearTimeout(window.qtimeout)
						qactive = 0
				}
				dku(e)
			}
		}
	}

	window.addEventListener('load', init)
}


function init() {
	var stl = document.createElement('style')
	stl.innerHTML = '#cbox {background: black; position:fixed; z-index:100; bottom:0; right:0; width:400px; height:250px; opacity:0.5; color:white; font-weight:bold;} #carea {width:100%; color:black; height: 30px;} #msgsbox {height: 220px; overflow: auto;}'
	document.body.appendChild(stl)

	var cbox = document.createElement('div')
	cbox.id = 'cbox'
	cbox.innerHTML = '<div id="msgsbox"></div><div id="cform"><form onsubmit="im.send(); return false;"><input id="carea"></input></div><div id="lpltrigger"></div>'
	document.body.appendChild(cbox)
	
	document.getElementById('lpltrigger').addEventListener('click', lploop)

	var script = document.createElement('script');
	script.appendChild (document.createTextNode('('+ main +')();'));
	(document.body || document.head || document.documentElement).appendChild(script);
}



function lploop() {
	r = unsafeWindow.lpi
	//console.log('used ts', r.ts)
	GM_xmlhttpRequest({
		method: "GET",
		url: 'http://' + r.server + '?act=a_check&key=' + r.key + '&ts='+ r.ts + '&wait=10&mode=2',
		onload: function(ups) {
			eval('ups = ' + ups.responseText)
			if (unsafeWindow.lpi.ts != ups.ts) {
				//console.log('-new ts', ups.ts, unsafeWindow.lpi.ts, ups)
				unsafeWindow.lpi.ts = ups.ts
				ups = ups.updates
				for (var i = 0; i < ups.length; i++) {
					if (ups[i][0] == 4) {
						var msg = document.createElement('div')
						//msg.innerHTML = ups[i][6]
						msg.innerHTML = (ups[i][6].indexOf('|') != -1 ? ups[i][6].substr(0, ups[i][6].indexOf('|')) + ': ' + ups[i][6].substr(ups[i][6].indexOf('|') + 1) : ups[i][6])
						document.getElementById('msgsbox').appendChild(msg)
					}
				}
				document.getElementById('msgsbox').lastChild.scrollIntoView()
			}
			lploop()
		}
	})
}

init()
