// Referenced from: http://www.sk89q.com/playground/jswav/
// Cuurently code doesn't play music in chrome, works fine in firefox

var audio = null;
var tone = null;

var context;
window.addEventListener('load', init, false);
function init() {
  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();
  }
  catch(e) {
    alert('Web Audio API is not supported in this browser');
  }
}

window.addEventListener('keydown', function(evt){
    if (evt.keyCode === 32 && tone === null) {
        console.log("Pressed!");
        tone = wave();
        tone.start(context.currentTime);
    }
});

window.addEventListener('keyup', function(evt){
    if (evt.keyCode ===  32) {
        console.log("Released!");
        tone.stop(context.currentTime);
        tone = null;
    }
});

function play() {
    audio = generate();
    audio.load();
    audio.play();
}

function wave() {
    var wave = context.createOscillator();
    wave.type = "sine";
    wave.frequency.value = document.getElementById("frequency").value;
    wave.connect(context.destination);
    return wave;
}

function generate() {
    var channels = document.getElementById("chanel").value;
    var sampleRate = document.getElementById("sampleRate").value;
    var bitsPerSample = document.getElementById("bitsPerSample").value;
    var frequency = document.getElementById("frequency").value;

    var seconds = document.getElementById("seconds").value;
    var volume = document.getElementById("volume").value;

    var attack = seconds * document.getElementById("attack").value / 100;
    var sustain = seconds * document.getElementById("sustain").value / 100;
    var decay = Math.pow(0.5*Math.log((frequency*volume)/sampleRate),2);

    var FM = document.getElementById("fm").value;
    var FMV = document.getElementById("fmV").value;

    var distortion = 0;

    var data = [];
    var samples = 0;
    
    // Generate the sine waveform
    for (var i = 0; i < sampleRate * seconds; i++) {
        for (var c = 0; c < channels; c++) {
            var v;
            var m = 0;
            if(i <= sampleRate * attack)
            {
                v = volume * (i/(sampleRate*attack));
            } else if (i - sampleRate * attack <= sampleRate * sustain) {
                v = volume;
            } else {
                v = volume * Math.pow((1-((i-(sampleRate*(attack + sustain)))/(sampleRate*(seconds-attack-sustain)))),decay);
            }
            if(FM !== 0)
            {
                m = FMV * Math.sin((2 * Math.PI) * (i / sampleRate) * FM)
            }
            v = v * Math.sin((2 * Math.PI) * (i / sampleRate) * frequency + m);
            data.push(pack("v", v));
            samples++;
        }
    }

    data = data.join('');
    
    // Format sub-chunk
    var chunk1 = [
        "fmt ", // Sub-chunk identifier
        pack("V", 16), // Chunk length
        pack("v", 1), // Audio format (1 is linear quantization)
        pack("v", channels),
        pack("V", sampleRate),
        pack("V", sampleRate * channels * bitsPerSample / 8), // Byte rate
        pack("v", channels * bitsPerSample / 8),
        pack("v", bitsPerSample)
    ].join('');

    // Data sub-chunk (contains the sound)
    var chunk2 = [
        "data", // Sub-chunk identifier
        pack("V", samples * channels * bitsPerSample / 8), // Chunk length
        data
    ].join('');
    
    // Header
    var header = [
        "RIFF",
        pack("V", 4 + (8 + chunk1.length) + (8 + chunk2.length)), // Length
        "WAVE"
    ].join('');

    var out = [header, chunk1, chunk2].join('');
    //var blob = new Blob(out, {type: 'audio/wav'});
    //var dataURI = URL.createObjectURL(blob);

    var dataURI = "data:audio/wav;base64," + escape(btoa(out));

    // audio = document.getElementById("embed");
    // audio.setAttribute('src', dataURI);
    // audio.setAttribute("autostart", true);
    // audio.setAttribute('type', 'audio/wav');

    // audio = document.createElement("source");
    // audio.setAttribute('src', dataURI);
    // audio.setAttribute('type', 'audio/wav');
    // document.getElementById("player").appendChild(audio);

    // var audio = new Audio(dataURI);
    // audio.src = dataURI;
    // audio.volume = 1;
    // audio.play();

    audio = new Audio(dataURI);
    audio.addEventListener('ended', function() { audio = null; });
    audio.autoplay = false;
    audio.setAttribute('type', 'audio/wav');
    //audio.setAttribute('loop', 'loop');
    return audio;
    
    // Generate the hex dump
    //document.getElementById('dump').style.display = 'block';
    //document.getElementById('dump-contents').innerHTML = hexDump(out);
}

// Base 64 encoding function, for browsers that do not support btoa()
// by Tyler Akins (http://rumkin.com), available in the public domain
if (!window.btoa) {
    function btoa(input) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + 
                     keyStr.charAt(enc3) + keyStr.charAt(enc4);
        } while (i < input.length);

        return output;
    }
}

// pack() emulation (from the PHP version), for binary crunching
function pack(fmt) {
    var output = '';
    
    var argi = 1;
    for (var i = 0; i < fmt.length; i++) {
        var c = fmt.charAt(i);
        var arg = arguments[argi];
        argi++;
        
        switch (c) {
            case "a":
                output += arg[0] + "\0";
                break;
            case "A":
                output += arg[0] + " ";
                break;
            case "C":
            case "c":
                output += String.fromCharCode(arg);
                break;
            case "n":
                output += String.fromCharCode((arg >> 8) & 255, arg & 255);
                break;
            case "v":
                output += String.fromCharCode(arg & 255, (arg >> 8) & 255);
                break;
            case "N":
                output += String.fromCharCode((arg >> 24) & 255, (arg >> 16) & 255, (arg >> 8) & 255, arg & 255);
                break;
            case "V":
                output += String.fromCharCode(arg & 255, (arg >> 8) & 255, (arg >> 16) & 255, (arg >> 24) & 255);
                break;
            case "x":
                argi--;
                output += "\0";
                break;
            default:
                throw new Error("Unknown pack format character '"+c+"'");
        }
    }
    
    return output;
}

// Generates a hex dump
function hexDump(out) {
    var lines = [];
    
    for (var i = 0; i < out.length; i += 16) {
        var hex = [];
        var ascii = [];           
        
        for (var x = 0; x < 16; x++) {
            var b = out.charCodeAt(i + x).toString(16).toUpperCase();
            b = b.length == 1 ? '0' + b : b;
            hex.push(b + " ");
            
            if (out.charCodeAt(i + x) > 126 || out.charCodeAt(i + x) < 32) {
                ascii.push('.');
            } else {
                ascii.push(out.charAt(i + x));
            }
            
            if ((x + 1) % 8 == 0) {
                hex.push(" ");
            }
        }
        
        lines.push([hex.join(''), ascii.join('')].join(''));
    }
    
    return lines.join('\n');
}