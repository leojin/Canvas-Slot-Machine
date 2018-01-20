# SLOT MACHINE

# INSTALL
```html
<script type="text/javascript" src='slot.js'></script>
```

# USAGE
```html
<canvas id="container" width="300" height="200"></canvas>
```
```js
var nameList = [
    'NAME1',
    'NAME2',
    ...
];
var config = {
    speedUp: 2000,
    speedDown: 800,
    ...
};
var slotMachineIns = new SLOT(
    'container',
    nameList,
    config
);

// START
slotMachineIns.start(delayTime);

// STOP
slotMachineIns.stop(function (idx, name, list) {
    
});
```

# CONFIG

## speedUp
- The acceleration when speed up
- **unit** px/s
- **defalut** 500

## speedDown
- The acceleration when speed down
- **unit** px/s
- **defalut** 500

## speedMax
- The max speed
- **unit** px/s
- **defalut** 1000

## speedFix
- The speed when fix the final positin
- **unit** px/s
- **defalut** 10

## fontSize
- **defalut** 20

## fontFamily
- **defalut** 'Georgia'

## fontLineHeight
- **defalut** 40

## fps
- **defalut** 60

## debug
- Set true to enable log and outline
- **defalut** false

# CONSTVAL

VAL | 
---| 
constVal.STATE_RESET | 
constVal.STATE_SPEED_UP | 
constVal.STATE_SPEED_DOWN | 
constVal.STATE_SPEED_KEEP | 
constVal.STATE_TO_RESET | 

# FUNCTION

## start

### params

- delayTime: milliseconds 

## stop

### params

- callback: function
    - id: the winner index
    - name: the winner text
    - list: the original list

## getStatus

return the current status

# DEMO
