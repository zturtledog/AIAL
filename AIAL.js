// const { exit, env } = require('process');
const fs = require('fs')
const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });

let storclmp = {}
let varibles = []
let headers = []
let clumps = [
  {
    action:"add",
    assemble: (params) => {
      //
    },
    interperet: (params) => {
      // console.log("fd:",parseFloat(gevar(params[0]))+parseFloat(fmrval(params[1])))
      sevar(params[0],parseFloat(gevar(params[0]))+parseFloat(fmrval(params[1])))
    }
  },
  {
    action:"sub",
    assemble: (params) => {
      //
    },
    interperet: (params) => {
      sevar(params[0],parseFloat(gevar(params[0]))-parseFloat(fmrval(params[1])))
    }
  },
  {
    action:"mul",
    assemble: (params) => {
      //
    },
    interperet: (params) => {
      sevar(params[0],parseFloat(gevar(params[0]))*parseFloat(fmrval(params[1])))
    }
  },
  {
    action:"mod",
    assemble: (params) => {
      //
    },
    interperet: (params) => {
      sevar(params[0],parseFloat(gevar(params[0]))%parseFloat(fmrval(params[1])))
    }
  },
  {
    action:"div",
    assemble: (params) => {
      //
    },
    interperet: (params) => {
      sevar(params[0],parseFloat(gevar(params[0]))/parseFloat(fmrval(params[1])))
    }
  },
  {
    action:"and",
    assemble: (params) => {
      //
    },
    interperet: (params) => {
      sevar(params[0],parseInt(gevar(params[0]))&&parseInt(fmrval(params[1])))
    }
  },
  {
    action:"not",
    assemble: (params) => {
      //
    },
    interperet: (params) => {
      sevar(params[0],!parseInt(gevar(params[0])))
    }
  },
  {
    action:"grt",
    assemble: (params) => {
      //
    },
    interperet: (params) => {
      sevar(params[0],parseFloat(gevar(params[0]))>parseFloat(fmrval(params[1])))
    }
  },
  {
    action:"lst",
    assemble: (params) => {
      //
    },
    interperet: (params) => {
      sevar(params[0],parseFloat(gevar(params[0]))<parseFloat(fmrval(params[1])))
    }
  },
  {
    action:"gte",
    assemble: (params) => {
      //
    },
    interperet: (params) => {
      sevar(params[0],parseFloat(gevar(params[0]))>=parseFloat(fmrval(params[1])))
    }
  },
  {
    action:"lte",
    assemble: (params) => {
      //
    },
    interperet: (params) => {
      sevar(params[0],parseFloat(gevar(params[0]))<=parseFloat(fmrval(params[1])))
    }
  },
  {
    action:"def",
    assemble: (params) => {
      //
    },
    interperet: (params) => {
      varibles.push({
        name:params[0],
        value:fmrval(params[1])
      })
    }
  },
  {
    action:"or",
    assemble: (params) => {
      //
    },
    interperet: (params) => {
      sevar(params[0],parseFloat(gevar(params[0]))||parseFloat(fmrval(params[1])))
    }
  },
  {
    action:"del",
    assemble: (params) => {
      //
    },
    interperet: (params) => {
      devar(params[0])
    }
  },
]

let callstack = [
  {
    name: "print",
    interperet: (pram) => {
      for (let i = 0; i < pram.length; i++) {
        pram[i] = fmrval(pram[i])
      }

    console.log(pram.join(", ").replaceAll("[object Object]", "[UserDefinedCodeObject]"))
  }
  },
  {
    name: "set-input-call",
    interperet: (pram) => {
      storclmp.inputcallback = () => {
        interpret(pram[0])
      }
    }
  },
  {
    name: "ask-input",
    interperet: () => {
      //TODO: storclmp.input = return async (storclmp.inputcallback()) -> {returnOn ().input}
      readline.question("> ",(str)=>{
        storclmp.input = str
        storclmp.inputcallback()
      })
    }
  },
  {
    name: "put-input",
    interperet: (pram) => {
      sevar(
        pram[0],
        storclmp.input
      )
    }
  },
  {
    name: "exit",
    interperet: (pram) => {
      process.exit(parseInt(pram[0]))
    }
  },
]

