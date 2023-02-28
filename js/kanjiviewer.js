// These colours are used to colour the different groups of the kanji.
var colours = Array("red", "orange", "green", "blue", "goldenrod");

const kanjiSVGID = "kanji-svg";

function displayOrders() {
	var displayOrdersEl = document.getElementById("displayOrders");
	var doc = displayOrdersEl.checked;
	return doc;
}

function showRad() {
	var radEl = document.getElementById("radicals");
	var rad = radEl.checked;
	return rad;
}

function colorGroups() {
	var colorGroupsEl = document.getElementById("colorGroups");
	var cgc = colorGroupsEl.checked;
	return cgc;
}

function onOff(name) {
	var v = localStorage.getItem(name);
	if (v === "on") {
		return true;
	}
	return false;
}

const showGroups = "show-groups";

function getShowGroups() {
	return onOff(showGroups);
}

function setShowGroups(onOff) {
	localStorage.setItem(showGroups, onOff);
}

const showRadicals = "show-radicals";

function getShowRadicals() {
	return onOff(showRadicals);
}

function setShowRadicals(onOff) {
	msg("Setting radicals to " + onOff);
	localStorage.setItem(showRadicals, onOff);
}


function groups() {
	var img = document.getElementById("group-images");
	return img;
}

function removeGroups() {
	groups().innerHTML = '';
}

function radicalImages() {
	var img = document.getElementById("radical-images");
	return img;
}

function removeRadicals() {
	radicalImages().innerHTML = '';
}

const noElement = "No element";

function listGroups(svg) {
	const gs = svg.getElementsByTagName("g");
	return gs
}

// Find the radicals of svg. The return value is an object with three
// possible elements, general, nelson, and jis, each of which contains
// an array listing the groups which comprise the radical.
function findRadicals(svg) {
	const gs = listGroups(svg);
	var rads = new Object();
	for (var group of gs) {
		var r = group.getAttribute("kvg:radical");
		if (! r) {
			continue;
		}
		if (! rads[r]) {
			rads[r] = new Array();
		}
		rads[r].push(group.id);
	}
	console.log(rads);
	return rads;
}

// Given svg data, find the groups within it, and return an object
// where the keys are the kanji of the elements, and the values are
// arrays consisting of the groups of svg which contain that kanji.
function findSVGGroups(svg) {
	var kanji2group = new Object();
	const gs = listGroups(svg);
	for (var group of gs) {
		if (group.id.match(/kvg:Stroke(Numbers|Paths)/)) {
			continue;
		}
		var element = group.getAttribute("kvg:element");
		if (! element) {
			element = noElement;
		}
		if (! kanji2group[element]) {
			kanji2group[element] = new Array;
		}
		kanji2group[element].push(group.id);
	}
	return kanji2group;
}

// Given a copy of the svg in svgCopy, a kanji k representing the
// subgroup, and an array of groups to highlight gs, add an image to
// the list of images.
function addImage(gs, k, svgCopy) {
	msg("kanji is " + k + " in index: " + index[k]);
	var top;
	top = document.createElement("div");
	var figure = document.createElement("figure");
	figure.appendChild(svgCopy);
	svgCopy.classList.add("group-svg");
	var figCaption = document.createElement("figcaption");
	figCaption.innerHTML = k;
	figure.appendChild(figCaption);
	top = document.createElement("div");
	if (k == noElement || ! index[k]) {
		// Don't add links if this doesn't have an element, or if the
		// element is not in KanjiVG.
		top.appendChild(figure);
		gs.insertBefore(top, gs.children[0]);
	} else {
		// Add a link.
		var link = document.createElement("a");
		link.href = "?kanji=" + k;
		link.appendChild(figure);
		top.appendChild(link);
		gs.appendChild(top);
	}
	top.classList.add("group-image");
}

function addRadicalImage(gs, name, gloss, svgCopy) {
	var link = "<a class=\"radical-explanation\" target=\"_blank\" href=\"glossary.html#" + gloss + "\">" + name + "</a>";
	addImage(gs, link, svgCopy);
}

