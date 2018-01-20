var SLOT = function (eleId, choiceList, setting) {

    var container = document.getElementById(eleId); 
    var ctx = container.getContext('2d');

    var areaWidth = container.width,
        areaHeight = container.height,
        areaWidthHalf = areaWidth / 2,
        areaHeightHalf = areaHeight / 2;

    var constVal = {};

    constVal.STATE_RESET = 0;
    constVal.STATE_SPEED_UP = 1;
    constVal.STATE_SPEED_DOWN = 2;
    constVal.STATE_SPEED_KEEP = 3;
    constVal.STATE_TO_RESET = 4;

    var settingVal = {};

    settingVal.speedUp = typeof setting.speedUp === 'undefined' ? 500 : parseInt(setting.speedUp, 10);
    settingVal.speedDown = typeof setting.speedDown === 'undefined' ? 500 : parseInt(setting.speedDown, 10);
    settingVal.speedMax = typeof setting.speedMax === 'undefined' ? 1000 : parseInt(setting.speedMax, 10);
    settingVal.speedFix = typeof setting.speedFix === 'undefined' ? 10 : parseInt(setting.speedFix, 10);
    settingVal.fontSize = typeof setting.fontSize === 'undefined' ? 20 : parseInt(setting.fontSize, 10);
    settingVal.fontFamily = typeof setting.fontSize === 'undefined' ? 'Georgia' : setting.fontFamily;
    settingVal.fontLineHeight = typeof setting.fontLineHeight === 'undefined' ? 40 : parseInt(setting.fontLineHeight, 10);
    settingVal.fps = typeof setting.fps === 'undefined' ? 60 : parseInt(setting.fps, 10);
    settingVal.debug = typeof setting.debug === 'undefined' ? false : setting.debug;

    var rstPosTextFix,
        rstVirtualHeight,
        rstDisSpeedUp,
        rstDisSpeedDown,
        rstLineHeightHalf;

    var status = constVal.STATE_RESET;
    var choices;
    var timer = null;
    var flagClearNextInterval = false,
        flagWinner = false;

    /**
     * Running Var
     *
     */
    var curBase,
        curIdx,
        curTimeSpeedUpRec,
        curTimeSpeedDownRec,
        curTimeSpeedUpMaxRec,
        curTimeSpeedDownMaxRec,
        curTimeSpeedToResetRec,
        curIdxInit,
        curDisFix,
        curDisRemain,
        curBaseInit,
        curSpeedFix,
        curStopCallback;

    var init = function () {
        choices = choiceList;
        rstPosTextFix = (settingVal.fontLineHeight - settingVal.fontSize) / 2;
        rstVirtualHeight = choices.length * settingVal.fontLineHeight;
        rstDisSpeedUp = (Math.pow(settingVal.speedMax, 2) / settingVal.speedUp / 2) % rstVirtualHeight;
        rstDisSpeedDown = (Math.pow(settingVal.speedMax, 2) / settingVal.speedDown / 2) % rstVirtualHeight;
        rstLineHeightHalf = 0.5 * settingVal.fontLineHeight;
        curIdx = 0;
        curBaseInit = areaHeightHalf;
        curIdxInit = curIdx;
        curBase = areaHeightHalf - rstLineHeightHalf;
        log('WIDTH', areaWidth);
        log('HEIGHT', areaHeight);
        render();
    };

    var log = function () {
        if (!settingVal.debug) {
            return;
        }
        var args = [];
        args.push('[' + eleId + ']');
        args.push(new Date().getTime());
        for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        console.log.apply(this, args);
    };

    var render = function () {

        switch (status) {
            case constVal.STATE_SPEED_UP:
                speedUp();
                break;
            case constVal.STATE_SPEED_DOWN:
                speedDown();
                break;
            case constVal.STATE_SPEED_KEEP:
                speedKeep();
                break;
            case constVal.STATE_TO_RESET:
                speedToReset();
                break;
            case constVal.STATE_RESET:
                if (timer) {
                    clearInterval(timer);
                    timer = null;
                    curIdxInit = curIdx;
                    curBaseInit = curBase + rstLineHeightHalf;
                    log('Winner', choices[(curIdx + choices.length) % choices.length]);
                    if (typeof curStopCallback === 'function') {
                        curStopCallback.apply(this, [curIdx, choices[curIdx], choices]);
                    }
                    flagWinner = true;
                }
                break;
            default:
                return;
        }

        renderBg();
        renderObjs();
        renderWinner();
    };

    var renderBg = function () {
        var grd = ctx.createLinearGradient(0, 0, 0, areaHeight);
        grd.addColorStop(0, '#999');
        grd.addColorStop(0.3, '#fff');
        grd.addColorStop(0.7, '#fff');
        grd.addColorStop(1, '#999');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, areaWidth, areaHeight);
    };

    var renderObjs = function () {
        var idxHead = Math.ceil(curBase / settingVal.fontLineHeight);
        var idxFoot = Math.floor((areaHeight - curBase) / settingVal.fontLineHeight);
        for (var i = 1; i <= idxHead; i++) {
            renderObj(curBase - i * settingVal.fontLineHeight, curIdx - i);
        }
        renderObj(curBase, curIdx, flagWinner);
        for (var i = 1; i <= idxFoot; i++) {
            renderObj(curBase + i * settingVal.fontLineHeight, curIdx + i);
        }

        if (settingVal.debug) {
            ctx.beginPath();
            ctx.moveTo(0, curBase);
            ctx.lineTo(areaWidth, curBase);
            ctx.lineTo(areaWidth, curBase + settingVal.fontLineHeight);
            ctx.lineTo(0, curBase + settingVal.fontLineHeight);
            ctx.lineTo(0, curBase);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'blue';
            ctx.stroke();
        }

    };

    var renderObj = function (pos, idx, winner) {
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(areaWidth, pos);
        ctx.lineTo(areaWidth, pos + settingVal.fontLineHeight);
        ctx.lineTo(0, pos + settingVal.fontLineHeight);
        ctx.lineTo(0, pos);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#aaa';
        ctx.stroke();
        if (winner) {
            ctx.fillStyle = '#ff7979';
            ctx.font = (settingVal.fontSize + 2) + 'px ' + settingVal.fontFamily;
        } else {
            ctx.fillStyle = 'black';                
            ctx.font = settingVal.fontSize + 'px ' + settingVal.fontFamily;
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'hanging';
        ctx.fillText(choices[(idx + choices.length) % choices.length], areaWidthHalf, pos + rstPosTextFix);
    };

    var renderWinner = function () {
        ctx.beginPath();
        ctx.moveTo(0, areaHeightHalf - rstLineHeightHalf);
        ctx.lineTo(areaWidth, areaHeightHalf - rstLineHeightHalf);
        ctx.lineTo(areaWidth, areaHeightHalf + rstLineHeightHalf);
        ctx.lineTo(0, areaHeightHalf + rstLineHeightHalf);
        ctx.lineTo(0, areaHeightHalf - rstLineHeightHalf);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#ff7979';
        ctx.stroke();
    };

    var fixBaseAndIdx = function () {
        while (true) {
            if (curBase < areaHeightHalf - settingVal.fontLineHeight) {
                curBase += settingVal.fontLineHeight;
                curIdx = (curIdx + 1) % choices.length;
            } else if (curBase > areaHeightHalf) {
                curBase -= settingVal.fontLineHeight;
                curIdx = (curIdx - 1) % choices.length;
            } else {
                break;
            }
        }
        if (settingVal.debug && flagClearNextInterval) {
            clearInterval(timer);
            timer = null;
            status = constVal.STATE_RESET;
        }
    };

    var speedUp = function () {
        log('speedUp');
        var curTime = (new Date()).getTime() / 1000,
            curTimeDelta = curTime - curTimeSpeedUpRec,
            distance;
        if (curTime > curTimeSpeedUpMaxRec) {
            distance = rstDisSpeedUp + (curTime - curTimeSpeedUpMaxRec) * settingVal.speedMax;
            status = constVal.STATE_SPEED_KEEP;
        } else {
            distance = 0.5 * settingVal.speedUp * Math.pow(curTimeDelta, 2);
        }
        distance %= rstVirtualHeight;
        curIdx = (curIdxInit + Math.floor(distance / settingVal.fontLineHeight)) % choices.length;
        curBase = curBaseInit - (distance - (curIdx - curIdxInit) * settingVal.fontLineHeight) - rstLineHeightHalf;
        fixBaseAndIdx();
    };

    var speedDown = function () {
        log('speedDown');
        var curTime = (new Date()).getTime() / 1000,
            curTimeDelta = curTime - curTimeSpeedDownRec,
            distance;
        var isStop = false;
        if (curTime > curTimeSpeedDownMaxRec) {
            distance = curDisFix + rstDisSpeedDown;
            isStop = true;
        } else {
            distance = curDisFix + curTimeDelta * settingVal.speedMax - 0.5 * settingVal.speedDown * Math.pow(curTimeDelta, 2);
        }
        distance %= rstVirtualHeight;
        curIdx = (curIdxInit + Math.floor(distance / settingVal.fontLineHeight)) % choices.length;
        curBase = curBaseInit - (distance - (curIdx - curIdxInit) * settingVal.fontLineHeight) - rstLineHeightHalf;
        fixBaseAndIdx();
        if (isStop) {
            if (curBase === areaHeightHalf - rstLineHeightHalf) {
                status = constVal.STATE_RESET;
            } else {
                status = constVal.STATE_TO_RESET;
                curTimeSpeedToResetRec = (new Date()).getTime() / 1000;
                curDisRemain = curBase + 0.5 * settingVal.fontLineHeight - areaHeightHalf;
                if (curBase < areaHeightHalf - rstLineHeightHalf) {
                    curSpeedFix = -1 * settingVal.speedFix;
                } else {
                    curSpeedFix = settingVal.speedFix;
                }
                log('Winner Ready To Be ' + choices[curIdx], curIdx, choices, curIdxInit);
            }
        }
    };

    var speedKeep = function () {
        log('speedKeep');
        var curTime = (new Date()).getTime() / 1000,
            curTimeDelta = curTime - curTimeSpeedUpRec,
            distance;
        distance = rstDisSpeedUp + (curTime - curTimeSpeedUpMaxRec) * settingVal.speedMax;
        distance %= rstVirtualHeight;
        curIdx = (curIdxInit + Math.floor(distance / settingVal.fontLineHeight)) % choices.length;
        curBase = curBaseInit - (distance - (curIdx - curIdxInit) * settingVal.fontLineHeight) - rstLineHeightHalf;
        fixBaseAndIdx();
    };

    var speedToReset = function () {
        log('speedToReset');
        var curTime = (new Date()).getTime() / 1000,
            curTimeDelta = curTime - curTimeSpeedToResetRec,
            distanceIng,
            distance;
        distanceIng = curSpeedFix * curTimeDelta;
        if (Math.abs(distanceIng) >= Math.abs(curDisRemain)) {
            distanceIng = curDisRemain;
            status = constVal.STATE_RESET;
        }
        distance = curDisFix + rstDisSpeedDown + distanceIng;
        distance %= rstVirtualHeight;
        curBase = curBaseInit - (distance - (curIdx - curIdxInit) * settingVal.fontLineHeight) - rstLineHeightHalf;
        fixBaseAndIdx();
    };

    init();

    /**
     * Export Functions & Vals
     * 
     */
    var start = function (delay) {
        log('Enter Start');
        if (constVal.STATE_RESET !== status) {
            return;
        }
        if (null !== timer) {
            return;
        }
        if (0 === choices.length) {
            return;
        }
        setTimeout(function () {
            status = constVal.STATE_SPEED_UP;
            flagWinner = false;
            timer = setInterval(render, 1000 / settingVal.fps);
            curTimeSpeedUpRec = (new Date()).getTime() / 1000;
            curTimeSpeedUpMaxRec = curTimeSpeedUpRec + settingVal.speedMax / settingVal.speedUp;
            log('curTimeSpeedUpRec', curTimeSpeedUpRec);
            log('curTimeSpeedUpMaxRec', curTimeSpeedUpMaxRec);
        }, delay);
    };

    var stop = function (cb) {
        log('Enter Stop');
        if (null === timer) {
            return;
        }
        if (constVal.STATE_SPEED_KEEP !== status) {
            return;
        }
        curStopCallback = cb;
        status = constVal.STATE_SPEED_DOWN;
        curTimeSpeedDownRec = (new Date()).getTime() / 1000;
        curTimeSpeedDownMaxRec = curTimeSpeedDownRec + settingVal.speedMax / settingVal.speedDown;
        curDisFix = (rstDisSpeedUp + (curTimeSpeedDownRec - curTimeSpeedUpMaxRec) * settingVal.speedMax) % rstVirtualHeight;
        log('curTimeSpeedDownRec', curTimeSpeedDownRec);
        log('curTimeSpeedDownMaxRec', curTimeSpeedDownMaxRec);
    };

    var getStatus = function () {
        return status;
    };

    var clearNextInterval = function () {
        flagClearNextInterval = true;
    };

    var ret = {};
    ret.constVal = constVal;
    ret.start = start;
    ret.stop = stop;
    ret.getStatus = getStatus;
    ret.clearNextInterval = clearNextInterval;

    return ret;

};