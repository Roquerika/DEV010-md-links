const colors = require('colors');
const figlet = require("figlet");
const { mdLinks } = require('./index.js');
const { simpleStats, statsValidate } = require('./stats.js')

const route = process.argv[2]
const [, , ...args] = process.argv;
const validateOption = args.includes('--validate');
const statsOption = args.includes('--stats');

const comoUsar = 'Uso: md-links <path-to-file> [options]';
const comandos = '--validate: valida el estado de los enlaces encontrados\n--stats: Proporciona estadísticas acerca de los enlaces'
const descripcion = 'Es una herramienta CLI que permite buscar y extraer enlaces de un archivo .md, valida el estado de cada enlace y genera estadísticas a partir de los enlaces encontrados.'

if(!route) {
  figlet('md-links', { font: 'Digital' }, (err, result) => {
    console.log(err || result)
    console.log(colors.green(descripcion))
    console.log(colors.blue(comoUsar))
    console.log(colors.cyan(comandos))
  })
} else {
if (validateOption && statsOption) {
  mdLinks(route, { validate: true })
    .then((links) => {
      console.log(colors.blue(statsValidate(links)));
    })
    .catch((err) => {
      console.log(colors.red(err));
    });
} else if (validateOption && !statsOption) {
  mdLinks(route, { validate: true })
  .then((links) => {
    if(links.length === 0) {
      console.log(`No links found`.magenta)
    } else {
      console.log(links)
    }
  })
  .catch((err) => {
    console.log(colors.red(err))
  });
} else if (statsOption && !validateOption) {
  mdLinks(route, { validate: false })
    .then((links) => {
      console.log(colors.blue(simpleStats(links)));
    })
    .catch((err) => {
      console.log(colors.red(err));
    });
} else if(!validateOption && !statsOption) {
  mdLinks(route, {validate: false})
  .then((links) => {
    if(links.length === 0) {
      console.log(`No links found`.magenta)
    } else {
      console.log(links)
    }
  })
  .catch((err) => {
    console.log(colors.red(err))
  });
} else {
  console.log('Invalid command, enter --validate and/or --stats'.red.bold);
}
}

// node cli.js archivos/misProyectos.md true