function displayRadicals(svg) {
	msg("Showing radicals");
	var rads = findRadicals(svg);
	if (! rads) {
		return;
	}
	var radNames = Object.keys(rads).sort();
	msg(radNames);
	var gs = radicalImages();
	gs.innerHTML = '';
	for (const r of radNames) {
		msg("radical "+r);
		var svgcopy = svg.cloneNode(true);
		var gps = rads[r];
		for (let i in gps) {
			var g = svgcopy.getElementById(gps[i]);
			if (! g) {
				continue;
			}
			g.classList.add("radical-stroke");
		}
		noStrokeNumbers(svgcopy);
		if (r == "general" || r == "tradit") {
			addRadicalImage(gs, "Radical", "radical", svgcopy);
		} else if (r == "jis") {
			addRadicalImage(gs, "JIS radical", "jis-radicals", svgcopy);
		} else if (r == "nelson") {
			addRadicalImage(gs, "Nelson radical", "nelson-radicals", svgcopy);
		} else {
			msg("Unhandled radical " + r);
		}
	}
}


// Display the groups within the character. This creates copies of the
// SVG with the group highlighted using a different colour.
function displayGroups(svg, kanji) {
	// If the user happens to input a long string of characters,
	// extract the first one only.
	kanji = Array.from(kanji)[0];
	msg("displaying groups of "+kanji);
	var gs = groups();
	gs.innerHTML = '';
	var kanji2group = findSVGGroups(svg);
	var elePart = new Object();
	for (var k in kanji2group) {
		// Don't display the group if it is the kanji itself. This is
		// the case for the top level group.
		if (k == kanji) {
			msg("k==kanji "+ k + " == " + kanji);
			continue;
		}
		
		var svgcopy = svg.cloneNode(true);
		addImage(gs, k, svgcopy);
		var gps = kanji2group[k];
		var cNum = -1;
		for (let i in gps) {
			// Find the group within the copy of the SVG using
			// getElementById.
			var g = svgcopy.getElementById(gps[i]);
			if (! g) {
				continue;
			}
			var element = g.getAttribute("kvg:element");
			var part = g.getAttribute("kvg:part");
			var cont = false;
			if (element && part) {
				var p = parseInt(part);
				msg("elem = "+element+" part= "+part);
				prevPart = elePart[element];
				if (prevPart && prevPart < p) {
					msg("continuing");
					cont = true;
				}
				elePart[element] = p;
			}
			if (! cont) {
				cNum++;
			}
			g.style.stroke = colours[cNum];
			noStrokeNumbers(svgcopy);
		}
	}
}

// Turn off the display of stroke numbers
function noStrokeNumbers(svgcopy) {
	const texts = svgcopy.getElementsByTagName("text");
	for (var text of texts) {
		text.style.display = "none";
	} 
}

// Not totally white colours
const dark = 12;
// This returns a random colour which is not completely white.
function randomColour() {
	var colour = new String();
	for (var i = 0; i < 3; i++) {
		var r = Math.floor(Math.random() * dark);
		colour = colour.concat(r.toString(16).toUpperCase());
	}
	return colour;
}

