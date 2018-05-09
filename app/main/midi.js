var PythonShell = require('python-shell'),
    path = require('path'),
    settings = require('./settings')

var py = new PythonShell('midi.py', {scriptPath:__dirname, mode:'text', args: [
    settings.read('debug') ? 'debug' : '',
    ...settings.read('midi')
    ]
})


oscToMidi = (data)=>{
    var args = []
    for (i in data.args) {
        args.push(data.args[i].value)
    }
    py.send(JSON.stringify([data.port, data.address, ...args]))
}

stop = ()=>{
    py.childProcess.kill()
}

init = (receiveOsc)=>{
    py.on('message', function (message) {
        // console.log(message)
        var name, data
        try {
            [name, data] = JSON.parse(message)
        } catch (err) {
            // console.log(err)
        }
        if (name == 'log') {
            if (data.indexOf('ERROR') === 0) {
                console.error(data)
            } else {
                console.log(data)
            }
        } else if (name ==  'osc') {
            receiveOsc(data)
        } else if (name == 'error') {
            console.error('ERROR: MIDI: ' + data)
            stop()
        }
    })
}



module.exports = {
    send: oscToMidi,
    init: init,
    stop: stop
}
