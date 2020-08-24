const mapNameToImagePath = {"Ancho-V Games": "stages/S2_Stage_Ancho-V_Games.png",
"Arowana Mall":"stages/S2_Stage_Arowana_Mall.png",
"Blackbelly Skatepark":"stages/S2_Stage_Blackbelly_Skatepark.png",
"Camp Triggerfish":"stages/S2_Stage_Camp_Triggerfish.png",
"Goby Arena":"stages/S2_Stage_Goby_Arena.png",
"Humpback Pump Track":"stages/S2_Stage_Humpback_Pump_Track.png",
"Inkblot Art Academy":"stages/S2_Stage_Inkblot_Art_Academy.png",
"Kelp Dome":"stages/S2_Stage_Kelp_Dome.png",
"MakoMart":"stages/S2_Stage_MakoMart.png",
"Manta Maria":"stages/S2_Stage_Manta_Maria.png",
"Moray Towers":"stages/S2_Stage_Moray_Towers.png",
"Musselforge Fitness":"stages/S2_Stage_Musselforge_Fitness.png",
"New Albacore Hotel":"stages/S2_Stage_New_Albacore_Hotel.png",
"Piranha Pit":"stages/S2_Stage_Piranha_Pit.png",
"Port Mackerel":"stages/S2_Stage_Port_Mackerel.png",
"Shellendorf Institute":"stages/S2_Stage_Shellendorf_Institute.png",
"Shifty Station":"stages/S2_Stage_Shifty_Station.png",
"Snapper Canal":"stages/S2_Stage_Snapper_Canal.png",
"Starfish Mainstage":"stages/S2_Stage_Starfish_Mainstage.png",
"Sturgeon Shipyard":"stages/S2_Stage_Sturgeon_Shipyard.png",
"The Reef":"stages/S2_Stage_The_Reef.png",
"Wahoo World":"stages/S2_Stage_Wahoo_World.png",
"Walleye Warehouse":"stages/S2_Stage_Walleye_Warehouse.png",
"Skipper Pavilion":"stages/S2_Stage_Skipper_Pavilion.png",
"Unknown Map":"stages/low-ink-unknown-map.png"};

const bigTextValue = nodecg.Replicant('bigTextValue', { defaultValue: 'Be right back!' });
const casterNames = nodecg.Replicant('casterNames', { defaultValue: "" });
const nowPlaying = nodecg.Replicant('nowPlaying');
const nowPlayingManual = nodecg.Replicant('nowPlayingManual', {defaultValue: {
	artist: undefined,
	song: undefined
}});
const mSongEnabled = nodecg.Replicant('mSongEnabled', {defaultValue: false});
const musicShown = nodecg.Replicant('musicShown', {defaultValue: true});
const currentBreakScene = nodecg.Replicant('currenBreakScene', { defaultValue: 'mainScene' });
const nextTeams = nodecg.Replicant('nextTeams', {defaultValue: {
	teamAInfo: {
		name: "Placeholder Team 1",
		logoUrl: "",
		players: [
			{name:"You should fix this before going live."}
		]
	},
	teamBInfo: {
		name: "Placeholder Team 2",
		logoUrl: "",
		players: [
			{name:"You should fix this before going live."}
		]
	}
}});
const currentMaplistID = nodecg.Replicant('currentMaplistID', { defaultValue: '0' });
const mapWinners = nodecg.Replicant('mapWinners', { defaultValue: [0, 0, 0, 0, 0, 0, 0] });
const SBData = nodecg.Replicant('SBData', {defaultValue: {
	flavorText: 'Flavor Text',
	teamAInfo: {
		name: "Placeholder Team 1",
		logoUrl: "",
		players: [
			{name:"You should fix this before going live."}
		]
	},
	teamAColor: 'Green',
	teamBInfo: {
		name: "Placeholder Team 2",
		logoUrl: "",
		players: [
			{name:"You should fix this before going live."}
		]
	},
	teamBcolor: 'Purple'
}});
const RGBMode = nodecg.Replicant('RGBMode', {defaultValue: false});
const NSTimerShown = nodecg.Replicant('NSTimerShown', {defaultValue: false});
const nextStageTime = nodecg.Replicant('nextStageTime', {defaultValue: {
    hour: 0,
    minute: 0,
    day: 1,
    month: 0
}});
const maplists = nodecg.Replicant('maplists', {
    defaultValue: [
        [
            { id: 0, name: "Default map list" },
            { map: "Ancho-V Games", mode: "Clam Blitz" },
            { map: "Ancho-V Games", mode: "Tower Control" },
            { map: "Wahoo World", mode: "Rainmaker" }
        ]
    ]
});

