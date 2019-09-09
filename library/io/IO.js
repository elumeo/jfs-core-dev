const {File} = require('../filesystem/file.js');

const fs = require('fs');
const {sep, resolve} = require('path');
const {question} = require('readline-sync');

function setMask(number, setting)
{
     do
     {
          if (typeof number !== 'string') number = number.toString();
          if (number.length >= setting) break;
          number = '0' +number;
     } while (number.length < setting)
     return number;
}

function date(string)
{
     let date = new Date();

     let format =
     {
          'd': date.getDate(),
          'M': date.getMonth()+1,
          'y': date.getFullYear(),
          'h': date.getHours(),
          'm': date.getMinutes(),
          's': date.getSeconds()
     };

     let results = [];

     let length = char =>
     {
          let start = i = string.indexOf(char);
          while(string[i] === char) i++;
          return i -start;
     }

     let x = 0;
     for (key in format)
     {
          let size = length(key);
          let blueprint = '';
          for (var i = 0; i < size; i++) blueprint += key;
          string = string.replace(blueprint, setMask(format[key], size));
     }

     return string;
}

class Log
{
     constructor(location, logText)
     {
          let path = location +sep +date('dd-MM-yyyy hh:mm:ss');
          this.file = new File(path, true);
          this.file.edit(logText);
     }
}

module.exports.Log = Log;

let positive = ['true', '1', 'y', 'j', 'yes', 'ja', 'Yes', 'Ja', 'YES', 'JA'];
let negative = ['false', '0', 'n', 'no', 'nein', 'No', 'Nein', 'NO', 'NEIN'];

module.exports.input =
{
     text: (title, list = [], contain = false) =>
     {
       let type, fail = {};
       if (list.length) title = `${title} (${list.join(', ')})`;
       for (let key of ['blackList', 'whiteList']) if (!list[key]) list[key] = [];
       do {
         if (type) console.log('Invalid. Retry.');
         type = question(`${title}`);
         fail.blackList = !contain && list.includes(type);
         fail.whiteList = contain && !list.includes(type);
       } while (fail.blackList || fail.whiteList);
       return type;
     },
     bool: (text = '') =>
     {
          while (true)
          {
            let response = question(text +' (y/n): ');
            let checkResponse = answer => { return answer === response };
            let isTrue = positive.find(checkResponse) !== undefined;
            let isFalse = negative.find(checkResponse) !== undefined;
            let error = !isTrue && !isFalse || isTrue && isFalse;

            if (!error)
            {
                 if (isTrue) return true;
                 if (isFalse) return false;
            }

            console.log('Invald. Retry.');
          }
     },
     password: (text = '') =>
     {
          return question(`${text}`, {hideEchoBack: true});
     }
}
