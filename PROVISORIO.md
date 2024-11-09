

# Validación Proyectos

De momento estoy utilizando los modelos y Mongoose para crear registros/documentos en la base de datos, esto funciona correctamente pero siempre debe haber validación en el servidor antes de intentar almacenar los datos (la base de datos devuelve #500 si los datos no se ajustan a los parámetros esperados).

Con Express puedo utilizar Express Validator (igual que en el proyecto anterior) para escribir toda la validación ya sea en el controlador, en el router o dentro de un middleware. Primero debo instalar esta dependencia:

> `npm i express-validator`

Una vez instalado debo importar `body` (este me permite evaluar el body de un POST) en el router "src/routes/projectRoutes.ts":

`import { body } from 'express-validator';`

Puedo escribir las validaciones en el router para evitar cargar toda esta lógica en el controlador:

```
router.get('/', 
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente ess obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción es obligatoria'),
    ProjectController.getAllProject);
```

Para que estas validaciones funcionen también debo tener el middleware que maneja la validación, para esto voy a crear el archivo "src/middleware/validation.ts"


---

Nota: Tengo un problema de versiones en las dependencias, la última version de los "types de Express" marca un error que no permite el código del profesor ni admite el mismo código en el middleware que he utilizado en el proyecto anterior. Esta dependencia la he instalado como:

`npm i -D @types/express`

Esto instaló la última versión de la dependencia:

`"@types/express": "^5.0.0"`

Para corregir el error he cambiado la versión de esta dependencia en el "package.json":

 y luego volvi a ejecutar `npm install`,

`"@types/express": "^4.17.21"`

Luego vuelvo a ejecutar `npm install` para reinstalar las dependencias.

---
