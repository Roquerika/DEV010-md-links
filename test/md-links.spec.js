
const path = require('node:path');

const { mdLinks } = require('../index.js');

const {
  pathIsAbsolute,
  pathExists,
  mdFile,
  readFile,
  findLinks,
  statusLink,
} = require('../modules.js')

const { simpleStats, statsValidate, brokenLinks, totalLinks, } = require('../stats.js');


//Función md-links

describe('mdLinks', () => {

  it('Debería ser una función', () => {
    expect(typeof mdLinks).toBe('function')
  });
  it('Debería existir el archivo en la ruta indicada', () => {
    return expect(pathExists('./archivos/proyectos.md')).toBeTruthy()
  })
  it('Debería devolver un array vacío si no hay links', () => {
    return mdLinks('./archivos/sinLinks.md')
      .then((result) => {
        expect(result).toEqual([])
      })
  })
  it('Debería devolver un arreglo', () => {
    return mdLinks('./archivos/proyectos.md')
      .then((result) => {
        expect(result).toEqual([
          {
            "file": "C:\\Users\\roque\\Desktop\\Bootcamp\\md-links\\DEV010-md-links\\archivos\\proyectos.md",
            "href": "https://github.com/Roquerika/DEV010-cipher",
            "text": "Cipher",
          },
          {
            "file": "C:\\Users\\roque\\Desktop\\Bootcamp\\md-links\\DEV010-md-links\\archivos\\proyectos.md",
            "href": "https://github.com/Roquerika/DEV010-data-lovers",
            "text": "Data Lovers Breaking bad",
          },
          {
            "file": "C:\\Users\\roque\\Desktop\\Bootcamp\\md-links\\DEV010-md-links\\archivos\\proyectos.md",
            "href": "https://github.com/Roquerika/DEV010-social-network",
            "text": "Social Network New Wave",
          },
        ]);
      })
  });
  it('Debería devolver enlaces con estado y propiedades OK cuando la opción de validación sea verdadera', () => {
    const filePath = './archivos/proyectos.md';
    const options = { validate: true };
    return mdLinks(filePath, options)
      .then((result) => {
        expect(Array.isArray(result)).toBe(true);
        result.forEach((link) => {
          expect(link).toHaveProperty('status');
          expect(link).toHaveProperty('ok');
        });
      })
  })
  it('Debería registrar el mensaje correcto cuando no sea un archivo .md', () => {
    mdLinks('archivos/texto.txt')
      .then((links) => {
        console.log('found Links:', links);
      })
      .catch((error) => {
        console.error('Error:', error);
      })
  })
  it('Debería regresar un error si la ruta no existe', () => {
    mdLinks('archivos/muchoText.md')
      .catch((err) => {
        console.error(`ERROR ${err}`);
      })
  })
  it('debería  devolver una serie de enlaces sin validación', () => {
    return mdLinks('./archivos/pruebaDos.md').then(result => {
      expect(result).toEqual([
        {
          href: 'https://developer.mozilla.org/es/docs/Web/JavaScript',
          text: 'JavaScript',
          file: 'C:\\Users\\roque\\Desktop\\Bootcamp\\md-links\\DEV010-md-links\\archivos\\pruebaDos.md'
        },
        {
          href: 'https://bootcamp.laboratoria.la/es/web-dev',
          text: 'Bootcamp de desarrollo web',
          file: 'C:\\Users\\roque\\Desktop\\Bootcamp\\md-links\\DEV010-md-links\\archivos\\pruebaDos.md'
        }
      ]);
    });
  });

  it('debería devolver una serie de enlaces con validación', () => {
    return mdLinks('./archivos/pruebaDos.md', { validate: true }).then(result => {
      expect(result).toEqual([
        {
          href: 'https://developer.mozilla.org/es/docs/Web/JavaScript',
          text: 'JavaScript',
          file: 'C:\\Users\\roque\\Desktop\\Bootcamp\\md-links\\DEV010-md-links\\archivos\\pruebaDos.md',
          status: 200,
          ok: 'ok',
        },
        {
          href: 'https://bootcamp.laboratoria.la/es/web-dev',
          text: 'Bootcamp de desarrollo web',
          file: 'C:\\Users\\roque\\Desktop\\Bootcamp\\md-links\\DEV010-md-links\\archivos\\pruebaDos.md',
          status: 200,
          ok: 'ok',
        },
      ]);
    });
  });
  it('debería devolver un enlace con validación: fail ', () => {
    return mdLinks('./archivos/statusFail.md', { validate: true }).then(result => {
      expect(result).toEqual([
        {
          href: 'https://www1.google.com',
          text: 'Enlace roto Google',
          file: 'C:\\Users\\roque\\Desktop\\Bootcamp\\md-links\\DEV010-md-links\\archivos\\statusFail.md',
          status: 404,
          ok: 'fail',
        },
      ]);
    });
  });
});


