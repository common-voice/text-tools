const LINES_IN_CROWDIN = 20000;
const START_POINT = 2633;
const MIN_WORDS = 1;
const MAX_WORDS = 14;

const readline = require('readline');
const fs = require('fs');

const FILE_PATH = './french.txt';
const OLD_OUTPUT_PATH = './output-french-old.csv';
const OUTPUT_PATH = './output-french.csv';

const output = fs.createWriteStream(OUTPUT_PATH);
let count = 0;
let defined = {};

if (START_POINT === 0) {
  keepGoing();
} else {
  appendExisting();
}

function appendExisting() {
  const rl = readline.createInterface({
    input: fs.createReadStream(OLD_OUTPUT_PATH),
  });

  rl.on('line', (line) => {
    if (count < START_POINT) {
      output.write(line + '\n');
      ++count;
    }
  });

  rl.on('close', keepGoing);
}

function keepGoing() {
  const rl = readline.createInterface({
    input: fs.createReadStream(FILE_PATH),
  });

  rl.on('line', (line) => {
    let lines = line.replace(/[\"”“]/g, '')
                    .split(/(\||\.|\!|\?) /g)
                    .map((element, index, array) => {
		                  if((index+1) % 2)
  		                  return (array[index+1])? element.concat(array[index+1]) : element;
                      else
    	                  return ;
                    })
                    .filter(function(element){return element});
    lines.forEach(l => {
      if (l.startsWith('--')) {
        l = l.substr(2);
      }

      l = l.trim();

      // filter by count of words.
      const length = l.split(' ').length;
      if (length < MIN_WORDS || length > MAX_WORDS) {
        return;
      }

      if (defined[l]) {
        return;
      }
      defined[l] = true;

      l && output.write(`"${++count}"|"${l}"\n`);
    });
  });

  rl.on('close', () => {
    for (var i = count + 1; i <= LINES_IN_CROWDIN; i++) {
      output.write(`"${++count}"|""\n`);
    }
  });
}
