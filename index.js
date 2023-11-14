const colors = require('colors'); //Colorea las salidas de la consola
const fs = require('node:fs'); //Permite trabajar con el sistema de archivos
const {
  pathIsAbsolute,
  pathExists,
  mdFile,
  readFile,
  findLinks,
  statusLink
} = require('./modules.js');

const mdLinks = (route, options = {validate: false}) => { //la función mdLinks toma dos argumentos route (ruta de archivo md) y options (objeto con propiedad validate, para determinar si se debe validar enlaces o no)
  return new Promise((resolve, reject) => { //Retorna una promesa y es asincrónica
    const resolvedPath = pathIsAbsolute(route); //Verifica si la ruta es absoluta
    pathExists(resolvedPath).then((exists) => { //verifica si la ruta existe
      const isMdFile = mdFile(resolvedPath); // si el archivo existe se verifica si es un archivo Md usando mdFile
      if (isMdFile) {
        readFile(resolvedPath).then((data) => { //Si es Md se lee el contenido del archivo con readFile
          const foundLinks = findLinks(data, resolvedPath); //se procesa en busca de enlaces con la función findLinks
         //Si se específica la opción validate como true los enlaces se validarán realizando una solicitud HTTP para comprobar su estado
         //Si no se especifica la opción validate simplemente se extraen los enlaces
          if (options.validate) {
            const linksArray = foundLinks.map((link) => {
              const linkProperties = {
                href: link.href,
                text: link.text,
                file: link.file,
              }
              const linkStatus = statusLink(link.href)
                .then((status) => {
                  return {
                    ...linkProperties,
                    status: status.statusCode,
                    ok: status.message,
                  }
                })
              return linkStatus;
            });
        //Si se elige validar los enlaces, se crea un array de promesas para verificar el estado de cada enlace con promiseHooks.all
        //con promise.all espero a que todas las validaciones se completen
        //al completarse las validaciones se devuelve un array de objetos que contienen nfo sobre los enlaces
           return Promise.all(linksArray);
          } else {
            const foundLinks = findLinks(data, resolvedPath);
            return foundLinks;
          }
        })
          .then((results) => {
            const resultsArray = results.flat();
            resolve(resultsArray.length === 0 ? [] : resultsArray)
          })
          .catch((err) => {
            reject(err)
          })
      } 
    })
    .catch((err) => {
      console.log(colors.red(`Error ${err}`))
    })
  })
}

module.exports = { mdLinks }