// modules.js

describe('pathIsAbsolute', () => {
  const relativePath = './some/relative/path'
  const absolutePath = path.resolve(relativePath);
  it('Debería devolver una ruta absoluta cuando se le da una ruta relativa', () => {
    expect(pathIsAbsolute(relativePath)).toEqual(absolutePath);
  });
  it('Debería devolver la ruta sin cambios si la ruta dada es absoluta', () => {
    expect(pathIsAbsolute(absolutePath)).toEqual(absolutePath);
  });
});

describe('pathExists', () => {
  it('Debería resolver la promesa si la ruta existe', () => {
    const pathThatExists = './archivos/proyectos.md'
    return expect(pathExists(pathThatExists)).resolves.toBe(true);
  });
  it('Debería rechazar la promesa si la ruta no existe', () => {
    const thisRouteNotExists = './this/route/does/not/exist.md'
    return expect(pathExists(thisRouteNotExists)).rejects.toEqual('Path does not exist');
  });
});

describe('mdFile', () => {
  it('Debería devolver verdadero si es un archivo con extensión .md', () => {
    const pathMd = './archivos/misProyectos.md'
    expect(mdFile(pathMd)).toBe(true)
  });
  it('Debería devolver falso si no es un archivo con .md', () => {
    const noMd = './is/not/md/file.txt';
    expect(mdFile(noMd)).toBe(false)
  });
});

describe('readFile', () => {
  it('Debería resolver la promesa si el archivo se puede leer', () => {
    const pathTest = './archivos/pruebaTres.md'
    return expect(readFile(pathTest)).resolves.toEqual('Texto')
  })
  it('Debería rechazar la promesa si el archivo no se puede leer.', () => {
    const pathTest = './archivos\pruebaDos.md'
    return expect(readFile(pathTest)).rejects.toEqual('Cannot read file')
  });
});

describe('statusLink', () => {
  it('debería devolver un objeto con status 200 y ok para un enlace existente', () => {
    return statusLink('https://www.google.com').then(result => {
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('ok');
    });
  })
  it('debería devolver un objeto con status 404 y fail para un enlace inexistente', () => {
    return statusLink('https://www.enlacequenoexiste.com').then(result => {
      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('fail');
    });
  });
});

describe('findLinks', () => {
  it('debería devolver un array de enlaces encontrados en el contenido', () => {
    const content = `
      Enlace [Google](https://www.google.com)
      Otro [Prueba](https://www.prueba.com)
    `;

    const filePath = '/ruta/archivo.md';

    const result = findLinks(content, filePath);

    expect(result).toEqual([
      {
        href: 'https://www.google.com',
        text: 'Google',
        file: '/ruta/archivo.md'
      },
      {
        href: 'https://www.prueba.com',
        text: 'Prueba',
        file: '/ruta/archivo.md'
      }
    ]);
  });

  it('debería devolver un array vacío si no hay enlaces en el contenido', () => {
    const content = 'Este sin enlaces.';
    const filePath = '/ruta/archivo.md';

    const result = findLinks(content, filePath);

    expect(result).toEqual([]);
  });
});


// stats.js

const mockStatsLinksArray = [
  { href: 'https://prueba.com', text: 'prueba', file: '/ruta/archivo.md', status: 200, ok: 'ok' },
  { href: 'https://google.com', text: 'Google', file: '/ruta/archivo.md', status: 404, ok: 'fail' },
];
describe('brokenLinks', () => {
  it('brokenLinks debería devolver la cantidad correcta de enlaces rotos', () => {
    const result = brokenLinks(mockStatsLinksArray);
    expect(result).toBe(1);
  });
});
describe('totalLinks', () => {
  it('totalLinks debería devolver la cantidad correcta de enlaces totales', () => {
    const result = totalLinks(mockStatsLinksArray);
    expect(result).toBe(2);
  });
});
describe('simpleStats', () => {
  it('simpleStats debería devolver una cadena de texto con el total de enlaces y enlaces únicos', () => {
    const result = simpleStats(mockStatsLinksArray);
    expect(result).toBe('Total: 2\nUnique: 2');
  });
});
describe('statsValidate', () => {
  it('statsValidate debería devolver una cadena de texto con el total de enlaces, enlaces únicos y enlaces rotos', () => {
    const result = statsValidate(mockStatsLinksArray);
    expect(result).toBe('Total: 2\nUnique: 2\nBroken: 1');
  });
});
