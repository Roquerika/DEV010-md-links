const path = require('node:path'); //Trabaja con rutas de archivos y directorios
const fs = require('node:fs'); //Permite realiar operaciones de lectura y escritura de archivos (métodos síncronos y asincrónos)
const https = require('node:https');//Solicitudes seguras HTTP
const colors = require('colors');//Permite agregar color al texto de la consola

//Valida si la ruta es absoluta, sino la convierte a absoluta
const pathIsAbsolute = (route) => { //Se recibe la ruta
    const absoluteRoute = path.isAbsolute(route); //Validamos si es absoluta o relativa
    const resolveRoute = !absoluteRoute ? path.resolve(route) : route; // Si la ruta no es absoluta se covierte a absoluta, de lo contrario se emplea la ruta (path.resolve es una fnción global de node.js)
    return resolveRoute;
}

//Valida si la ruta existe
const pathExists = (route) => { 
    return new Promise((resolve, reject) => {
        //tres parámetros path, mode (ctte) y callback
        fs.access(route, fs.constants.F_OK, (err) => { //fs.access (función de fs) verifica si se puede acceder a un archivo: path es la ruta a validar, fs.constants.F_OK Comprueba si el archivo o directorio existe. Y error  se ejecuta una vez que se completa la verificación. La función de devolución de llamada toma un parámetro de error, donde null indica que no se encontraron errores y, por lo tanto, se puede acceder al archivo o directorio.
            err ? reject('Path does not exist') : resolve(true);
        })
    })
}

//Valida si es un archivo .md
const mdFile = (route) => {
    const fileExt = path.extname(route); //Saber cual es la extension del archivo a partir del método del módulo path de node.js
    return fileExt !== '.md' ? (() => { // si no es md, imprime un mensaje y retorna falso
        console.log(colors.red('No .md files found'));
        return false; 
    })() : true;
}

//Validar si es un directorio
//Buscar archivos en el directorio

// Valida si se puede leer el contenido del archivo
const readFile = (filePath) => { //método módulo fs en Node.js
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            err ? reject('Cannot read file') : resolve(data.toString());
        })
    })
}

//Buscando Links en el archivo
const findLinks = (content, filePath) => {
    const linksInFile = [];
    const linksRegExp = /\[([\p{L}0-9._ -]+)\]\((?!#)(https?:\/\/[a-zA-Z0-9\/._ -]+)\)/gu

    let match;
    while ((match = linksRegExp.exec(content)) !== null) {
        const linkText = match[1];
        const linkUrl = match[2];
        const link = { href: linkUrl, text: linkText, file: filePath };
        linksInFile.push(link);

    }
    return linksInFile;
}

//STATUS DEL LINK
const statusLink = (url) => {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            const statusCode = res.statusCode;
            let message;
            res.statusCode >= 400 ? message = 'fail' : message = 'ok';
            resolve({ statusCode, message });
        });
        req.on('close', () => {
            resolve({ message: 'connection_closed' });
        });
        req.on('error', (err) => {
            if (err.code === "ENOTFOUND") {
                resolve({ statusCode: 404, message: 'fail' })
            }
        })
    })
}

module.exports = {
    pathIsAbsolute,
    pathExists,
    mdFile,
    readFile,
    findLinks,
    statusLink
};