//replicant changes
var nextStageInterval = setInterval(() => {
	const now = new Date();
	const diff = new Date(nextStageTimeObj - now);
	const diffMinutes = Math.ceil(diff / (1000 * 60));
	if (lastDiff !== diffMinutes) {
		lastDiff = diffMinutes;
		var newText;
		if (diffMinutes < 1) {
			newText = 'Next round begins soon!';
		} else if (diffMinutes == 1) {
			newText = `Next round begins in ~${diffMinutes} minute...`;
		} else {
			newText = `Next round begins in ~${diffMinutes} minutes...`;
		}
		changeBreakMainText('mainSceneRoundTimerText', newText, 'mainSceneRoundTimerBG');
	}
}, 1000);
var lastDiff;
var nextStageTimeObj;
nextStageTime.on('change', newValue => {
	time = new Date();
	time.setDate(newValue.day);
	time.setHours(newValue.hour, newValue.minute, 0);
	time.setMonth(newValue.month);

	nextStageTimeObj = time;
});

NodeCG.waitForReplicants(maplists, currentMaplistID).then(() => {
	currentMaplistID.on('change', newValue => {
		let maplist = maplists.value.filter(list => list[0].id == newValue)[0];
		updateMapLists(maplist);
	});

	maplists.on('change', (newValue, oldValue) => {
		if (!oldValue) return;
		let newCurrentList = newValue.filter(list => list[0].id == currentMaplistID.value)[0];
		let oldCurrentList = oldValue.filter(list => list[0].id == currentMaplistID.value)[0];

		if (compareMapLists(newCurrentList, oldCurrentList)) {
			updateMapLists(newCurrentList);
		}
	});

	SBData.on('change', newValue => {
		let maplist = maplists.value.filter(list => list[0].id == currentMaplistID.value)[0];
		for (let i = 0; i < maplist.length - 1; i++) {
			if (mapWinners.value[i] != 0) {
				updateWinner(i, mapWinners.value[i]);
			}
		}
	});
});

musicShown.on('change', newValue => {
	//not very good, should be prettified
	if (newValue) {
		gsap.to('#musicWrapper', 0.5, {opacity: 1});
		var gridTemplateRows;
		if (NSTimerShown.value) { gridTemplateRows = '2fr 1fr 1fr 1fr 1fr 1fr'; }
		else { gridTemplateRows = '2fr 1fr 0fr 1fr 1fr 1fr'; };
		gsap.to('.mainSceneGrid', {duration: 0.5, ease: 'power2.out', gridTemplateRows: gridTemplateRows});
	} else {
		gsap.to('#musicWrapper', 0.5, {opacity: 0});
		var gridTemplateRows;
		if (NSTimerShown.value) { gridTemplateRows = '2fr 1fr 1fr 1fr 1fr 0fr'; }
		else { gridTemplateRows = '2fr 1fr 0fr 1fr 1fr 0fr'; };
		gsap.to('.mainSceneGrid', {duration: 0.5, ease: 'power2.inOut', gridTemplateRows: gridTemplateRows});
	}
});

NSTimerShown.on('change', newValue => {
	if (newValue) {
		gsap.to('.mainSceneRoundTimer', {duration: 0.5, opacity: 1});
		var gridTemplateRows;
		if (musicShown.value) { gridTemplateRows = '2fr 1fr 1fr 1fr 1fr 1fr'; }
		else { gridTemplateRows = '2fr 1fr 1fr 1fr 1fr 0fr'; };
		gsap.to('.mainSceneGrid', {duration: 0.5, ease: 'power2.out', gridTemplateRows: gridTemplateRows});
	} else {
		gsap.to('.mainSceneRoundTimer', {duration: 0.5, opacity: 0});
		var gridTemplateRows;
		if (musicShown.value) { gridTemplateRows = '2fr 1fr 0fr 1fr 1fr 1fr'; }
		else { gridTemplateRows = '2fr 1fr 0fr 1fr 1fr 0fr'; };
		gsap.to('.mainSceneGrid', {duration: 0.5, ease: 'power2.out', gridTemplateRows: gridTemplateRows});
	}
});

