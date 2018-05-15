// ==UserScript==
// @name        WK-Onlineliste
// @namespace   wkProjects
// @description Zeigt die Online-Liste auf jeder Original-Loginseite an.
// @include     https://server*.webkicks.de/*/
// @grant       GM_xmlhttpRequest
// @connect     webkicks.de
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js
// @version     1
// ==/UserScript==
out = [];
rooms = [];
output = "";
$("head").append("<style>.ol-admin{font-weight:bold;}.ol-mod{font-style: italic;}.ol-away{text-decoration: line-through;}");
GM_xmlhttpRequest(
    {
        method: "GET",
        url: document.location.href + "api/get_onlinelist",
        onload: function (response)
        {

            var xml = response.responseText,
                xmlDoc = $.parseXML(xml),
                $xml = $(xmlDoc);
            $xml.find("chatonlinelist").find("onlineuser").each(function(){
                var cU = {};
                cU.name = $(this).find("name").text();
                cU.level = $(this).find("rang").text();
                cU.room = $(this).find("channel").text();
                cU.away = {
                    is: $(this).find("away").text(),
                    reason: $(this).find("awayreason").text()
                };

                if (typeof out[cU.room] == "undefined")
                {
                    out[cU.room] = [];
                    rooms.push(cU.room);
                }

                var classes = [];
                var tmpUser = cU.name;
                var outerDiv = $("<div></div>");
                if (cU.level != "chatter") classes.push("ol-" + cU.level);
                if (cU.away.is == 1) classes.push("ol-away");
                outerDiv.append($("<span></span>").text(cU.name).addClass(classes.join(" ")));
                if (cU.away.reason != "") outerDiv.append(" <small>(" + cU.away.reason + ")</small>");
                out[cU.room].push(outerDiv.html());
            });
            $.each(rooms, function (index, value)
                   {
                roomname = value.replace(/^main$/, "Hauptchat").replace(/^sep.(.+)$/, "Privatraum von $1");
                output += "<div>" + roomname + " (" + out[value].length + "): " + out[value].join(", ") + "</div>\n";
            });
            $("form").after(output);


        },
        onerror: function(res){
            console.log(res);
        }
    });
