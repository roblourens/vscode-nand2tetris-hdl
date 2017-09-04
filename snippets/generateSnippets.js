const fs = require('fs');
const path = require('path');
const stubs = require('./snippetStubs.json');

// "Mux": {
//     "prefix": "Mux",
//     "body": [
//         "Mux(a=$1, b=$2, sel=$3, out=$4);$5"
//     ],
//     "description": "Mux gate"
// }

main();

function main() {
    const result = stubs.reduce((obj, stubText) => {
        const snippet = getSnippet(stubText);
        obj[snippet.prefix] = snippet;
        return obj;
    }, Object.create(null));

    const dest = path.join(__dirname, 'hdl.snippets.json');
    fs.writeFile(dest, JSON.stringify(result, undefined, '    '), (err) => {
        if (err) console.error(err);
        else console.log(`Wrote ${Object.keys(result).length} snippets to ${dest}`);
    });
}

function getName(stubText) {
    return stubText.match(/(.*)\(/)[1];
}

function getParams(stubText) {
    const paramText = stubText.match(/\((.*)\)/)[1];
    const paramReg = /([^=]*)=,?\s*/g;
    let m;
    const result = [];
    while (m = paramReg.exec(paramText)) {
        result.push(m[1]);
    }

    return result;
}

function getBody(name, params) {
    let body = name + '(';
    let idx = 1;
    for (let i = 0; i < params.length; i++) {
        body += params[i] + '=$' + (i + 1);

        if (i === params.length - 1) {
            body += ');$' + (i + 2);
        } else {
            body += ', ';
        }
    }

    return body;
}

function getSnippet(stubText) {
    const name = getName(stubText);
    const params = getParams(stubText);

    return {
        prefix: name,
        body: [
            getBody(name, params)
        ],
        description: name + ' gate'
    };
}