currentBreakScene.on('change', newValue => {
	if (newValue === "mainScene") {
		hideNextUp();
		hideTopBar();
		hideMaps();
		showMainScene(0);
		animSquidArrows();
	} else if (newValue === "nextUp") {
		showTopBar(1.25);
		hideMainScene();
		hideMaps();
		showNextUp();
		animSquidArrows();
	} else if (newValue === "maps") {
		showTopBar(1.25);
		hideMainScene();
		hideNextUp();
		showMaps();
		animSquidArrows();
	}
});

nextTeams.on('change', newValue => {
	document.querySelector('#teamAImage').style.backgroundImage = 'url(' + newValue.teamAInfo.logoUrl + ')';
	teamAName.text = newValue.teamAInfo.name;
	addTeamPlayers('A', newValue.teamAInfo.players);

	document.querySelector('#teamBImage').style.backgroundImage = 'url(' + newValue.teamBInfo.logoUrl + ')';
	teamBName.text = newValue.teamBInfo.name;
	addTeamPlayers('B', newValue.teamBInfo.players);
});

mapWinners.on('change', (newValue, oldValue) => {
	if (!oldValue) {
		//assume we're on first load
		for (let i = 0; i < newValue.length; i++) {
			const element = newValue[i];
			if (element != 0) {
				addWinner(i, element);
			}
		}
	} else {
		for (let i = 0; i < newValue.length; i++) {
			const element = newValue[i];
			const oldElement = oldValue[i];
			if (element != oldElement) {
				if (element == 0) {
					removeWinner(i);
				} else if (oldElement == 0) {
					addWinner(i, element);
				} else {
					updateWinner(i, element);
				}
			}
		}
	}
});

RGBMode.on('change', newValue => {
	if (newValue) {
		enableRGBMode();
	} else {
		disableRGBMode();
	}
});

window.onload = function() {
	startSocialSlides();
	startTopBarTextLoop();
	bigTextValue.on('change', newValue => {
		changeBreakMainText('breakFlavorText', newValue, "breakFlavorTextBG");
		topBarText.text = newValue;
	});
	
	casterNames.on('change', newValue => {
		changeBreakMainText('breakCasterNames', newValue, 'breakCasterNamesBG');
	});
	
	nowPlaying.on('change', newValue => {
		if (!mSongEnabled.value) {
			if (newValue.artist == undefined && newValue.song == undefined) {
				changeBreakMainText('breakSongText', 'No song is currently playing.', 'breakSongTextBG');
			} else {
				const songName = newValue.artist + " - " + newValue.song;
				changeBreakMainText('breakSongText', songName, 'breakSongTextBG');
			}		
		}
	});
	
	mSongEnabled.on('change', newValue => {
		var value;
		if (newValue) { value = nowPlayingManual.value; }
		 else { value = nowPlaying.value; }
	
		if (value.artist === undefined && value.song === undefined) {
			changeBreakMainText('breakSongText', 'No song is currently playing.', 'breakSongTextBG');
		} else {
			const songName = value.artist + " - " + value.song;
			changeBreakMainText('breakSongText', songName, 'breakSongTextBG');
		}		
	});
	
	nowPlayingManual.on('change', newValue => {
		if (mSongEnabled.value) {
			if (newValue.artist == undefined && newValue.song == undefined) {
				changeBreakMainText('breakSongText', 'No song is currently playing.', 'breakSongTextBG');
			} else {
				const songName = newValue.artist + " - " + newValue.song;
				changeBreakMainText('breakSongText', songName, 'breakSongTextBG');
			}		
		}
	});
}

//looping background

var arrowTl = gsap.timeline({repeat: -1});
arrowTl.to('#squidarrows', 15, {ease: Power0.easeNone, left: -605});

//surrort texts

const socialTexts = ["Twitter: @LowInkSplatoon",
"Discord: discord.gg/F7RaNUR",
"Patreon: patreon.com/lowink"];

const socialIcons = ["icons/logoTwitter.png",
"icons/logoDiscord.png",
"icons/logoPatreon.png"];

function startSocialSlides() {
    for(i = 0; i < socialIcons.length; i++) {
        addSocialAnim(i);
    }
}

