# Backend para la app de Ucabture
[![Build Status](https://travis-ci.org/leolas95/ucabture.svg?branch=master)](https://travis-ci.org/leolas95/ucabture)

![Logo](iso.png)

# Primero tener instalado:

* node (v10.12.0)
* npm (v6.4.1)
* git

1. Clonar el repo:

```
git clone https://github.com/leolas95/ucabture
```

2. Ir al directorio donde lo descargaron, y ejecutar:

```
npm install
```

para instalar las dependencias.

3. En el directorio raiz del proyecto, crear el archivo `.dotenv` con las variables de entorno:
```
# Host donde se almacena la base de datos. Si es en local, es localhost
DB_HOST=localhost
# Puerto donde esta ejecutandose el servidor de la base de datos. En mongo por defecto es 27017
DB_PORT=27017
# Nombre de la base de datos de desarrollo
DB_DEVDB=expresateucabdb
# Nombre de la base de datos de pruebas
DB_TESTDB=expresateucabtestdb
# Entorno de ejecucion: production, qa, dev
NODE_ENV=dev
```

4. Para iniciar el servidor:
```
npm start
```

5. Para ejecutar las pruebas:

```
npm test
```

# Estructura de la app

* `db/`: Directorio con los archivos de configuracion de la base de datos
* `routes/`: Directorio con las rutas que maneja el backend
* `schemas/`: Directorio con los esquemas de los modelos de la base de datos
* `tests/`: Directorio con los archivos para realizar las pruebas
* `app.js`: Archivo principal que arranca el servidor
* `config/`: Directorio donde estan las configuraciones para funcionalidades comunes, como la de subir imagenes

# Endpoints

URL base: https://ucabture.herokuapp.com/

METODO | RUTA | DESCRIPCION | FORM ENCODING | PARAMETROS | RETORNO EXITO | RETORNO ERROR
-------|-------|------------|-----------| ---------------|-------------- | --------------
GET | /:username/feed | Obtiene el feed de imagenes del usuario :username | N/A | **username**: el nombre de usuario (Ej: pedrito123) | 200 | 404 si el usuario no existe<br/>
POST | /signup | Endpoint para crear un nuevo usuario. | application/x-www-form-urlencoded | <br/> **name**: el nombre real del usuario<br/> **lastname**: el apellido real del usuario<br/> **username**: el nombre de usuario (unico dentro del sistema)<br/> **password**: la clave de acceso del usuario<br/> **email**: correo electronico del usuario<br/> **group**: El grupo al que pertenece el usuario. Debe ser uno de: _estudiantes, proftcompleto, proftconvencional, empleados, egresados_ | 201 | 400 si el usuario ya existe
POST | /upload | Sube una nueva imagen al servidor | multipart/form-data | **description**: La descripcion de la imagen<br/> **emoji**: La calificacion dada a la imagen, del 1 al 5, donde 1 es mala calificacion, y 5 es la mejor calificacion<br/> **lat**: latitud de donde fue tomada la imagen<br/> **lng**: longitud de donde fue tomada la imagen<br/> **date**: Fecha en que fue tomada la imagen, en formato UNIX Timestamp, en milisegundos<br/> **username**: nombre de usuario del usuario que sube la imagen<br/> **image**: la imagen propiamente dicha (recordar que debe ser el ultimo parametro) | 201 | 404 si el usuario no existe
POST | /login | Permite iniciar sesion en el sistema | application/x-www-form-urlencoded | **username**: nombre de usuario<br/> **password**: clave del usuario | 200 | 400 si la clave es incorrecta o el usuario no existe<br/>
GET | / | Obtiene todos los usuarios | N/A | N/A | 200 | N/A
POST | /admins/login | Permite que un administrador inicie sesion | application/x-www-form-urlencoded | **username**: El nombre de usuario del administrador<br/> **password**: La clave de acceso del administrador | 200 | 400 si los campos estan vacios, o la clave ingresada es invalida<br/> 404 si el administrador no esta registrado.
POST | /admins/signup | Registrar un nuevo administrador | application/x-www-form-urlencoded | **name**: nombre real del administrador<br/> **lastname**: apellido<br/> **username**: nombre de usuario del administrador<br/> **password**: la clave de acceso del administrador | 200 | 400 si el username esta ocupado<br/>
POST | /admins/bcast | Difunde una nueva publicacion a los usuarios | multipart/form-data | **title**: El titulo de la publicacion<br/> **description**: El mensaje descriptivo de la publicacion<br/> **groups**: Una lista de los grupos a quienes se les desea difundir la publicacion, en minusculas y separados por coma. Ej: proftcompleto,empleados<br/> **username**: el nombre de usuario del administrador que realiza la difusion<br/> **image**: La imagen de la difusion | 201 si la difusion tuvo exito | 404 si el administrador indicado no existe<br/>
GET | /admins/resume | Obtiene el resumen de publicaciones hechos por los usuarios, que se le muestra al admin | N/A | N/A | 200 | N/A<br/>
GET | /admins/:username/record | Obtiene el historial de publicaciones hechos por el admin :username | N/A | **username**: El nombre de usuario del admin | 200 | 404 si el admin no existe<br/>
GET | /admins | Obtiene todos los administradores | N/A | N/A | 200 | N/A