KanjiViewer = {
	initialize:function (divName, displayOrders, radicals, colorGroups, kanji, file) {
		loadIndex();
		this.file = file;
		this.kanji = kanji;
		var urlVars = getUrlVars();
		var random = urlVars["random"];
		if (random) {
			msg("Choosing a random kanji");
			this.kanji = randomKanji();
		}
		this.refreshKanji();
		this.animate = new KanjivgAnimate("#animate");
	},
	getKanjiVGURL: function (url, kanji) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, false);
		// Following line is just to be on the safe side;
		// not needed if your server delivers SVG with correct MIME type
		xhr.overrideMimeType("image/svg+xml");
		var self = this;
		xhr.onload = function(e) {
			if (this.readyState == 4 && this.status == 200) {
				self.loadKanjiVG(xhr.responseXML);
			}
		};
		xhr.send("");
	},
	getKanjiVGFile: function () {
		msg("Getting file " + this.file);
		var url = fileToKanjiVG(this.file);
		this.kanji = fileToKanji(this.file);
		this.getKanjiVGURL(url);
	},
	// Get the kanjiVG data from the submodule. This starts a request for
	// the data, then loads it when ready using loadKanjiVG.
	getKanjiVG: function () {
		msg("Getting kanji " + this.kanji);
		var url = kanjiURL(this.kanji);
		this.getKanjiVGURL(url);
	},
	// This function is called back after a successful load of a kanji
	// image.
	loadKanjiVG: function (el) {
		document.title = this.kanji + " - KanjiVG";
		var img = document.getElementById("kanji-image");
		img.innerHTML = '';
		var svg = el.documentElement;
		// Use svg.cloneNode here because it contains a reference, so
		// if we append it then we cannot reuse it for the group
		// display. The "true" argument makes a deep copy.
		img.appendChild(svg.cloneNode(true));
		// Add an ID to the SVG element in img so we can apply styles to
		// it.
		img.lastChild.id = kanjiSVGID;
		var hk = kanjiToHex(this.kanji);
		if (this.file) {
			hk = this.file;
			hk = hk.replace(/\.svg/,"");
		}
		var baseID = "kvg:" + hk;
		var baseEl = document.getElementById(baseID);
		const paths = baseEl.getElementsByTagName("path");
		textBaseID = "kvg:StrokeNumbers_" + hk;
		var textBaseEl = document.getElementById(textBaseID);
		const texts = textBaseEl.getElementsByTagName("text");
		// True if we display the stroke order
		var doc = displayOrders(); 
		var i = 0;
		for (var path of paths) {
			var colour = "#" + randomColour();
			path.style.stroke = colour;
			if (! texts[i]) {
				console.log("Missing label for stroke "+i);
			} else {
				if (doc) {
					texts[i].style.fill = colour;
				} else {
					texts[i].style.fill = "none";
				}
			}
			i++;
		}
		// True if we show the radicals
		var rad = showRad();
		if (rad) {
			displayRadicals(svg);
		} else {
			removeRadicals();
		}
		// True if we show the groups
		var cg = colorGroups();
		if (cg) {
			displayGroups(svg, this.kanji);
		} else {
			removeGroups();
		}
		var source;
		if (this.file) {
			source = github + this.file;
		} else {
			source = githubURL(this.kanji);
		}
		var linkP = document.createElement("p");
		var linkT = document.createElement("b");
		linkT.appendChild(document.createTextNode("Links:"));
		linkP.appendChild(linkT);
		img.appendChild(linkP);
		addLink(linkP, source, "Image source");
		kescape = encodeURIComponent(this.kanji);
		addLink(linkP, "https://en.wiktionary.org/wiki/" + kescape, "Wiktionary");
		var files = index[this.kanji];
		if (files.length > 1) {
			msg("Appending variant files");
			var fileP = document.createElement("p");
			fileTitle = document.createElement("b");
			fileTitle.appendChild(document.createTextNode("Variant files: "));
			fileP.appendChild(fileTitle);
			for (var i in files) {
				fileP.appendChild(document.createTextNode(" "));
				var file = files[i];
				var fileA = document.createElement("a");
				fileA.appendChild(document.createTextNode(file));
				fileA.href = "?file=" + file;
				fileP.appendChild(fileA);
			}
			img.appendChild(fileP);
		}
	},
	setStrokeOrdersVisible:function (visible) {
		this.displayOrders = visible;
	},
	setColorGroups:function (colorGroups) {
		this.colorGroups = colorGroups;
	},
	setRadicals:function (rad) {
		this.showRadicals = rad;
	},
	setKanji:function (kanji) {
		msg("setKanji: " + kanji + " this.kanji=" + this.kanji);
		if (kanji != this.kanji && kanji != '' && kanji != undefined) {
			this.kanji = kanji;
		}
	},
	refreshKanji:function () {
		if (this.file) {
			msg("Loading file " + this.file);
			this.getKanjiVGFile();
			return;
		}
		if (this.kanji) {
			msg("Loading kanji " + this.kanji);
			this.getKanjiVG();
			return;
		}
		msg("No kanji or file is specified at the moment");
	},
};

function changeRadicals() {
	var rad = jQuery('#radicals:checked').val();
	setShowRadicals(rad);
}

function changeColorGroups() {
	var cg = jQuery('#colorGroups:checked').val();
	setShowGroups(cg);
}

function changeBox() {
	runKanjiViewer();
}

function gotoRandom() {
	var kanji = randomKanji();
	window.location.href = "?kanji=" + kanji;
	return false;
}

function addLink(parent, url, text) {
	parent.appendChild(document.createTextNode(" "));
	var link = document.createElement("a");
	link.appendChild(document.createTextNode(text));
	link.href = url;
	link.setAttribute("target", "_blank");
	parent.appendChild(link);
}