const socialTL = gsap.timeline();
function addSocialAnim(number) {
    var calcWidth;
    calcWidth = measureText(socialTexts[number], "'Montserrat', sans-serif", "2.5em") + 20;
    socialTL.add(gsap.to("#breakSupport", 0.5, {opacity: 0, ease: Power2.easeIn, onComplete: function() {
        breakSupport.text = socialTexts[number];
    }}))
    .add(gsap.to("#socialIcon", 0.5, {delay: -0.5, opacity: 0, ease: Power2.easeIn, onComplete: function() {
        socialIcon.src = socialIcons[number];
    }}))
    .add(gsap.to("#breakSupportBG", 0.5, {ease: Expo.easeInOut, width: calcWidth}))
    .add(gsap.to("#breakSupport", 0.5, {ease: Expo.easeInOut, opacity: 1}))
    .add(gsap.to("#socialIcon", 0.5, {ease: Expo.easeInOut, opacity: 1, delay: -0.5}))
    .add(gsap.to({}, 10, {}));
    if (number == socialIcons.length - 1) {
        socialTL.to({}, 0.01, {delay: -0.01, onComplete: function() {startSocialSlides()}});
    }
}

//top bar looping text

function startTopBarTextLoop() {
	for (let i = 0; i < 2; i++) {
		addTopBarAnim(i);
	}
}

const topBarInfoTL = gsap.timeline();
function addTopBarAnim(i) {
	topBarInfoTL.add(gsap.to('#topBarInfoText, #topBarInfoIcon', 0.5, {opacity: 0, onComplete: function() {
		if (i === 0) {
			topBarInfoText.text = casterNames.value;
			topBarInfoIcon.src = 'icons/microphone.svg';
		} else if (i === 1) {
			if (mSongEnabled.value) {
				topBarInfoText.text = nowPlayingManual.value.artist + ' - ' + nowPlayingManual.value.song;
			} else {
				if (nowPlaying.value.artist === undefined && nowPlaying.value.song === undefined) {
					topBarInfoText.text = 'Nothing is playing at the moment.';
				} else {
					topBarInfoText.text = nowPlaying.value.artist + ' - ' + nowPlaying.value.song;
				}
			}
			topBarInfoIcon.src = 'icons/music.svg';
		}
	}}))
	.add(gsap.to('#topBarInfoText, #topBarInfoIcon', 0.5, {opacity: 1, delay: 0.5}))
	.add(gsap.to({}, 10, {}));
	if (i == 1) {
		topBarInfoTL.to({}, 0.01, {delay: -0.01, onComplete: function() {startTopBarTextLoop()}});
	}
}

//misc functions

function measureText(text, font, fontSize) {
    const measurer2 = document.createElement("div");
    measurer2.classList.add("measurer");
    measurer2.style.fontFamily = font;
    measurer2.style.fontSize = fontSize;
    measurer2.innerText = text;
    document.body.appendChild(measurer2);
    var width = measurer2.getBoundingClientRect().width;
    measurer2.parentNode.removeChild(measurer2);
    return width;
}

function changeBreakMainText(id, text, BGelement) {
	var calcWidth;
    if (text == "") {
        calcWidth = 0;
    } else {
        calcWidth = measureText(text, "'Montserrat', sans-serif", "2.5em") + 20;
	}
	const maxWidth = parseInt(document.getElementById(id).getAttribute("max-width"));
    if (calcWidth > maxWidth) {
        calcWidth = maxWidth + 20;
	}
	const roundWidth = Math.round(calcWidth);
    const songTimeline = gsap.timeline();
	songTimeline.add(gsap.to('#' + id, 0.5, {opacity: 0, ease:'Power2.in', onComplete: function() {
		document.getElementById(id).text = text;
	}}))
	.add(gsap.to('#' + BGelement, 0.5, {ease: 'expo.out', width: roundWidth}))
	.add(gsap.to('#' + id, 0.5, {opacity: 1}));
}

