// ==UserScript==
// @name        Baka extensions tool example config
// @version     1.0
// @namespace   baka-extensions-tool
// @include     http://agar.io/*
// @grant       none
// ==/UserScript==

if (window.bakaconf === undefined) window.bakaconf = {};
if (window.bakaconf.teams === undefined) window.bakaconf.teams = {};

// Добавить (или заменить) команду, члены которой будут отмечены на карте цветной аурой
// window.bakaconf.teams.ww2leaders = {names: ["Stalin", "Hitler"], color: "#00F"};

// Шаблоны для быстрых команд
/*
window.bakaconf.quickTemplates = [["Покорми", "Не корми"],
                                  ["Взорви колючку", "Пульни колючку"],
                                  ["Возьми мои ошмётки", "Не бери мои ошмётки"],
                                  ["Отходим", "Наступаем"]];
*/

// Формат отображения времени в чате. 0 — HH:MM:SS, 1 — HH:MM, 2 — не отображать
// window.bakaconf.timeFormat = 0;

// отмечать на карте только сырн
// window.bakaconf.showOnlyBakaAura = true;
