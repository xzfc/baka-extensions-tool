// ==UserScript==
// @name        Baka extensions tool example config
// @version     1.0
// @namespace   baka-extensions-tool
// @include     http://agar.io/*
// @grant       none
// ==/UserScript==

if (window.bakaconf === undefined) window.bakaconf = {};
if (window.bakaconf.teams === undefined) window.bakaconf.teams = {};
function bakaStyle() {
    var stl = document.getElementById('baka-style');
    if (stl !== null) stl.parentNode.removeChild(stl);
    stl = document.createElement('style');stl.id='baka-style';
    stl.textContent =  Array.slice(arguments).join('\n');
    document.head.appendChild(stl);
}

// Добавить (или заменить) команду, члены которой будут отмечены на карте цветной аурой
// window.bakaconf.teams.ww2leaders = {names: ["Stalin", "Hitler"], color: "#00F"};

// Шаблоны для быстрых команд. Коды есть в гугле по запросу `javascript key codes`
// `_номер` означает нажатие без шифта, `Sномер` — с шифтом.
//
// Можно задавать не только номером, но и названием:
//   https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
// Такие названия понимает только Firefox (за исключением нескольких названий,
// которые работают и в Chrome).
// В этом случае шифт задаётся вот так: `Shift_Backquote`.
/*
window.bakaconf.quickTemplates = {
    Backquote: {
        _049: ['К',  'Покорми!'],
        S049: ['!К', 'Не корми!'],
        _050: ['ПК', 'Пульни колючку!'],
        S050: ['ЧК', 'Чисти колючки!'],
        _051: ['Х',  'Скушай хвостик!'],
        S051: ['!Х', 'Не кушай хвостик!'],
        _052: ['✖',  'Отходим!'],
        S052: ['⧁', 'Наступаем!'],
        _053: ['Д',  'Делись!'],
        S053: ['!Д', 'Не делись!'],
    },
    _097: ['↙', 'Левый нижний угол'],
    _098: ['↓', 'Центр внизу'],
    _099: ['↘', 'Правый нижний угол'],
    _100: ['←', 'Центр слева'],
    _101: ['⨀', 'Центр'],
    _102: ['→', 'Центр справа'],
    _103: ['↖', 'Левый верхний угол'],
    _104: ['↑', 'Центр сверху'],
    _105: ['↗', 'Правый верхний угол'],
};
*/

// Не использовать управление кнопками мыши.
// window.bakaconf.mouseControls = false;

// Формат отображения времени в чате. 0 — HH:MM:SS, 1 — HH:MM, 2 — не отображать
// window.bakaconf.timeFormat = 0;

// Отмечать на карте только сырн
// window.bakaconf.showOnlyBakaAura = true;

// Выключить туман войны
// window.bakaconf.fogOfWar = false;

// Размер карты, в пикселях
// window.bakaconf.mapSize = 256;

// Выключить звук
// window.bakaconf.sound = {chat:0, quick:0};

// Не показывать сообщения заходит/выходит
// window.bakaconf.hideJoinLeaveMessages = true;

// Вернуть проекцию карты как раньше
// window.bakaconf.mapProjection = [0,11180];

// Выключить скины для бак
// bakaconf.bakaSkinUri = null;

// Включить для бак скин с крыльями
/*
bakaconf.bakaSkinUri = "http://89.31.114.117/agar-skins/cirno-wings.svg";
bakaconf.bakaSkinBig = true;
*/

// Включить обычный сырноскин для себя
// bakaconf.mySkinUri = "http://89.31.114.117/agar-skins/cirno.svg";

// Переопределить встроенный в скрипт стиль
/*
bakaStyle('#cbox,#map {visibility: hidden;}',
          'a,input,select,button { animation:spin 4s linear infinite }',
          '@keyframes spin { 100% { transform:rotate(360deg) } }');
*/

// Совсем убрать встроенный в скрипт стиль
// bakaStyle();