function addTeamPlayers(teamNo, players) {
	//clear existing
	var selector;
	if (teamNo === 'A') {
		selector = 'sc-fitted-text.teamPlayer.teamPlayerA';
	} else if (teamNo === 'B') {
		selector = 'sc-fitted-text.teamPlayer.teamPlayerB';
	}
	const existing = document.querySelectorAll(selector);
	for (let i = 0; i < existing.length; i++) {
		const element = existing[i];
		element.parentNode.removeChild(element);
	}

	for (let i = 0; i < players.length; i++) {
		const element = players[i];
		const playerText = document.createElement('sc-fitted-text');
		playerText.text = element.name;
		playerText.maxWidth = "430"
		playerText.classList.add('teamPlayer');
		if (teamNo === 'A') {
			playerText.align = "right";
			playerText.classList.add('teamPlayerA');
			document.getElementById('teamAInfo').appendChild(playerText);
		} else if (teamNo === 'B') {
			playerText.align = "left";
			playerText.classList.add('teamPlayerB')
			document.getElementById('teamBInfo').appendChild(playerText);
		}
	}
}

function setMapCount(count) {
	/*grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;*/
	var styleVal = '';
	for (let i = 0; i < count; i++) {
		styleVal += '1fr ';
	}
	upcomingStagesGrid.style.gridTemplateColumns = styleVal;
	upcomingStagesGrid.style.width = '1700px';
	if (count == 3) {
		upcomingStagesGrid.style.width = '1400px';
	}
}

function addUpcomingStage(stageInfo, count, id) {
	/*<div class="stageBox">
			<img src="stages/S2_Stage_MakoMart.png" class="mapsStagePic">
			<div class="mapsModeName">Clam Blitz</div>
			<div class="mapsStageName">MakoMart</div>
			<div class="mapsNameGradient"></div>
			<div class="mapsWinnerName">Crustacean Crusaders</div>
			<div class="winnerGradient"></div>
		</div>*/

	const stageBox = document.createElement('div');
	stageBox.classList.add('stageBox');
	stageBox.id = 'stageBox_' + id;

	const stageName = document.createElement('div');
	stageName.innerText = stageInfo.map;
	stageName.classList.add('mapsStageName');
	stageBox.appendChild(stageName);

	const modeName = document.createElement('div');
	modeName.innerText = stageInfo.mode;
	modeName.classList.add('mapsModeName');
	stageBox.appendChild(modeName);

	const mapGradient = document.createElement('div');
	mapGradient.classList.add('mapsNameGradient');
	stageBox.appendChild(mapGradient);

	const stageImage = document.createElement('img');
	if (count == 3) {
		stageImage.classList.add('mapsStagePic3Maps');
	} else if (count == 5) {
		stageImage.classList.add('mapsStagePic5Maps');
	}
	stageImage.classList.add('mapsStagePic');
	stageImage.src = mapNameToImagePath[stageInfo.map];
	stageBox.appendChild(stageImage);

	document.getElementById('upcomingStagesGrid').appendChild(stageBox);
	if (mapWinners.value[id] != 0) {
		addWinner(id, mapWinners.value[id]);
	}
}

function addWinner(index, value) {
	const mapElem = document.querySelector('div#stageBox_' + index);
	if (!mapElem) {
		//we're in trouble
		return;
	}

	const name = mapElem.querySelector('.mapsWinnerName');
	const gradient = mapElem.querySelector('.winnerGradient');

	if (name == null && gradient == null) {
		const winnerName = document.createElement('div');
		winnerName.classList.add('mapsWinnerName');
		if (value == 1)  {
			winnerName.innerText = SBData.value.teamAInfo.name;
		} else if (value == 2) {
			winnerName.innerText = SBData.value.teamBInfo.name;
		}
		mapElem.appendChild(winnerName);

		const winnerGradient = document.createElement('div');
		winnerGradient.classList.add('winnerGradient');
		mapElem.appendChild(winnerGradient);

		gsap.fromTo(winnerName, {opacity: 0}, {duration: 0.3, opacity: 1});
		gsap.fromTo(winnerGradient, {opacity: 0}, {duration: 0.3, opacity: 1});
	}
}

function updateWinner(index, newValue) {
	const mapElem = document.querySelector('div#stageBox_' + index);
	if (!mapElem) {
		return;
	}

	const name = mapElem.querySelector('.mapsWinnerName');
	
	if (newValue == 1) {
		name.innerText = SBData.value.teamAInfo.name;
	} else if (newValue == 2) {
		name.innerText = SBData.value.teamBInfo.name;
	}
}

function removeWinner(index) {
	const mapElem = document.querySelector('div#stageBox_' + index);
	if (!mapElem) {
		return;
	}

	const name = mapElem.querySelector('.mapsWinnerName');
	const gradient = mapElem.querySelector('.winnerGradient');
	
	gsap.to(name, {duration: 0.3, opacity: 0});
	gsap.to(gradient, {duration: 0.3, opacity: 0, onComplete: function() {
		name.parentElement.removeChild(name);
		gradient.parentElement.removeChild(gradient);
	}});
}