/*
    if var, val
    run var
    cll proc list
//*/

console.log("@AIAL-v:1.0.0")
parseCommand()

function parseCommand() {
  let p = fs.readFileSync(process.argv[3]).toString()
  if (process.argv[2] == "-interpret") {
    interpret(parse(loadcll(p)))
  }
}

function loadlibrary(path) {
  let data = JSON.parse(fs.readFileSync(path).toString())
  for (let i = 0; i < data.length; i++) {
    callstack.push({
      name : data[i].name,
      interperet : eval(data[i].interperet)
    })
  }
}

function loadcll(file) {
  let data = file.split("\r\n")
  
  let callorder = ""
  for (let i = 0; i < data.length; i++) {
    data[i] = data[i].trim()
    let cmd = data[i].split(" ")[0]
    let info = data[i].split(" ")[1]
    if (cmd == "using") {
      loadlibrary(info+".json")
    }
    if (cmd == "package") {
      callorder += fs.readFileSync(info+".aial").toString()+"\r\n"
    }
  }
  // console.log(parse(callorder))

  return callorder
}

function parse(code) {
  let data = code.split("\r\n")

  for (let i = 0; i < data.length; i++) {
    data[i] = data[i].trim().split(";")[0]

    //string weeding
    data[i] = weedstrings(data[i])

    data[i] = cleansublocks(data[i])
  }

  data = block(data)

  // console.log(formatjson(JSON.stringify(data)))

  return data
}

function gevar(name) {
  for (let i = 0; i < varibles.length; i++) {
    if (varibles[i].name == name) {
      return varibles[i].value
    }
  }
}

function devar(name) {
  for (let i = 0; i < varibles.length; i++) {
    if (varibles[i].name == name) {
      varibles.splice(i, 0)
    }
  }
}

function sevar(name, val) {
  for (let i = 0; i < varibles.length; i++) {
    if (varibles[i].name == name) {
      varibles[i].value = val;
    }
  }
}

function fmrval(val) {
  if ((val + "").charAt(0) == "$") {
    return gevar(val.replace("$", ""))
  } else {
    return val
  }
}

function weedstrings(d) {
  let stringending = []
  let recordstring = ""
  let recording = false
  for (let i = 0; i < d.length; i++) {
    if (d.charAt(i) == "'") {
      if (recordstring.length > 0)
        stringending.push(
          recording ? {
            actial: "​" + recordstring
          } : recordstring.split(" ")
        )
      recordstring = "";
      recording = !recording
    }
    if (d.charAt(i) != "'")
      recordstring += d.charAt(i)
  }
  if (recordstring.length > 0)
    stringending.push(
      recording ? {
        actial: "​" + recordstring
      } : recordstring.split(" ")
    )
  return stringending
}

function cleansublocks(d) {
  let end = []
  for (let i = 0; i < d.length; i++) {
    // console.log(d[i].constructor.name,":", d[i])
    if (d[i].constructor.name == "Array") {
      for (let j = 0; j < d[i].length; j++) {
        if (d[i][j].length > 0)
          end.push(d[i][j])
      }
    } else if (d[i].constructor.name == "Object") {
      end.push(d[i].actial)
    }
  }
  return end
}

function block(t) {
  let end = [];
  let record = [];
  let depth = 0;

  recording = false;

  for (let i = 0; i < t.length; i++) {
    if (t[i] == ":end") {
      if (depth == 1) {
        recording = false;
        end.push({
          constructor: {
            name: "Block"
          },
          info: block(record)
        });
        record = [];
        depth--;
      } else {
        depth--;
      }
      // print(t[i]+"::"+i+"::"+depth)
    }
    if (recording) {
      // if (t[i] != ":start" && t[i] != ":end")
      record.push(t[i]);
    } else {
      if (t[i] != ":start" && t[i] != ":end")
        end.push(t[i])
    }
    if (t[i] == ":start") {
      recording = true;
      depth++;
      // print(t[i]+"::"+i+"::"+depth)
    }
  }
  return array(end);
}