function clearUpcomingStages() {
	document.getElementById('upcomingStagesGrid').innerHTML = '';
}

var RGBTimeline = gsap.timeline({repeat: -1});
function enableRGBMode() {
	RGBTimeline = gsap.timeline({repeat: -1});
	const rainbowColors = ['#F37002', '#FFFF00', '#00FF00', '#0000FF', '#2E2B5F', '#8B00FF', '#FF0000', '#F37002'];
	for (let i = 0; i < rainbowColors.length; i++) {
		const element = rainbowColors[i];
		var duration = 1;
		if (i == 0) { duration = 0;}
		RGBTimeline.add(gsap.to(':root', {'--lowInkOrange':element, duration: duration, ease: 'none'}));
	}
}

function disableRGBMode() {
	RGBTimeline.kill();
	gsap.to(':root', {'--lowInkOrange':'#F37002', duration: 1, ease: 'none'});
}


function hideMainScene() {
	gsap.to("#mainScene", 1.5, {ease: 'power3.inOut',  top: 1080});
}

function showMainScene(delay) {
	gsap.fromTo("#mainScene", {top: -1080}, {top: 0, duration: 1.5, ease: 'power3.inOut', delay: delay});
}

function showTopBar(delay) {
	gsap.to("#topBar", 0.5, {ease: 'power3.out', top: 0, delay: delay});
}

function hideTopBar() {
	gsap.to("#topBar", 0.5, {ease: 'power3.inOut', top: -80});
}

function showNextUp(delay) {
	gsap.fromTo("#nextUp", {top: -1080}, {top: 0, duration: 1.5, ease: 'power3.inOut', delay: delay});

	const namesA = document.querySelectorAll('sc-fitted-text.teamPlayer.teamPlayerA');
	const namesB = document.querySelectorAll('sc-fitted-text.teamPlayer.teamPlayerB');

	for (let i = 0; i < namesA.length; i++) { namesA[i].style.opacity = "0"; }
	for (let i = 0; i < namesB.length; i++) { namesB[i].style.opacity = "0"; }

	setTimeout(function() {
		
		for (let i = 0; i < namesA.length; i++) {
			const element = namesA[i];
			gsap.fromTo(element, {marginRight: 60, opacity: 0}, {duration: 0.3, marginRight: 35, opacity: 1, delay: i*0.1});
		}

		for (let i = 0; i < namesB.length; i++) {
			const element = namesB[i];
			gsap.fromTo(element, {marginLeft: 60, opacity: 0}, {duration: 0.3, marginLeft: 35, opacity: 1, delay: i*0.1});
		}
	}, 1100);
}

function hideNextUp() {
	gsap.to("#nextUp", 1.5, {ease: 'power3.inOut',  top: 1080});
}

function showMaps() {
	gsap.fromTo("#nextMaps", {top: -1080}, {top: 0, duration: 1.5, ease: 'power3.inOut'});
}

function hideMaps() {
	gsap.to("#nextMaps", 1.5, {ease: 'power3.inOut',  top: 1080});
}

function animSquidArrows() {
	gsap.to('#squidarrows', {duration: 1.5, bottom: -1085, ease: 'power3.inOut', onComplete: function() {
		document.querySelector('#squidarrows').style.bottom = '0px';
	}});
}

// returns true if there is a difference
function compareMapLists(val1, val2) {
	if (val1[0].id !== val2[0].id || val1[0].name !== val2[0].name) return true;
	if (val1.length !== val2.length) return true;
	for (let i = 1; i < val1.length; i++) {
		if (val1[i].map !== val2[i].map || val1[i].mode !== val2[i].mode) return true;
	}
	return false;
}

function updateMapLists(maplist) {
	gsap.to('#upcomingStagesGrid', {duration: 0.5, opacity: 0, onComplete: function() {
		clearUpcomingStages();
		setMapCount(maplist.length - 1);
		for (let i = 1; i < maplist.length; i++) {
			addUpcomingStage(maplist[i], maplist.length - 1, i - 1);
		}
	}});
	gsap.to('#upcomingStagesGrid', {duration: 0.5, opacity: 1, delay: 0.5});
}