function array(b) {
  let end = [];
  for (let i = 0; i < b.length; i++) {
    if (b[i].constructor.name == "Array") {
      let end_ = {
        action: b[i][0],
        parameters: [],
        constructor: {
          name: "Action"
        }
      }
      for (let j = 1; j < b[i].length; j++) {
        end_.parameters[j - 1] = b[i][j]
      }
      end.push(end_)
    } else {
      end.push(b[i])
    }
  }
  return end
}

function interpret(prog) {
  let find = (nme) => {
    for (let i = 0; i < clumps.length; i++) {
      if (clumps[i].action == nme) {
        return clumps[i]
      }
    }
    return {
      interperet: () => {}
    }
  }
  for (let i = 0; i < prog.length; i++) {
    if (prog[i].constructor.name == "Action") {
      // console.log(prog[i])

      if (i + 1 < prog.length && prog[i + 1].constructor.name == "Block") {
        let pra = prog[i].parameters
        pra.push(prog[i + 1].info)
        if (prog[i].action == "halt") {
          return
        } else if (prog[i].action == "if") {
          if (!!fmrval(prog[i].parameters[0])) {
            setTimeout(() => {
              interpret(prog[i].parameters[1])
            }, 1)
          }
        } else if (prog[i].action == "llp") {
          for (let j = 0; j < parseInt(fmrval(prog[i].parameters[0])); j++) {
            setTimeout(() => {
              interpret(pra[1])
            }, 1)
          }
        } else if (prog[i].action == "run") {
          setTimeout(() => {
            interpret(gevar(prog[i].parameters[0]))
          }, 1)
        } else if (prog[i].action == "cll") {
          for (let j = 0; j < callstack.length; j++) {
            if (callstack[j].name == prog[i].parameters[0]) {
              callstack[j].interperet(pra.slice(1)) //
            }
          }
        } else {
          find(prog[i].action).interperet(pra)
        }
        // console.log(pra)
      } else {
        //check outliers
        if (prog[i].action == "run") {
          setTimeout(() => {
            interpret(gevar(prog[i].parameters[0]))
          }, 1)
        } else if (prog[i].action == "cll") {
          for (let j = 0; j < callstack.length; j++) {
            // console.log(callstack[j].name,prog[i].parameters[0])
            if (callstack[j].name == prog[i].parameters[0]) {
              let p = Array.from(prog[i].parameters)
              // console.log(prog[i].parameters.slice(1))
              callstack[j].interperet(prog[i].parameters.slice(1)) //
              prog[i].parameters = p
            }
          }
        } else {
          find(prog[i].action).interperet(prog[i].parameters)
        }
      }
    }
  }
}

function formatjson(jsn) {
  let data = jsn
    .replaceAll("}", "\n}\n")
    .replaceAll("]", "\n]\n")
    .replaceAll("{", "\n{\n")
    .replaceAll("[", "\n[\n")
    .replaceAll(",", "\n,\n")
    .replaceAll(":", " : ")
    .split("\n")

  let end = ""
  let depth = 0
  for (let i = 0; i < data.length; i++) {
    data[i] = data[i].trim().replaceAll(/[\s]+/g, " ")

    if (data[i].length > 0) {
      if (data[i] == "]" || data[i] == "}") {
        depth--
      }
      let indent = ""
      for (let j = 0; j < depth; j++) {
        indent += "        "
      }
      if (data[i] != ",") {
        end += indent + data[i] + "\n"
      } else {
        end += ",\n"
      }
      // end += (data[i] == ","? "," : indent) + (data[i] != ","? data[i] + "\n" : "")
      if (data[i] == "[" || data[i] == "{") {
        depth++
      }
    }
  }
  data = end.split("\n,").join(",")
  return data
}

/*

add var, val
sub var, val
mul var, val
mod var, val
div var, val
and var, val
not var, val
grt var, val, val
lst var, val, val
gte var, val, val
lte var, val, val
def name, val
or var, val
if var, val
// nsp name, list
// alw namespace, block
gto header
run var
cll proc list
del var
set var, val

*/
